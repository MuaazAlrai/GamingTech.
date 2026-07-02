import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  role: "admin" | "employee" | null;
  isAdmin: boolean;
};

const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "admin@gamingtech.pk")
  .trim()
  .toLowerCase();

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const role = user
    ? user.email?.toLowerCase() === adminEmail
      ? "admin"
      : "employee"
    : null;
  const value = useMemo(
    () => ({ user, loading, role, isAdmin: role === "admin" }),
    [user, loading, role],
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
