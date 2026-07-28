import type { RepairTicket, RepairTimelineEvent } from "../types/repair-ticket";

export const repairStatusLabels: Record<string, string> = {
  received: "Received",
  diagnosing: "Diagnosing",
  waiting_approval: "Waiting Approval",
  waiting_parts: "Waiting Parts",
  repairing: "Repairing",
  testing: "Testing",
  ready: "Ready for Pickup",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
  dead: "Cannot Be Repaired",
  scrap: "Cannot Be Repaired",
  pending: "Pending",
  to_return: "To Return",
};

export const repairStatusProgress: Record<string, number> = {
  received: 10,
  diagnosing: 25,
  waiting_approval: 35,
  waiting_parts: 45,
  repairing: 60,
  testing: 80,
  ready: 95,
  to_return: 90,
  completed: 100,
  delivered: 100,
  cancelled: 100,
  dead: 100,
  scrap: 100,
  pending: 20,
};

export const inactiveRepairStatuses = new Set(["completed", "ready", "delivered", "cancelled", "dead", "scrap"]);

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
