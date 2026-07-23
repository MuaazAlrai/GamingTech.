import type { PermissionKey } from "../auth/permissions";

export type AppUserStatus = "active" | "inactive";

export type AppUser = {
  id: string;
  uid?: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  designation: string;
  status: AppUserStatus;
  createdAt: string;
  lastLogin?: string;
  photoUrl?: string;
  permissions: PermissionKey[];
  isSuperAdmin?: boolean;
};
