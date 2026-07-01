import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/root-layout";
import { Dashboard } from "./pages/dashboard";
import { Login } from "./pages/auth/login";
import { Register } from "./pages/auth/register";
import { ForgotPassword } from "./pages/auth/forgot-password";
import { RepairTickets } from "./pages/repairs/repair-tickets";
import { CreateRepairTicket } from "./pages/repairs/create-repair-ticket";
import { RepairDetails } from "./pages/repairs/repair-details";
import { PartsInventory } from "./pages/parts/parts-inventory";
import { PartDetails } from "./pages/parts/part-details";
import { InventoryDashboard } from "./pages/inventory/inventory-dashboard";
import { CustomerDirectory } from "./pages/customers/customer-directory";
import { CustomerProfile } from "./pages/customers/customer-profile";
import { POSDashboard } from "./pages/pos/pos-dashboard";
import { NewSale } from "./pages/pos/new-sale";
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
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "repairs",
        Component: RepairTickets,
      },
      {
        path: "repairs/create",
        Component: CreateRepairTicket,
      },
      {
        path: "repairs/:id",
        Component: RepairDetails,
      },
      {
        path: "parts",
        Component: PartsInventory,
      },
      {
        path: "parts/:id",
        Component: PartDetails,
      },
      {
        path: "inventory",
        Component: InventoryDashboard,
      },
      {
        path: "customers",
        Component: CustomerDirectory,
      },
      {
        path: "customers/:id",
        Component: CustomerProfile,
      },
      {
        path: "pos",
        Component: POSDashboard,
      },
      {
        path: "pos/new-sale",
        Component: NewSale,
      },
      {
        path: "billing",
        Component: BillingDashboard,
      },
      {
        path: "finance",
        Component: FinanceDashboard,
      },
      {
        path: "reports",
        Component: Reports,
      },
      {
        path: "settings",
        Component: Settings,
      },
      {
        path: "profile",
        Component: UserProfile,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
