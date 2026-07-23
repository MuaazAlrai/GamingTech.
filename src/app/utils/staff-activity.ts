import type { StaffActivity } from "../types/staff";

type ActivityUser = { uid: string; displayName: string | null; email: string | null };

export function logStaffActivity(user: ActivityUser | null, role: "admin" | "employee" | null, action: string, details: string, reference?: string) {
  if (!user || !role) return;
  const key = "gamingtech.staffActivities";
  let current: StaffActivity[] = [];
  try { current = JSON.parse(localStorage.getItem(key) ?? "[]") as StaffActivity[]; } catch { current = []; }
  const entry: StaffActivity = { id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: new Date().toISOString(), userId: user.uid, userName: user.displayName || user.email || "Staff", role, action, details, reference };
  localStorage.setItem(key, JSON.stringify([entry, ...current].slice(0, 2000)));
  window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify([entry, ...current]) }));
}
