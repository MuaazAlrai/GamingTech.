import type { RepairTicket, RepairTimelineEvent } from "../types/repair-ticket";

export const repairStatusLabels: Record<string, string> = {
  received: "Received",
  initial_inspection: "Initial Inspection",
  diagnosing: "Awaiting Diagnosis",
  diagnosis_completed: "Diagnosis Completed",
  waiting_approval: "Awaiting Customer Approval",
  approved: "Approved",
  waiting_parts: "Waiting Parts",
  repairing: "Repair In Progress",
  testing: "Testing",
  completed: "Repair Completed",
  ready: "Ready for Pickup",
  delivered: "Delivered",
  on_hold: "On Hold",
  cancelled: "Cancelled",
  dead: "Cannot Be Repaired",
  scrap: "Cannot Be Repaired",
  pending: "Pending",
  to_return: "To Return",
};

export const repairStatusProgress: Record<string, number> = {
  received: 5,
  initial_inspection: 10,
  diagnosing: 15,
  diagnosis_completed: 25,
  waiting_approval: 30,
  approved: 35,
  waiting_parts: 45,
  repairing: 60,
  testing: 80,
  completed: 90,
  ready: 100,
  delivered: 100,
  on_hold: 50,
  cancelled: 0,
  dead: 100,
  scrap: 100,
  pending: 20,
  to_return: 90,
};

export const inactiveRepairStatuses = new Set(["completed", "delivered", "cancelled", "dead", "scrap"]);

export const repairStatusOptions = [
  "received",
  "initial_inspection",
  "diagnosing",
  "diagnosis_completed",
  "waiting_approval",
  "approved",
  "waiting_parts",
  "repairing",
  "testing",
  "completed",
  "ready",
  "delivered",
  "on_hold",
  "cancelled",
  "dead",
  "scrap",
] as const;

export const labelForRepairStatus = (status: string) => repairStatusLabels[status] ?? status.replace(/_/g, " ");

export const progressForRepairStatus = (status: string) => repairStatusProgress[status] ?? 20;

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const parseDueDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export type RepairDueState = {
  days: number | null;
  label: string;
  tone: "neutral" | "success" | "warning" | "destructive" | "muted";
  isOverdue: boolean;
  isDueToday: boolean;
  isDueTomorrow: boolean;
  isWithinThreeDays: boolean;
};

export function getRepairDueState(ticket: RepairTicket, today = startOfToday()): RepairDueState {
  const status = ticket.status;

  if (status === "completed") {
    return { days: null, label: "Repair completed", tone: "success", isOverdue: false, isDueToday: false, isDueTomorrow: false, isWithinThreeDays: false };
  }
  if (status === "ready") {
    return { days: null, label: "Ready for pickup", tone: "success", isOverdue: false, isDueToday: false, isDueTomorrow: false, isWithinThreeDays: false };
  }
  if (status === "delivered") {
    return { days: null, label: "Delivered", tone: "muted", isOverdue: false, isDueToday: false, isDueTomorrow: false, isWithinThreeDays: false };
  }
  if (["cancelled", "dead", "scrap"].includes(status)) {
    return { days: null, label: labelForRepairStatus(status), tone: "muted", isOverdue: false, isDueToday: false, isDueTomorrow: false, isWithinThreeDays: false };
  }

  const dueDate = parseDueDate(ticket.estimatedCompletion);
  if (!dueDate) {
    return { days: null, label: "No expected return date", tone: "neutral", isOverdue: false, isDueToday: false, isDueTomorrow: false, isWithinThreeDays: false };
  }

  const days = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
  if (days < 0) {
    return { days, label: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`, tone: "destructive", isOverdue: true, isDueToday: false, isDueTomorrow: false, isWithinThreeDays: false };
  }
  if (days === 0) {
    return { days, label: "Due today", tone: "warning", isOverdue: false, isDueToday: true, isDueTomorrow: false, isWithinThreeDays: true };
  }
  if (days === 1) {
    return { days, label: "Due tomorrow", tone: "warning", isOverdue: false, isDueToday: false, isDueTomorrow: true, isWithinThreeDays: true };
  }

  return { days, label: `${days} days remaining`, tone: days <= 3 ? "warning" : "neutral", isOverdue: false, isDueToday: false, isDueTomorrow: false, isWithinThreeDays: days <= 3 };
}

export function getTimelineProgress(event: RepairTimelineEvent) {
  return event.progress ?? progressForRepairStatus(event.status);
}
