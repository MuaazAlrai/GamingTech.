import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export function removeUndefinedFields<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => removeUndefinedFields(item)) as T;
  }

  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefinedFields(item)]),
    ) as T;
  }

  return input;
}

export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return initialValue;
    }

    try {
      return JSON.parse(storedValue) as T;
    } catch {
      return initialValue;
    }
  });
  const mountedRef = useRef(false);
  const applyingRemoteValueRef = useRef(false);
  const storageKey = key.replace(/\./g, "_");

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return;

      try {
        applyingRemoteValueRef.current = true;
        setValue(JSON.parse(event.newValue) as T);
      } catch {
        applyingRemoteValueRef.current = false;
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "appState", storageKey),
      (snapshot) => {
        const remoteValue = snapshot.data()?.value as T | undefined;
        if (remoteValue === undefined) return;

        applyingRemoteValueRef.current = true;
        setValue(remoteValue);
      },
      (error) => {
        console.warn(`Unable to sync ${key} from Firestore`, error);
      },
    );

    return unsubscribe;
  }, [key, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const safeValue = removeUndefinedFields(value);
    window.localStorage.setItem(key, JSON.stringify(safeValue));

    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    if (applyingRemoteValueRef.current) {
      applyingRemoteValueRef.current = false;
      return;
    }

    setDoc(
      doc(db, "appState", storageKey),
      { key, value: safeValue, updatedAt: serverTimestamp() },
      { merge: true },
    ).catch((error) => {
      console.warn(`Unable to sync ${key} to Firestore`, error);
    });
  }, [key, storageKey, value]);

  return [value, setValue as Dispatch<SetStateAction<T>>] as const;
}
