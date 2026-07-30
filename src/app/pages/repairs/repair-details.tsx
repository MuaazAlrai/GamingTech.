import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Plus,
  Smartphone,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Progress } from "../../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { Customer } from "../../types/customer";
import type { RepairPartUsed, RepairTicket } from "../../types/repair-ticket";
import { formatAmount } from "../../utils/formatting";
import { getRepairDueState, getTimelineProgress, labelForRepairStatus, progressForRepairStatus, repairStatusOptions } from "../../utils/repair-status";

const statusOptions = repairStatusOptions.map((status) => ({ value: status, label: labelForRepairStatus(status), progress: progressForRepairStatus(status) }));

const labelForStatus = labelForRepairStatus;
const money = (value: number) => formatAmount(value, 0);

export function RepairDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [tickets, setTickets] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [customers] = usePersistentState<Customer[]>("gamingtech.customers", []);
  const ticket = tickets.find((item) => item.id === id || item.repairId === id || item.ticketNumber === id || item.deviceNumber === id || item.invoiceNumber === id);
  const [editOpen, setEditOpen] = useState(false);
  const [partForm, setPartForm] = useState({ name: "", quantity: "1", cost: "0" });
  const [statusNote, setStatusNote] = useState("");

  const customer = useMemo(() => {
    if (!ticket) return undefined;
    return customers.find((item) => item.id === ticket.customerId)
      ?? customers.find((item) => item.phone && item.phone === ticket.customerPhone)
      ?? customers.find((item) => item.name.toLowerCase() === ticket.customer.toLowerCase());
  }, [customers, ticket]);

  const [editForm, setEditForm] = useState({
    jobNumber: "",
    ticketNumber: "",
    customer: "",
    device: "",
    issue: "",
    issueDescription: "",
    priority: "medium",
    technician: "",
    estimatedCompletion: "",
    amount: "0",
  });

  if (!ticket) {
    return <Card><CardContent className="p-8 text-center"><p className="mb-4 text-muted-foreground">Repair ticket not found.</p><Button onClick={() => navigate("/repairs")}>Back to Repairs</Button></CardContent></Card>;
  }

  const parts = ticket.partsUsed ?? [];
  const historyEvents = ticket.statusHistory?.length
    ? ticket.statusHistory.map((entry) => ({ date: entry.date, status: entry.status, note: entry.note || entry.label || "Status updated.", technician: entry.technician, progress: entry.progress }))
    : ticket.timeline ?? [{ date: ticket.createdAt, status: ticket.status, note: "Ticket created.", technician: ticket.technician, progress: progressForRepairStatus(ticket.status) }];
  const timeline = [...historyEvents]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const progress = ticket.statusHistory?.[0]?.progress ?? ticket.timeline?.[0]?.progress ?? progressForRepairStatus(ticket.status);
  const dueState = getRepairDueState(ticket);
  const partsTotal = parts.reduce((sum, part) => sum + part.quantity * part.cost, 0);
  const labourCharges = ticket.labourCharges ?? Math.max(0, ticket.amount - partsTotal);
  const discount = ticket.discount ?? 0;
  const invoiceItemsTotal = ticket.invoiceItems?.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) ?? 0;
  const total = invoiceItemsTotal || Math.max(0, partsTotal + labourCharges - discount);
  const paidAmount = (ticket.paidAmount ?? 0) + (ticket.payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = Math.max(0, total - paidAmount);
  const paymentStatus = remainingBalance <= 0 ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Unpaid";

  const updateTicket = (updater: (current: RepairTicket) => RepairTicket) => {
    setTickets((current) => current.map((item) => item.id === ticket.id ? updater(item) : item));
  };

  const changeStatus = (status: string) => {
    const changedAt = new Date().toISOString();
    const note = statusNote.trim() || `Status changed to ${labelForStatus(status)}.`;
    updateTicket((current) => ({
      ...current,
      status,
      openStatus: ["completed", "delivered", "dead", "scrap"].includes(status) ? "Closed" : "Open",
      timeline: [{ date: changedAt, status, note, technician: current.technician, progress: progressForRepairStatus(status) }, ...(current.timeline ?? [])],
      statusHistory: [{ id: `STATUS-${Date.now()}`, date: changedAt, status, label: labelForStatus(status), note, technician: current.technician, technicianId: current.currentTechnicianId, progress: progressForRepairStatus(status) }, ...(current.statusHistory ?? [])],
    }));
    setStatusNote("");
    toast.success("Repair status updated.");
  };

  const markComplete = () => changeStatus("completed");

  const openEdit = () => {
    setEditForm({
      jobNumber: ticket.jobNumber || "",
      ticketNumber: ticket.ticketNumber || ticket.id,
      customer: ticket.customer,
      device: ticket.device,
      issue: ticket.issue,
      issueDescription: ticket.issueDescription ?? "",
      priority: ticket.priority,
      technician: ticket.technician,
      estimatedCompletion: ticket.estimatedCompletion,
      amount: String(ticket.amount),
    });
    setEditOpen(true);
  };

  const saveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    updateTicket((current) => {
      const technicianChanged = current.technician !== editForm.technician;
      return {
        ...current,
        customer: editForm.customer,
        device: editForm.device,
        issue: editForm.issue,
        issueDescription: editForm.issueDescription,
        priority: editForm.priority,
        technician: editForm.technician,
        estimatedCompletion: editForm.estimatedCompletion,
        amount: Number(editForm.amount),
        technicianAssignmentHistory: technicianChanged
          ? [{ id: `TECH-${Date.now()}`, date: new Date().toISOString(), technician: editForm.technician || "Unassigned", note: "Technician changed from repair edit." }, ...(current.technicianAssignmentHistory ?? [])]
          : current.technicianAssignmentHistory,
      };
    });
    setEditOpen(false);
    toast.success("Repair ticket updated.");
  };

  const addPart = (event: React.FormEvent) => {
    event.preventDefault();
    const part: RepairPartUsed = {
      id: `PART-${Date.now()}`,
      name: partForm.name.trim(),
      quantity: Number(partForm.quantity),
      cost: Number(partForm.cost),
    };
    if (!part.name || part.quantity <= 0 || part.cost < 0) return toast.error("Enter valid part details.");
    const addedAt = new Date().toISOString();
    updateTicket((current) => ({
      ...current,
      partsUsed: [part, ...(current.partsUsed ?? [])],
      invoiceItems: [{ id: `INVITEM-${Date.now()}`, description: part.name, quantity: part.quantity, unitPrice: part.cost, type: "part", partId: part.id }, ...(current.invoiceItems ?? [])],
      timeline: [{ date: addedAt, status: current.status, note: `Part added: ${part.name} x${part.quantity}.`, technician: current.technician, partsAdded: `${part.name} x${part.quantity}`, progress: progressForRepairStatus(current.status) }, ...(current.timeline ?? [])],
      repairNotes: [{ id: `NOTE-${Date.now()}`, date: addedAt, note: `Part added: ${part.name} x${part.quantity}.`, author: current.technician, visibility: "internal" }, ...(current.repairNotes ?? [])],
    }));
    setPartForm({ name: "", quantity: "1", cost: "0" });
    toast.success("Part added to repair.");
  };

  const customerProfileId = customer?.id ?? ticket.customerId;
  const backToRepairs = () => {
    const repairSearch = (location.state as { repairSearch?: string } | null)?.repairSearch;
    navigate(repairSearch ? `/repairs?${repairSearch}` : "/repairs");
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={backToRepairs}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{ticket.repairId || ticket.id}</h1>
              <Badge>{labelForStatus(ticket.status)}</Badge>
              <Badge variant="outline" className="capitalize">{ticket.priority} Priority</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">Created on {new Date(ticket.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={openEdit}><Edit className="h-4 w-4" />Edit</Button>
          <Button className="gap-2" onClick={markComplete}><CheckCircle className="h-4 w-4" />Mark Complete</Button>
        </div>
      </div>

      <Card><CardContent className="space-y-4 p-6"><div className="flex items-center justify-between"><span className="text-sm font-medium">Repair Progress</span><span className="text-sm font-medium">{progress}%</span></div><Progress value={progress} className="h-2" /><div className="grid gap-3 md:grid-cols-[220px_1fr_auto]"><Select value={ticket.status} onValueChange={changeStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statusOptions.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}</SelectContent></Select><Input value={statusNote} onChange={(event) => setStatusNote(event.target.value)} placeholder="Status note" /><Button variant="outline" onClick={() => changeStatus(ticket.status)}>Add Note</Button></div></CardContent></Card>

      <Card><CardContent className="grid gap-4 p-5 md:grid-cols-4"><div className="rounded-lg border bg-primary/5 p-4"><p className="text-sm text-muted-foreground">Device Number</p><p className="text-xl font-bold text-primary">{ticket.deviceNumber || ticket.ticketNumber || ticket.id}</p><p className="mt-1 text-xs text-muted-foreground">This device intake number</p></div><div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Invoice Number</p><p className="font-semibold">{ticket.invoiceNumber || ticket.ticketNumber || ticket.id}</p></div><div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Customer Name</p><p className="font-semibold">{ticket.customer}</p></div><div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Customer Phone</p><p className="font-semibold">{ticket.customerPhone || customer?.phone || "-"}</p></div></CardContent></Card>

      <Card>
        <CardHeader><CardTitle>Repair Summary</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Customer Name", ticket.customer],
            ["Customer Phone", ticket.customerPhone || customer?.phone || "-"],
            ["Device Number", ticket.deviceNumber || ticket.ticketNumber || ticket.id],
            ["Invoice Number", ticket.invoiceNumber || ticket.ticketNumber || ticket.id],
            ["Device Type", ticket.device],
            ["Device Category", ticket.category || "-"],
            ["Brand", ticket.brand || "-"],
            ["Model", ticket.model || "-"],
            ["Serial Number", ticket.serialNumber || "-"],
            ["Customer Complaint", ticket.issueDescription || ticket.issue],
            ["Assigned Technician", ticket.technician || "Unassigned"],
            ["Previous Visits Device Link", ticket.physicalDeviceId || "-"],
            ["Current Status", labelForStatus(ticket.status)],
            ["Progress Percentage", `${progress}%`],
            ["Priority", ticket.priority],
            ["Received Date", new Date(ticket.createdAt).toLocaleString()],
            ["Expected Return Date", ticket.estimatedCompletion || "-"],
            ["Remaining Days", dueState.label],
            ["Estimated Cost", money(ticket.amount)],
            ["Parts Total", money(partsTotal)],
            ["Labour Charges", money(labourCharges)],
            ["Other Charges", money(Math.max(0, total - partsTotal - labourCharges + discount))],
            ["Discount", money(discount)],
            ["Grand Total", money(total)],
            ["Paid Amount", money(paidAmount)],
            ["Remaining Balance", money(remainingBalance)],
            ["Payment Status", paymentStatus],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 break-words text-sm font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="timeline">Timeline</TabsTrigger><TabsTrigger value="parts">Parts Used</TabsTrigger></TabsList>
            <TabsContent value="details" className="space-y-6"><Card><CardHeader><CardTitle>Device Information</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-muted-foreground">Device</p><p className="font-medium">{ticket.device}</p></div><div><p className="text-sm text-muted-foreground">Brand</p><p className="font-medium">{ticket.brand || "-"}</p></div><div><p className="text-sm text-muted-foreground">Model</p><p className="font-medium">{ticket.model || "-"}</p></div><div><p className="text-sm text-muted-foreground">Serial Number</p><p className="font-medium">{ticket.serialNumber || "-"}</p></div></div><Separator /><div><p className="mb-2 text-sm text-muted-foreground">Accessories Included</p><p className="font-medium">{ticket.accessories || "-"}</p></div></CardContent></Card><Card><CardHeader><CardTitle>Problem Description</CardTitle></CardHeader><CardContent className="space-y-4"><div><p className="mb-2 text-sm text-muted-foreground">Issue Title</p><p className="text-lg font-medium">{ticket.issue}</p></div><Separator /><div><p className="mb-2 text-sm text-muted-foreground">Detailed Description</p><p className="text-sm">{ticket.issueDescription || "-"}</p></div><Separator /><div><p className="mb-2 text-sm text-muted-foreground">Device Condition</p><div className="flex flex-wrap gap-2">{(ticket.condition ?? []).length ? ticket.condition?.map((cond) => <Badge key={cond} variant="outline">{cond}</Badge>) : <span className="text-sm text-muted-foreground">No condition notes</span>}</div></div><div><p className="mb-2 text-sm text-muted-foreground">Condition Comment</p><p className="text-sm">{ticket.conditionComment || "-"}</p></div></CardContent></Card></TabsContent>
            <TabsContent value="timeline"><Card><CardHeader><CardTitle>Repair Timeline and Progress</CardTitle></CardHeader><CardContent><div className="mb-6 grid gap-2 md:grid-cols-4">{timeline.map((event, index) => { const eventProgress = getTimelineProgress(event); return <div key={`${event.date}-step-${index}`} className="rounded-md border p-3"><div className="mb-2 flex items-center justify-between gap-2"><span className="text-sm font-medium">{labelForStatus(event.status)}</span><span className="text-xs text-muted-foreground">{eventProgress}%</span></div><Progress value={eventProgress} className="h-2" /><p className="mt-2 text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p></div>; })}</div><div className="space-y-6">{timeline.map((event, index) => <div key={`${event.date}-${index}`} className="flex gap-4"><div className="flex flex-col items-center"><div className="h-3 w-3 rounded-full bg-primary" />{index !== timeline.length - 1 && <div className="mt-2 h-full w-0.5 bg-border" />}</div><div className="flex-1 pb-6"><div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{labelForStatus(event.status)}</p><p className="text-xs text-muted-foreground">Progress {getTimelineProgress(event)}%{event.technician ? ` · ${event.technician}` : ""}</p></div><p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleString()}</p></div>{event.diagnosis && <p className="text-sm"><span className="font-medium">Diagnosis/work:</span> {event.diagnosis}</p>}{event.partsAdded && <p className="text-sm"><span className="font-medium">Parts added:</span> {event.partsAdded}</p>}<p className="text-sm text-muted-foreground">{event.note}</p></div></div>)}</div></CardContent></Card></TabsContent>
            <TabsContent value="parts" className="space-y-4"><Card><CardHeader><CardTitle>Parts & Materials</CardTitle></CardHeader><CardContent className="space-y-4"><form onSubmit={addPart} className="grid gap-3 md:grid-cols-[1fr_100px_140px_auto]"><Input value={partForm.name} onChange={(event) => setPartForm({ ...partForm, name: event.target.value })} placeholder="Part name" /><Input type="number" min="1" value={partForm.quantity} onChange={(event) => setPartForm({ ...partForm, quantity: event.target.value })} /><Input type="number" min="0" value={partForm.cost} onChange={(event) => setPartForm({ ...partForm, cost: event.target.value })} /><Button type="submit" className="gap-2"><Plus className="h-4 w-4" />Add</Button></form>{parts.length === 0 ? <p className="rounded-md border p-4 text-sm text-muted-foreground">No parts added yet.</p> : <div className="overflow-x-auto rounded-md border"><table className="w-full min-w-[760px] text-sm"><thead className="bg-muted"><tr><th className="px-3 py-2 text-left">Part Name</th><th className="px-3 py-2 text-right">Quantity</th><th className="px-3 py-2 text-right">Selling Price</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2 text-left">Warranty</th><th className="px-3 py-2 text-left">Added Date</th></tr></thead><tbody>{parts.map((part) => <tr key={part.id} className="border-t"><td className="px-3 py-2 font-medium">{part.name}</td><td className="px-3 py-2 text-right">{part.quantity}</td><td className="px-3 py-2 text-right">{money(part.cost)}</td><td className="px-3 py-2 text-right">{money(part.quantity * part.cost)}</td><td className="px-3 py-2">-</td><td className="px-3 py-2">{part.id.startsWith("PART-") ? new Date(Number(part.id.replace("PART-", ""))).toLocaleDateString() : "-"}</td></tr>)}</tbody></table></div>}</CardContent></Card></TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Customer Info</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-3"><Avatar className="h-12 w-12"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.customer}`} /><AvatarFallback>{ticket.customer[0]}</AvatarFallback></Avatar><div className="flex-1"><p className="font-medium">{ticket.customer}</p><p className="text-sm text-muted-foreground">{ticket.customerPhone || customer?.phone || "No phone"}</p></div></div><Separator /><div className="space-y-3"><div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{ticket.customerPhone || customer?.phone || "-"}</span></div>{ticket.customerDescription ? <div className="rounded-md bg-muted/50 p-3 text-sm">{ticket.customerDescription}</div> : null}</div><Button variant="outline" className="w-full" onClick={() => customerProfileId ? navigate(`/customers/${customerProfileId}`) : toast.error("Customer profile not found for this ticket.")}>View Customer Profile</Button></CardContent></Card>
          <Card><CardHeader><CardTitle>Assigned Technician</CardTitle></CardHeader><CardContent><p className="font-medium">{ticket.technician || "Unassigned"}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Cost Breakdown</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex justify-between"><span className="text-muted-foreground">Parts Used</span><span className="font-medium">{money(partsTotal)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Estimate</span><span className="font-medium">{money(ticket.amount)}</span></div><Separator /><div className="flex justify-between text-lg"><span className="font-medium">Total</span><span className="font-bold">{money(total)}</span></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Timeline</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Est. Completion</span><span className="font-medium">{ticket.estimatedCompletion || "-"}</span></div></CardContent></Card>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Edit Repair</DialogTitle></DialogHeader><form onSubmit={saveEdit} className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Customer</Label><Input value={editForm.customer} onChange={(event) => setEditForm({ ...editForm, customer: event.target.value })} required /></div><div className="space-y-2"><Label>Device</Label><Input value={editForm.device} onChange={(event) => setEditForm({ ...editForm, device: event.target.value })} required /></div><div className="space-y-2 md:col-span-2"><Label>Issue</Label><Input value={editForm.issue} onChange={(event) => setEditForm({ ...editForm, issue: event.target.value })} required /></div><div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea value={editForm.issueDescription} onChange={(event) => setEditForm({ ...editForm, issueDescription: event.target.value })} rows={3} /></div><div className="space-y-2"><Label>Priority</Label><Select value={editForm.priority} onValueChange={(priority) => setEditForm({ ...editForm, priority })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Technician</Label><Input value={editForm.technician} onChange={(event) => setEditForm({ ...editForm, technician: event.target.value })} /></div><div className="space-y-2"><Label>Estimated Completion</Label><Input type="date" value={editForm.estimatedCompletion} onChange={(event) => setEditForm({ ...editForm, estimatedCompletion: event.target.value })} /></div><div className="space-y-2"><Label>Amount</Label><Input type="number" min="0" value={editForm.amount} onChange={(event) => setEditForm({ ...editForm, amount: event.target.value })} /></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter></form></DialogContent></Dialog>
    </div>
  );
}
