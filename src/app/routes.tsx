import { createBrowserRouter } from "react-router";
import { ProtectedRootLayout } from "./auth/protected-root-layout";
import { AdminOnly } from "./auth/admin-only";
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
import { GpuGallery } from "./pages/inventory/gpu-gallery";
import { GpuStatusBoard } from "./pages/inventory/gpu-status-board";
import { GpuTimeline } from "./pages/inventory/gpu-timeline";
import { CustomerDirectory } from "./pages/customers/customer-directory";
import { CustomerProfile } from "./pages/customers/customer-profile";
import { POSDashboard } from "./pages/pos/pos-dashboard";
import { NewSale } from "./pages/pos/new-sale";
import { SalesHistory } from "./pages/pos/sales-history";
import { SalesReport } from "./pages/pos/sales-report";
import { BillingDashboard } from "./pages/billing/billing-dashboard";
import { FinanceDashboard } from "./pages/finance/finance-dashboard";
import { Reports } from "./pages/reports/reports";
import { Settings } from "./pages/settings/settings";
import { UserProfile } from "./pages/profile/user-profile";
import { NotFound } from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: ProtectedRootLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      { path: "repairs", Component: RepairTickets },
      { path: "repairs/:id", Component: RepairDetails },
      { path: "parts", Component: PartsInventory },
      { path: "parts/:id", Component: PartDetails },
      { path: "customers", Component: CustomerDirectory },
      { path: "customers/:id", Component: CustomerProfile },
      { path: "repairs/create", Component: CreateRepairTicket },
      { path: "inventory", Component: InventoryDashboard },
      { path: "inventory/status-board", Component: GpuStatusBoard },
      { path: "inventory/timeline", Component: GpuTimeline },
      { path: "inventory/gallery", Component: GpuGallery },
      { path: "profile", Component: UserProfile },
      {
        Component: AdminOnly,
        children: [
      { path: "pos", Component: POSDashboard },
      { path: "pos/new-sale", Component: NewSale },
      { path: "pos/sales-history", Component: SalesHistory },
      { path: "pos/reports", Component: SalesReport },
      { path: "billing", Component: BillingDashboard },
      { path: "reports", Component: Reports },
      {
        path: "finance",
        Component: FinanceDashboard,
      },
      {
        path: "settings",
        Component: Settings,
      },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
