import { Navigate, createBrowserRouter } from "react-router";
import { ProtectedRootLayout } from "./auth/protected-root-layout";
import { PermissionGuard } from "./auth/permission-guard";
import { Dashboard } from "./pages/dashboard";
import { Login } from "./pages/auth/login";
import { ForgotPassword } from "./pages/auth/forgot-password";
import { Register } from "./pages/auth/register";
import { RepairTickets } from "./pages/repairs/repair-tickets";
import { CreateRepairTicket } from "./pages/repairs/create-repair-ticket";
import { RepairDetails } from "./pages/repairs/repair-details";
import { PartsInventory } from "./pages/parts/parts-inventory";
import { PartDetails } from "./pages/parts/part-details";
import { InventoryDashboard } from "./pages/inventory/inventory-dashboard";
import { GpuTimeline } from "./pages/inventory/gpu-timeline";
import { CustomerDirectory } from "./pages/customers/customer-directory";
import { CustomerProfile } from "./pages/customers/customer-profile";
import { POSHome } from "./pages/pos/pos-home";
import { NewSale } from "./pages/pos/new-sale";
import { SalesHistory } from "./pages/pos/sales-history";
import { SalesReport } from "./pages/pos/sales-report";
import { StaffSecurity } from "./pages/pos/staff-security";
import { BillingDashboard } from "./pages/billing/billing-dashboard";
import { FinanceDashboard } from "./pages/finance/finance-dashboard";
import { Reports } from "./pages/reports/reports";
import { Settings } from "./pages/settings/settings";
import { UserProfile } from "./pages/profile/user-profile";
import { UserManagement } from "./pages/users/user-management";
import { Unauthorized } from "./pages/unauthorized";
import { NotFound } from "./pages/not-found";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/forgot-password", Component: ForgotPassword },
  { path: "/register", element: <Navigate to="/login" replace /> },
  {
    path: "/",
    Component: ProtectedRootLayout,
    children: [
      { element: <PermissionGuard permission="dashboard.view" />, children: [{ index: true, Component: Dashboard }] },
      { path: "unauthorized", Component: Unauthorized },
      { path: "parts", element: <Navigate to="/inventory" replace /> },
      { path: "parts/:id", element: <PermissionGuard permission="inventory.view" />, children: [{ index: true, Component: PartDetails }] },
      { path: "repairs", element: <PermissionGuard permission="repairs.view" />, children: [{ index: true, Component: RepairTickets }] },
      { path: "repairs/create", element: <PermissionGuard permission="repairs.create" />, children: [{ index: true, Component: CreateRepairTicket }] },
      { path: "repairs/:id", element: <PermissionGuard permission="repairs.view" />, children: [{ index: true, Component: RepairDetails }] },
      { path: "customers", element: <PermissionGuard permission="customers.view" />, children: [{ index: true, Component: CustomerDirectory }] },
      { path: "customers/:id", element: <PermissionGuard permission="customers.view" />, children: [{ index: true, Component: CustomerProfile }] },
      { path: "inventory", element: <PermissionGuard permission="inventory.view" />, children: [{ index: true, Component: PartsInventory }] },
      { path: "inventory/gpu", element: <PermissionGuard permission="inventory.view" />, children: [{ index: true, Component: InventoryDashboard }] },
      { path: "inventory/timeline", element: <PermissionGuard permission="inventory.view" />, children: [{ index: true, Component: GpuTimeline }] },
      { path: "inventory/status-board", element: <Navigate to="/inventory" replace /> },
      { path: "inventory/gallery", element: <Navigate to="/inventory" replace /> },
      { path: "inventory/:id", element: <PermissionGuard permission="inventory.view" />, children: [{ index: true, Component: PartDetails }] },
      { path: "profile", element: <PermissionGuard permission="profile.view" />, children: [{ index: true, Component: UserProfile }] },
      { path: "pos", element: <PermissionGuard permission="sales.view" />, children: [{ index: true, Component: POSHome }] },
      { path: "pos/sale", element: <PermissionGuard permission="sales.create" />, children: [{ index: true, Component: NewSale }] },
      { path: "pos/new-sale", element: <PermissionGuard permission="sales.create" />, children: [{ index: true, Component: NewSale }] },
      { path: "pos/sales-history", element: <PermissionGuard permission="sales.view" />, children: [{ index: true, Component: SalesHistory }] },
      { path: "pos/staff-security", element: <PermissionGuard permission="sales.manage" />, children: [{ index: true, Component: StaffSecurity }] },
      { path: "pos/reports", element: <PermissionGuard permission="reports.view" />, children: [{ index: true, Component: SalesReport }] },
      { path: "billing", element: <PermissionGuard permission="billing.view" />, children: [{ index: true, Component: BillingDashboard }] },
      { path: "reports", element: <PermissionGuard permission="reports.view" />, children: [{ index: true, Component: Reports }] },
      { path: "finance", element: <PermissionGuard permission="finance.view" />, children: [{ index: true, Component: FinanceDashboard }] },
      { path: "settings", element: <PermissionGuard permission="settings.view" />, children: [{ index: true, Component: Settings }] },
      { path: "users", element: <PermissionGuard permission="users.view" />, children: [{ index: true, Component: UserManagement }] },
      { path: "*", Component: NotFound },
    ],
  },
]);
