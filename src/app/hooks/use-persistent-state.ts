import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import { collection, doc, getDocs, onSnapshot, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
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

const collectionMirrors: Record<string, string> = {
  "gamingtech.customers": "customers",
  "gamingtech.posSales": "invoices",
  "gamingtech.repairTickets": "repairs",
};

function shouldMirrorRecord(key: string, record: unknown) {
  if (key !== "gamingtech.posSales") return true;
  return Boolean(record && typeof record === "object" && (((record as { invoiceType?: string }).invoiceType === "repair") || (record as { repairId?: string }).repairId));
}

async function syncCollectionMirror<T>(key: string, value: T) {
  const collectionName = collectionMirrors[key];
  if (!collectionName || !Array.isArray(value)) return;

  const batch = writeBatch(db);
  let writes = 0;

  for (const record of value) {
    if (!record || typeof record !== "object" || !("id" in record) || typeof (record as { id?: unknown }).id !== "string") continue;
    if (!shouldMirrorRecord(key, record)) continue;
    batch.set(
      doc(db, collectionName, (record as { id: string }).id),
      { ...removeUndefinedFields(record), syncedFrom: key, updatedAt: serverTimestamp() },
      { merge: true },
    );
    writes += 1;
  }

  if (writes) await batch.commit();
}

async function readCollectionMirror<T>(key: string, fallback: T) {
  const collectionName = collectionMirrors[key];
  if (!collectionName || !Array.isArray(fallback)) return undefined;

  const snapshot = await getDocs(collection(db, collectionName));
  const records = snapshot.docs.map((item) => {
    const data = item.data();
    const { updatedAt, syncedFrom, ...rest } = data;
    void updatedAt;
    void syncedFrom;
    return { id: item.id, ...rest };
  });

  return records.length ? records as T : undefined;
}

export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const mountedRef = useRef(false);
  const applyingRemoteValueRef = useRef(false);
  const storageKey = key.replace(/\./g, "_");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "appState", storageKey),
      async (snapshot) => {
        const remoteValue = snapshot.data()?.value as T | undefined;
        if (remoteValue === undefined) {
          const mirroredValue = await readCollectionMirror(key, initialValue);
          if (mirroredValue === undefined) return;
          applyingRemoteValueRef.current = true;
          setValue(mirroredValue);
          return;
        }

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
    const safeValue = removeUndefinedFields(value);

    if (!mountedRef.current) {
      mountedRef.current = true;
      syncCollectionMirror(key, safeValue).catch((error) => {
        console.warn(`Unable to sync ${key} collection mirror to Firestore`, error);
      });
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
    ).then(() => syncCollectionMirror(key, safeValue)).catch((error) => {
      console.warn(`Unable to sync ${key} to Firestore`, error);
    });
  }, [key, storageKey, value]);

  return [value, setValue as Dispatch<SetStateAction<T>>] as const;
}
