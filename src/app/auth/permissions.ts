import {
  Boxes,
  FileText,
  LayoutDashboard,
  ShoppingCart,
  UserCog,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";

export type PermissionKey =
  | "dashboard.view"
  | "repairs.view" | "repairs.create" | "repairs.edit" | "repairs.delete" | "repairs.print" | "repairs.manage"
  | "inventory.view" | "inventory.create" | "inventory.edit" | "inventory.delete" | "inventory.print" | "inventory.export" | "inventory.manage"
  | "customers.view" | "customers.create" | "customers.edit" | "customers.delete" | "customers.print" | "customers.export"
  | "suppliers.view" | "suppliers.create" | "suppliers.edit" | "suppliers.delete"
  | "sales.view" | "sales.create" | "sales.edit" | "sales.delete" | "sales.print" | "sales.receivePayment" | "sales.export" | "sales.manage"
  | "purchases.view" | "purchases.create" | "purchases.edit" | "purchases.delete" | "purchases.approve"
  | "expenses.view" | "expenses.create" | "expenses.edit" | "expenses.delete" | "expenses.approve"
  | "billing.view" | "billing.create" | "billing.edit" | "billing.delete" | "billing.print" | "billing.receivePayment"
  | "reports.view" | "reports.export" | "reports.print"
  | "finance.view" | "finance.create" | "finance.edit" | "finance.delete" | "finance.export" | "finance.manage"
  | "settings.view" | "settings.edit"
  | "users.view" | "users.create" | "users.edit" | "users.delete" | "users.assignPermissions" | "users.resetPassword"
  | "profile.view";

export type PermissionModule = {
  id: string;
  label: string;
  description: string;
  permissions: { key: PermissionKey; label: string }[];
};

export const permissionModules: PermissionModule[] = [
  { id: "dashboard", label: "Dashboard", description: "Overview and business metrics", permissions: [{ key: "dashboard.view", label: "View" }] },
  { id: "repairs", label: "Repairs", description: "Repair tickets and device workflow", permissions: [
    { key: "repairs.view", label: "View" }, { key: "repairs.create", label: "Create" }, { key: "repairs.edit", label: "Edit" }, { key: "repairs.delete", label: "Delete" }, { key: "repairs.print", label: "Print" }, { key: "repairs.manage", label: "Manage Status" },
  ] },
  { id: "inventory", label: "Inventory", description: "Products, stock, GPU records and adjustments", permissions: [
    { key: "inventory.view", label: "View" }, { key: "inventory.create", label: "Create" }, { key: "inventory.edit", label: "Edit" }, { key: "inventory.delete", label: "Delete" }, { key: "inventory.print", label: "Print" }, { key: "inventory.export", label: "Export" }, { key: "inventory.manage", label: "Manage Stock" },
  ] },
  { id: "customers", label: "Customers", description: "Customer profiles and ledgers", permissions: [
    { key: "customers.view", label: "View" }, { key: "customers.create", label: "Create" }, { key: "customers.edit", label: "Edit" }, { key: "customers.delete", label: "Delete" }, { key: "customers.print", label: "Print" }, { key: "customers.export", label: "Export" },
  ] },
  { id: "sales", label: "Sales POS", description: "POS, sales history and payments", permissions: [
    { key: "sales.view", label: "View" }, { key: "sales.create", label: "Create Sale" }, { key: "sales.edit", label: "Edit Sale" }, { key: "sales.delete", label: "Delete Sale" }, { key: "sales.print", label: "Print Invoice" }, { key: "sales.receivePayment", label: "Receive Payment" }, { key: "sales.export", label: "Export" }, { key: "sales.manage", label: "Manage" },
  ] },
  { id: "expenses", label: "Expenses", description: "Expense records and approvals", permissions: [
    { key: "expenses.view", label: "View" }, { key: "expenses.create", label: "Create" }, { key: "expenses.edit", label: "Edit" }, { key: "expenses.delete", label: "Delete" }, { key: "expenses.approve", label: "Approve" },
  ] },
  { id: "billing", label: "Billing", description: "Invoices and payment collection", permissions: [
    { key: "billing.view", label: "View" }, { key: "billing.create", label: "Create" }, { key: "billing.edit", label: "Edit" }, { key: "billing.delete", label: "Delete" }, { key: "billing.print", label: "Print" }, { key: "billing.receivePayment", label: "Receive Payment" },
  ] },
  { id: "reports", label: "Reports", description: "Business reporting", permissions: [
    { key: "reports.view", label: "View" }, { key: "reports.export", label: "Export" }, { key: "reports.print", label: "Print" },
  ] },
  { id: "settings", label: "Settings", description: "System settings", permissions: [
    { key: "settings.view", label: "View" }, { key: "settings.edit", label: "Edit" },
  ] },
  { id: "users", label: "User Management", description: "Users and permissions", permissions: [
    { key: "users.view", label: "View" }, { key: "users.create", label: "Create User" }, { key: "users.edit", label: "Edit User" }, { key: "users.delete", label: "Delete User" }, { key: "users.assignPermissions", label: "Assign Permissions" }, { key: "users.resetPassword", label: "Reset Password" },
  ] },
  { id: "profile", label: "Profile", description: "Own profile", permissions: [{ key: "profile.view", label: "View" }] },
];

export const allPermissions = permissionModules.flatMap((module) => module.permissions.map((permission) => permission.key));

export const defaultEmployeePermissions: PermissionKey[] = [
  "dashboard.view",
  "repairs.view",
  "repairs.create",
  "repairs.edit",
  "inventory.view",
  "inventory.create",
  "inventory.edit",
  "customers.view",
  "customers.create",
  "customers.edit",
  "sales.view",
  "sales.create",
  "sales.print",
  "sales.receivePayment",
  "profile.view",
];

export const appNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: "dashboard.view" as PermissionKey },
  { name: "Repairs", href: "/repairs", icon: Wrench, permission: "repairs.view" as PermissionKey },
  { name: "Inventory", href: "/inventory", icon: Boxes, permission: "inventory.view" as PermissionKey },
  { name: "Customers", href: "/customers", icon: Users, permission: "customers.view" as PermissionKey },
  { name: "POS", href: "/pos", icon: ShoppingCart, permission: "sales.view" as PermissionKey },
  { name: "Billing", href: "/billing", icon: FileText, permission: "billing.view" as PermissionKey },
  { name: "Reports", href: "/reports", icon: FileText, permission: "reports.view" as PermissionKey },
  { name: "Users", href: "/users", icon: UserCog, permission: "users.view" as PermissionKey },
  { name: "Profile", href: "/profile", icon: UserRound, permission: "profile.view" as PermissionKey },
];

export const routePermissions: Record<string, PermissionKey> = {
  "/": "dashboard.view",
  "/repairs": "repairs.view",
  "/repairs/create": "repairs.create",
  "/inventory": "inventory.view",
  "/customers": "customers.view",
  "/pos": "sales.view",
  "/pos/sale": "sales.create",
  "/pos/new-sale": "sales.create",
  "/pos/sales-history": "sales.view",
  "/pos/reports": "reports.view",
  "/pos/staff-security": "sales.manage",
  "/billing": "billing.view",
  "/reports": "reports.view",
  "/finance": "finance.view",
  "/settings": "settings.view",
  "/users": "users.view",
  "/profile": "profile.view",
};
