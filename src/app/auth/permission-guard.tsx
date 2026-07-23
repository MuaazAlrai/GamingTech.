import { Navigate, Outlet, useLocation } from "react-router";
import type { PermissionKey } from "./permissions";
import { useAuth } from "./auth-context";

export function PermissionGuard({ permission }: { permission: PermissionKey }) {
  const { loading, user, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return hasPermission(permission) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}

export function Can({ permission, children }: { permission: PermissionKey; children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : null;
}
