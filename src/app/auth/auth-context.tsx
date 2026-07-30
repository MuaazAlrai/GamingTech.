import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { logStaffActivity } from "../utils/staff-activity";
import type { AppUser } from "../types/app-user";
import { allPermissions, defaultEmployeePermissions } from "./permissions";
import type { PermissionKey } from "./permissions";
import { removeUndefinedFields } from "../hooks/use-persistent-state";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  role: "admin" | "employee" | null;
  isAdmin: boolean;
  appUser: AppUser | null;
  permissions: PermissionKey[];
  hasPermission: (permission: PermissionKey) => boolean;
};

const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "admin@gamingtech.pk")
  .trim()
  .toLowerCase();

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const usersKey = "gamingtech.users";
const deletedUsersKey = "gamingtech.deletedUsers";
const usersStateDoc = doc(db, "appState", "gamingtech_users");

const readUsers = (): AppUser[] => {
  try {
    return JSON.parse(localStorage.getItem(usersKey) || "[]") as AppUser[];
  } catch {
    return [];
  }
};

const writeUsers = (users: AppUser[]) => localStorage.setItem(usersKey, JSON.stringify(removeUndefinedFields(users)));

const syncUsers = (users: AppUser[]) => {
  setDoc(
    usersStateDoc,
    { key: usersKey, value: removeUndefinedFields(users), updatedAt: serverTimestamp() },
    { merge: true },
  ).catch((error) => {
    console.warn("Unable to sync users to Firestore", error);
  });
};

const readDeletedUsers = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(deletedUsersKey) || "[]") as string[];
  } catch {
    return [];
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [usersReady, setUsersReady] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<AppUser[]>(() => readUsers());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      usersStateDoc,
      (snapshot) => {
        const users = (snapshot.data()?.value as AppUser[] | undefined) ?? readUsers();
        setRemoteUsers(users);
        writeUsers(users);
        setUsersReady(true);
      },
      (error) => {
        console.warn("Unable to load users from Firestore", error);
        setRemoteUsers(readUsers());
        setUsersReady(true);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authReady || !usersReady) return;

    if (!user?.email) {
      setAppUser(null);
      return;
    }

    const email = user.email.toLowerCase();
    if (readDeletedUsers().includes(email)) {
      auth.signOut();
      setAppUser(null);
      return;
    }

    const existing = remoteUsers.find((item) => item.email.toLowerCase() === email);
    const isSuperAdmin = email === adminEmail;
    const profile: AppUser = existing ?? {
      id: user.uid,
      uid: user.uid,
      fullName: user.displayName || (isSuperAdmin ? "Super Admin" : "Employee"),
      username: email.split("@")[0],
      email,
      phone: user.phoneNumber || "",
      designation: isSuperAdmin ? "Super Admin" : "Employee",
      staffRole: isSuperAdmin ? "admin" : "employee",
      status: "active",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      photoUrl: user.photoURL || "",
      permissions: isSuperAdmin ? allPermissions : defaultEmployeePermissions,
      isSuperAdmin,
    };
    const normalized: AppUser = {
      ...profile,
      uid: user.uid,
      lastLogin: new Date().toISOString(),
      photoUrl: profile.photoUrl || user.photoURL || "",
      isSuperAdmin,
      permissions: isSuperAdmin ? allPermissions : profile.permissions,
    };
    const nextUsers = existing
      ? remoteUsers.map((item) => item.id === existing.id ? normalized : item)
      : [normalized, ...remoteUsers];

    writeUsers(nextUsers);
    syncUsers(nextUsers);
    setRemoteUsers(nextUsers);
    setAppUser(normalized);
  }, [authReady, usersReady, user]);

  const role = user
    ? user.email?.toLowerCase() === adminEmail
      ? "admin"
      : "employee"
    : null;
  const permissions = user?.email?.toLowerCase() === adminEmail ? allPermissions : appUser?.permissions ?? [];
  const hasPermission = (permission: PermissionKey) => user?.email?.toLowerCase() === adminEmail || permissions.includes(permission);

  useEffect(() => {
    if (!user || !role) return;
    if (appUser?.status === "inactive") {
      auth.signOut();
      return;
    }
    const marker = `gamingtech.loginLogged.${user.uid}`;
    if (sessionStorage.getItem(marker)) return;
    logStaffActivity(user, role, "auth.login", "User signed in");
    sessionStorage.setItem(marker, "1");
  }, [user, role, appUser?.status]);
  const loading = !authReady || !usersReady;
  const value = useMemo(
    () => ({ user, loading, role, isAdmin: role === "admin", appUser, permissions, hasPermission }),
    [user, loading, role, appUser, permissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
