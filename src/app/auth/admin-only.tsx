import { Navigate, Outlet } from "react-router";
import { useAuth } from "./auth-context";

export function AdminOnly() {
  const { isAdmin } = useAuth();

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
