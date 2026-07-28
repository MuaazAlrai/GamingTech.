import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Search,
  Plus,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Printer,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { RepairTicket } from "../../types/repair-ticket";
import { printRepairLabel } from "../../utils/print-repair-label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../auth/auth-context";
import { getRepairDueState, inactiveRepairStatuses, labelForRepairStatus, progressForRepairStatus, repairStatusOptions } from "../../utils/repair-status";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  received: { label: "Received", variant: "secondary", icon: Clock },
  initial_inspection: { label: "Initial Inspection", variant: "secondary", icon: Clock },
  diagnosing: { label: "Awaiting Diagnosis", variant: "default", icon: AlertCircle },
  diagnosis_completed: { label: "Diagnosis Completed", variant: "default", icon: CheckCircle2 },
  waiting_approval: { label: "Awaiting Customer Approval", variant: "outline", icon: Clock },
  approved: { label: "Approved", variant: "outline", icon: CheckCircle2 },
  waiting_parts: { label: "Waiting Parts", variant: "destructive", icon: XCircle },
  repairing: { label: "Repair In Progress", variant: "default", icon: AlertCircle },
  testing: { label: "Testing", variant: "default", icon: AlertCircle },
  ready: { label: "Ready", variant: "outline", icon: CheckCircle2 },
  delivered: { label: "Delivered", variant: "secondary", icon: CheckCircle2 },
  scrap: { label: "SCRAP", variant: "destructive", icon: XCircle },
  dead: { label: "Dead", variant: "destructive", icon: XCircle },
  pending: { label: "Pending", variant: "outline", icon: Clock },
  to_return: { label: "To Return", variant: "outline", icon: CheckCircle2 },
  completed: { label: "Repair Completed", variant: "secondary", icon: CheckCircle2 },
  on_hold: { label: "On Hold", variant: "outline", icon: Clock },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

const priorityColors: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
  urgent: "text-destructive",
};

const dueBadgeClasses = {
  neutral: "border-border bg-background text-foreground",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
};

const statusBadgeClasses: Record<string, string> = {
  completed: "border-success/30 bg-success/10 text-success",
  ready: "border-success/30 bg-success/20 text-success",
  delivered: "border-success/50 bg-success/10 text-success",
  cancelled: "border-border bg-muted text-muted-foreground",
  dead: "border-destructive/40 bg-destructive/10 text-destructive",
  scrap: "border-destructive/40 bg-destructive/10 text-destructive",
  received: "border-border bg-muted text-foreground",
  initial_inspection: "border-border bg-muted text-foreground",
  diagnosing: "border-cyan-400/40 bg-cyan-50 text-cyan-700",
  waiting_approval: "border-orange-400/40 bg-orange-50 text-orange-700",
  waiting_parts: "border-yellow-500/40 bg-yellow-50 text-yellow-800",
  repairing: "border-blue-500/40 bg-blue-50 text-blue-700",
  testing: "border-purple-500/40 bg-purple-50 text-purple-700",
  on_hold: "border-orange-400/40 bg-orange-50 text-orange-700",
};

const PAGE_SIZE = 50;

const repairViewFilters = [
  { value: "all", label: "All Repairs" },
  { value: "active", label: "Active Repairs" },
  { value: "received", label: "Received" },
  { value: "diagnosing", label: "Awaiting Diagnosis" },
  { value: "waiting_approval", label: "Awaiting Approval" },
  { value: "waiting_parts", label: "Awaiting Parts" },
  { value: "repairing", label: "Repair In Progress" },
  { value: "testing", label: "Testing" },
  { value: "completed", label: "Completed Repairs" },
  { value: "ready", label: "Ready for Pickup" },
  { value: "delivered", label: "Delivered Repairs" },
  { value: "overdue", label: "Overdue Repairs" },
  { value: "due_today", label: "Due Today" },
  { value: "due_3_days", label: "Due Within 3 Days" },
];

const paymentStatuses = ["paid", "partial", "unpaid"] as const;

const normalize = (value: unknown) => String(value ?? "").toLowerCase().trim();

const dateOnly = (value?: string) => value ? value.slice(0, 10) : "";

const repairTotal = (ticket: RepairTicket) => {
  if (ticket.invoiceItems?.length) return ticket.invoiceItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const partsTotal = (ticket.partsUsed ?? []).reduce((sum, part) => sum + part.quantity * part.cost, 0);
  const labourCharges = ticket.labourCharges ?? Math.max(0, ticket.amount - partsTotal);
  return Math.max(0, partsTotal + labourCharges - (ticket.discount ?? 0));
};

const repairPaid = (ticket: RepairTicket) =>
  (ticket.paidAmount ?? 0) + (ticket.payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);

const paymentStatusFor = (ticket: RepairTicket) => {
  const total = repairTotal(ticket);
  const paid = repairPaid(ticket);
  if (total <= 0 || paid >= total) return "paid";
  return paid > 0 ? "partial" : "unpaid";
};

const repairProgress = (ticket: RepairTicket) =>
  ticket.statusHistory?.[0]?.progress ?? ticket.timeline?.[0]?.progress ?? progressForRepairStatus(ticket.status);

const isClosedStatus = (status: string) => ["completed", "delivered", "dead", "scrap", "cancelled"].includes(status);

const searchableRepairText = (ticket: RepairTicket) => [
  ticket.invoiceNumber,
  ticket.deviceNumber,
  ticket.ticketNumber,
  ticket.id,
  ticket.customer,
  ticket.customerPhone,
  ticket.customerEmail,
  ticket.device,
  ticket.category,
  ticket.brand,
  ticket.model,
  ticket.serialNumber,
  ticket.technician,
  labelForRepairStatus(ticket.status),
  ticket.status,
  ticket.priority,
  paymentStatusFor(ticket),
  ticket.createdAt,
  ticket.estimatedCompletion,
  ...(ticket.partsUsed ?? []).map((part) => part.name),
  ticket.customerDescription,
  ticket.issueDescription,
  ticket.issue,
].map(normalize).join(" ");

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

export function RepairTickets() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [tickets, setTickets] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [editingTicket, setEditingTicket] = useState<RepairTicket | null>(null);
  const [editForm, setEditForm] = useState({ customer: "", device: "", issue: "", status: "received", priority: "medium", estimatedCompletion: "", amount: "0", jobNumber: "", ticketNumber: "" });
  const [statusTicket, setStatusTicket] = useState<RepairTicket | null>(null);
  const [statusForm, setStatusForm] = useState({ status: "received", progress: "5", workCompleted: "", customerNote: "", internalNote: "" });
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const viewFilter = searchParams.get("view") || "all";
  const technicianFilter = searchParams.get("technician") || "all";
  const deviceTypeFilter = searchParams.get("deviceType") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const priorityFilter = searchParams.get("priority") || "all";
  const paymentStatusFilter = searchParams.get("payment") || "all";
  const dateFromFilter = searchParams.get("from") || "";
  const dateToFilter = searchParams.get("to") || "";
  const page = Math.max(1, Number(searchParams.get("page") || 1));

  const updateFilter = (key: string, value: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      return next;
    });
  };

  useEffect(() => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (debouncedSearchQuery.trim()) next.set("q", debouncedSearchQuery.trim());
      else next.delete("q");
      next.delete("page");
      return next;
    });
  }, [debouncedSearchQuery, setSearchParams]);

  const openEdit = (ticket: RepairTicket) => {
    setEditingTicket(ticket);
    setEditForm({ customer: ticket.customer, device: ticket.device, issue: ticket.issue, status: ticket.status, priority: ticket.priority, estimatedCompletion: ticket.estimatedCompletion, amount: String(ticket.amount), jobNumber: ticket.jobNumber || "", ticketNumber: ticket.ticketNumber || ticket.id });
  };

  const openStatusUpdate = (ticket: RepairTicket) => {
    setStatusTicket(ticket);
    setStatusForm({
      status: ticket.status,
      progress: String(repairProgress(ticket)),
      workCompleted: "",
      customerNote: "",
      internalNote: "",
    });
  };

  const setStatusValue = (status: string) => {
    setStatusForm((current) => ({ ...current, status, progress: String(progressForRepairStatus(status)) }));
  };

  const saveStatusUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!statusTicket) return;

    const progress = Number(statusForm.progress);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      toast.error("Progress must be between 0 and 100.");
      return;
    }

    const changedAt = new Date().toISOString();
    const statusLabel = labelForRepairStatus(statusForm.status);
    const notes = [statusForm.workCompleted, statusForm.customerNote, statusForm.internalNote].map((item) => item.trim()).filter(Boolean);
    const note = notes.join(" | ") || `Status changed to ${statusLabel}.`;

    setTickets((current) => current.map((ticket) => {
      if (ticket.id !== statusTicket.id) return ticket;
      return {
        ...ticket,
        status: statusForm.status,
        openStatus: isClosedStatus(statusForm.status) ? "Closed" : "Open",
        timeline: [{
          date: changedAt,
          status: statusForm.status,
          note,
          technician: ticket.technician,
          diagnosis: statusForm.workCompleted.trim() || undefined,
          progress,
        }, ...(ticket.timeline ?? [])],
        statusHistory: [{
          id: `STATUS-${Date.now()}`,
          date: changedAt,
          status: statusForm.status,
          label: statusLabel,
          note: statusForm.customerNote.trim() || statusForm.internalNote.trim() || undefined,
          technician: ticket.technician,
          technicianId: ticket.currentTechnicianId,
          progress,
        }, ...(ticket.statusHistory ?? [])],
        repairNotes: [
          ...(statusForm.customerNote.trim() ? [{ id: `NOTE-CUSTOMER-${Date.now()}`, date: changedAt, note: statusForm.customerNote.trim(), author: ticket.technician, visibility: "customer" as const }] : []),
          ...(statusForm.internalNote.trim() ? [{ id: `NOTE-INTERNAL-${Date.now()}`, date: changedAt, note: statusForm.internalNote.trim(), author: ticket.technician, visibility: "internal" as const }] : []),
          ...(ticket.repairNotes ?? []),
        ],
      };
    }));
    setStatusTicket(null);
    toast.success("Repair status updated.");
  };

  const saveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingTicket) return;
    setTickets((current) => current.map((ticket) => {
      if (ticket.id !== editingTicket.id) return ticket;
      const statusChanged = ticket.status !== editForm.status;
      return {
        ...ticket,
        customer: editForm.customer,
        device: editForm.device,
        issue: editForm.issue,
        status: editForm.status,
        priority: editForm.priority,
        estimatedCompletion: editForm.estimatedCompletion,
        amount: Number(editForm.amount),
        statusHistory: statusChanged
          ? [{ id: `STATUS-${Date.now()}`, date: new Date().toISOString(), status: editForm.status, label: labelForRepairStatus(editForm.status), note: "Status changed from repair list edit.", technician: ticket.technician }, ...(ticket.statusHistory ?? [])]
          : ticket.statusHistory,
      };
    }));
    setEditingTicket(null);
    toast.success("Repair ticket updated.");
  };

  const deleteTicket = (ticket: RepairTicket) => {
    if (!window.confirm(`Archive ${ticket.id}? The repair history will stay saved.`)) return;
    const archivedAt = new Date().toISOString();
    setTickets((current) => current.map((item) => item.id === ticket.id ? {
      ...item,
      status: "cancelled",
      openStatus: "Closed",
      timeline: [{ date: archivedAt, status: "cancelled", note: "Repair archived. History preserved.", technician: item.technician }, ...(item.timeline ?? [])],
      statusHistory: [{ id: `STATUS-${Date.now()}`, date: archivedAt, status: "cancelled", label: "Cancelled", note: "Repair archived. History preserved.", technician: item.technician }, ...(item.statusHistory ?? [])],
    } : item));
    toast.success("Repair archived. History preserved.");
  };

  const inProgressCount = tickets.filter((ticket) =>
    !inactiveRepairStatuses.has(ticket.status),
  ).length;
  const readyCount = tickets.filter((ticket) => ticket.status === "ready").length;
  const waitingPartsCount = tickets.filter((ticket) => ticket.status === "waiting_parts").length;

  const technicians = useMemo(() => Array.from(new Set(tickets.map((ticket) => ticket.technician).filter(Boolean))).sort(), [tickets]);
  const deviceTypes = useMemo(() => Array.from(new Set(tickets.map((ticket) => ticket.device).filter(Boolean))).sort(), [tickets]);

  const filteredTickets = useMemo(() => {
    const search = normalize(debouncedSearchQuery);
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    const threeDaysKey = threeDaysFromNow.toISOString().slice(0, 10);

    return tickets.filter((ticket) => {
      if (search && !searchableRepairText(ticket).includes(search)) return false;
      if (technicianFilter !== "all" && ticket.technician !== technicianFilter) return false;
      if (deviceTypeFilter !== "all" && ticket.device !== deviceTypeFilter) return false;
      if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
      if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
      if (paymentStatusFilter !== "all" && paymentStatusFor(ticket) !== paymentStatusFilter) return false;
      if (dateFromFilter && dateOnly(ticket.createdAt) < dateFromFilter) return false;
      if (dateToFilter && dateOnly(ticket.createdAt) > dateToFilter) return false;

      const dueDate = dateOnly(ticket.estimatedCompletion);
      if (viewFilter === "active") return !inactiveRepairStatuses.has(ticket.status);
      if (["received", "diagnosing", "waiting_approval", "waiting_parts", "repairing", "testing", "completed", "ready", "delivered"].includes(viewFilter)) return ticket.status === viewFilter;
      if (viewFilter === "overdue") return Boolean(dueDate && dueDate < todayKey && !inactiveRepairStatuses.has(ticket.status));
      if (viewFilter === "due_today") return dueDate === todayKey;
      if (viewFilter === "due_3_days") return Boolean(dueDate && dueDate >= todayKey && dueDate <= threeDaysKey);
      return true;
    });
  }, [dateFromFilter, dateToFilter, debouncedSearchQuery, deviceTypeFilter, paymentStatusFilter, priorityFilter, statusFilter, technicianFilter, tickets, viewFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTickets = filteredTickets.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const setPage = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextPage <= 1) next.delete("page");
      else next.set("page", String(nextPage));
      return next;
    });
  };
  const resetFilters = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Repair Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage Repair IDs, statuses, and open jobs</p>
        </div>
        <Link to="/repairs/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Repair Ticket
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <h3 className="text-2xl font-bold mt-1">{tickets.length}</h3>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <h3 className="text-2xl font-bold mt-1">{inProgressCount}</h3>
              </div>
              <div className="bg-warning/10 text-warning p-3 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <h3 className="text-2xl font-bold mt-1">{readyCount}</h3>
              </div>
              <div className="bg-success/10 text-success p-3 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waiting Parts</p>
                <h3 className="text-2xl font-bold mt-1">{waitingPartsCount}</h3>
              </div>
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Repair Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-6 lg:grid-cols-[minmax(240px,1fr)_220px_180px_180px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice, device, customer, phone, email, brand, model, serial, part, problem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={viewFilter} onValueChange={(value) => updateFilter("view", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Repair view" />
              </SelectTrigger>
              <SelectContent>
                {repairViewFilters.map((filter) => <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {repairStatusOptions.map((status) => <SelectItem key={status} value={status}>{labelForRepairStatus(status)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value) => updateFilter("priority", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 mb-6 md:grid-cols-2 xl:grid-cols-[1fr_1fr_180px_160px_160px_auto]">
            <Select value={technicianFilter} onValueChange={(value) => updateFilter("technician", value)}>
              <SelectTrigger><SelectValue placeholder="Technician" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Technicians</SelectItem>{technicians.map((technician) => <SelectItem key={technician} value={technician}>{technician}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={deviceTypeFilter} onValueChange={(value) => updateFilter("deviceType", value)}>
              <SelectTrigger><SelectValue placeholder="Device Type" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Device Types</SelectItem>{deviceTypes.map((device) => <SelectItem key={device} value={device}>{device}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={(value) => updateFilter("payment", value)}>
              <SelectTrigger><SelectValue placeholder="Payment" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Payments</SelectItem>{paymentStatuses.map((status) => <SelectItem key={status} value={status}>{status === "partial" ? "Partially Paid" : status[0].toUpperCase() + status.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="date" value={dateFromFilter} onChange={(event) => updateFilter("from", event.target.value)} aria-label="Received date from" />
            <Input type="date" value={dateToFilter} onChange={(event) => updateFilter("to", event.target.value)} aria-label="Received date to" />
            <Button type="button" variant="outline" onClick={resetFilters}>Reset Filters</Button>
          </div>
          <div className="mb-3 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Showing {pagedTickets.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}-{Math.min(safePage * PAGE_SIZE, filteredTickets.length)} of {filteredTickets.length} matching repairs. Search waits briefly while typing.</p>
            <p>Page {safePage} of {totalPages}</p>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Device Number</TableHead>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Customer Phone</TableHead>
                  <TableHead>Device Name</TableHead>
                  <TableHead>Brand / Model</TableHead>
                  <TableHead>Assigned Technician</TableHead>
                  <TableHead>Repair Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead>Expected Return Date</TableHead>
                  <TableHead>Remaining Days</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                      No repair tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedTickets.map((ticket) => {
                    const status = statusConfig[ticket.status] ?? { label: labelForRepairStatus(ticket.status), variant: "outline" as const, icon: Clock };
                    const StatusIcon = status.icon;
                    const dueState = getRepairDueState(ticket);
                    const deviceNumber = ticket.deviceNumber || ticket.ticketNumber || ticket.id;
                    const invoiceNumber = ticket.invoiceNumber || ticket.ticketNumber || ticket.id;
                    const ticketId = ticket.ticketNumber && ticket.ticketNumber !== deviceNumber ? ticket.ticketNumber : ticket.id !== deviceNumber ? ticket.id : "";
                    const detailState = { repairSearch: searchParams.toString() };
                    const progress = repairProgress(ticket);
                    const paymentStatus = paymentStatusFor(ticket);
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium"><Link className="text-primary hover:underline" to={`/repairs/${ticket.id}`} state={detailState}>{invoiceNumber}</Link></TableCell>
                        <TableCell className="font-medium"><Link className="text-primary hover:underline" to={`/repairs/${ticket.id}`} state={detailState}>{deviceNumber}</Link></TableCell>
                        <TableCell className="font-medium">{ticketId ? <Link className="text-primary hover:underline" to={`/repairs/${ticket.id}`} state={detailState}>{ticketId}</Link> : "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.customer}`}
                              />
                              <AvatarFallback>{ticket.customer[0]}</AvatarFallback>
                            </Avatar>
                            <span>{ticket.customer}</span>
                          </div>
                        </TableCell>
                        <TableCell>{ticket.customerPhone || "-"}</TableCell>
                        <TableCell>{ticket.device}</TableCell>
                        <TableCell className="max-w-[180px] truncate">{[ticket.brand, ticket.model].filter(Boolean).join(" / ") || "-"}</TableCell>
                        <TableCell>{ticket.technician || "Unassigned"}</TableCell>
                        <TableCell>
                          <button type="button" className="rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" onClick={(event) => { event.stopPropagation(); openStatusUpdate(ticket); }}>
                            <Badge variant="outline" className={`gap-1 cursor-pointer ${statusBadgeClasses[ticket.status] ?? ""}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label} · {progress}%
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell>{progress}%</TableCell>
                        <TableCell>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{ticket.estimatedCompletion || "-"}</TableCell>
                        <TableCell><Badge variant="outline" className={dueBadgeClasses[dueState.tone]}>{dueState.label}</Badge></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={paymentStatus === "paid" ? "border-success/30 bg-success/10 text-success" : paymentStatus === "partial" ? "border-warning/40 bg-warning/10 text-warning" : "border-destructive/40 bg-destructive/10 text-destructive"}>{paymentStatus === "partial" ? "Partially Paid" : paymentStatus}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={`/repairs/${ticket.id}`} state={detailState}><Button variant="ghost" size="icon" title="View Details"><Eye className="h-4 w-4" /></Button></Link>
                            {isAdmin && <Button variant="outline" size="icon" title="Edit" onClick={() => openEdit(ticket)}><Pencil className="h-4 w-4" /></Button>}
                            <Button variant="outline" size="icon" title="Update Status" onClick={() => openStatusUpdate(ticket)}><CheckCircle2 className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" title="Print label" onClick={() => { if (!printRepairLabel(ticket)) toast.error("Allow pop-ups to print the device label."); }}><Printer className="h-4 w-4" /></Button>
                            {isAdmin && <Button variant="destructive" size="icon" title="Delete" onClick={() => deleteTicket(ticket)}><Trash2 className="h-4 w-4" /></Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1}>Previous</Button>
            <div className="text-center text-sm text-muted-foreground">Only {PAGE_SIZE} rows render per page to keep large repair lists responsive.</div>
            <Button type="button" variant="outline" onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages}>Next</Button>
          </div>
        </CardContent>
      </Card>
      <Dialog open={Boolean(statusTicket)} onOpenChange={(open) => !open && setStatusTicket(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Update Repair Status</DialogTitle></DialogHeader>
          <form onSubmit={saveStatusUpdate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={statusForm.status} onValueChange={setStatusValue}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{repairStatusOptions.map((status) => <SelectItem key={status} value={status}>{labelForRepairStatus(status)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusProgress">Progress Percentage</Label>
                <Input id="statusProgress" type="number" min="0" max="100" value={statusForm.progress} onChange={(event) => setStatusForm({ ...statusForm, progress: event.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workCompleted">Work Completed</Label>
              <Textarea id="workCompleted" value={statusForm.workCompleted} onChange={(event) => setStatusForm({ ...statusForm, workCompleted: event.target.value })} rows={3} placeholder="Diagnosis, repair work, testing, or pickup update" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerNote">Customer Note</Label>
              <Textarea id="customerNote" value={statusForm.customerNote} onChange={(event) => setStatusForm({ ...statusForm, customerNote: event.target.value })} rows={2} placeholder="Message safe to share with customer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNote">Internal Note</Label>
              <Textarea id="internalNote" value={statusForm.internalNote} onChange={(event) => setStatusForm({ ...statusForm, internalNote: event.target.value })} rows={2} placeholder="Shop-only note" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStatusTicket(null)}>Cancel</Button>
              <Button type="submit">Save Status</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(editingTicket)} onOpenChange={(open) => !open && setEditingTicket(null)}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Edit Repair Ticket {editingTicket?.id}</DialogTitle></DialogHeader><form onSubmit={saveEdit} className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Ticket Number</Label><Input value={editForm.ticketNumber} onChange={(e) => setEditForm({ ...editForm, ticketNumber: e.target.value })} required /><p className="text-xs text-muted-foreground">Device ka unique ticket number.</p></div><div className="space-y-2"><Label>Job Number</Label><Input value={editForm.jobNumber} onChange={(e) => setEditForm({ ...editForm, jobNumber: e.target.value })} required /><p className="text-xs text-muted-foreground">Customer ka job number; is se customer-device ka kaam track hoga.</p></div><div className="space-y-2"><Label>Customer</Label><Input value={editForm.customer} onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })} required /></div><div className="space-y-2"><Label>Device</Label><Input value={editForm.device} onChange={(e) => setEditForm({ ...editForm, device: e.target.value })} required /></div><div className="space-y-2 md:col-span-2"><Label>Issue</Label><Input value={editForm.issue} onChange={(e) => setEditForm({ ...editForm, issue: e.target.value })} required /></div><div className="space-y-2"><Label>Status</Label><Select value={editForm.status} onValueChange={(status) => setEditForm({ ...editForm, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusConfig).map(([value, item]) => <SelectItem key={value} value={value}>{item.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Priority</Label><Select value={editForm.priority} onValueChange={(priority) => setEditForm({ ...editForm, priority })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Estimated Completion</Label><Input type="date" value={editForm.estimatedCompletion} onChange={(e) => setEditForm({ ...editForm, estimatedCompletion: e.target.value })} /></div><div className="space-y-2"><Label>Amount</Label><Input type="number" min="0" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setEditingTicket(null)}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter></form></DialogContent></Dialog>
    </div>
  );
}
