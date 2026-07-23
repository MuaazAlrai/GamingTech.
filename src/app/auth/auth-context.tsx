import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { logStaffActivity } from "../utils/staff-activity";
import type { AppUser } from "../types/app-user";
import { allPermissions, defaultEmployeePermissions } from "./permissions";
import type { PermissionKey } from "./permissions";

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

const readUsers = (): AppUser[] => {
  try {
    return JSON.parse(localStorage.getItem(usersKey) || "[]") as AppUser[];
  } catch {
    return [];
  }
};

const writeUsers = (users: AppUser[]) => localStorage.setItem(usersKey, JSON.stringify(users));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (nextUser?.email) {
        const email = nextUser.email.toLowerCase();
        const users = readUsers();
        const existing = users.find((item) => item.email.toLowerCase() === email);
        const isSuperAdmin = email === adminEmail;
        const profile: AppUser = existing ?? {
          id: nextUser.uid,
          uid: nextUser.uid,
          fullName: nextUser.displayName || (isSuperAdmin ? "Super Admin" : "Employee"),
          username: email.split("@")[0],
          email,
          phone: nextUser.phoneNumber || "",
          designation: isSuperAdmin ? "Super Admin" : "Employee",
          status: "active",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          photoUrl: nextUser.photoURL || "",
          permissions: isSuperAdmin ? allPermissions : defaultEmployeePermissions,
          isSuperAdmin,
        };
        const normalized = {
          ...profile,
          uid: nextUser.uid,
          lastLogin: new Date().toISOString(),
          photoUrl: profile.photoUrl || nextUser.photoURL || "",
          isSuperAdmin,
          permissions: isSuperAdmin ? allPermissions : profile.permissions,
        };
        writeUsers(existing ? users.map((item) => item.id === existing.id ? normalized : item) : [normalized, ...users]);
        setAppUser(normalized);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
