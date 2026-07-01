import { Navigate } from "react-router";
import { RootLayout } from "../layouts/root-layout";
import { useAuth } from "./auth-context";

export function ProtectedRootLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <RootLayout />;
}
