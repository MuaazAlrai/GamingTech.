import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Search,
  Filter,
  Plus,
  Eye,
  MoreVertical,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { RepairTicket } from "../../types/repair-ticket";
import { printRepairLabel } from "../../utils/print-repair-label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../auth/auth-context";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  received: { label: "Received", variant: "secondary", icon: Clock },
  diagnosing: { label: "Diagnosing", variant: "default", icon: AlertCircle },
  waiting_approval: { label: "Waiting Approval", variant: "outline", icon: Clock },
  waiting_parts: { label: "Waiting Parts", variant: "destructive", icon: XCircle },
  repairing: { label: "Repairing", variant: "default", icon: AlertCircle },
  testing: { label: "Testing", variant: "default", icon: AlertCircle },
  ready: { label: "Ready", variant: "outline", icon: CheckCircle2 },
  delivered: { label: "Delivered", variant: "secondary", icon: CheckCircle2 },
  scrap: { label: "SCRAP", variant: "destructive", icon: XCircle },
  dead: { label: "Dead", variant: "destructive", icon: XCircle },
  pending: { label: "Pending", variant: "outline", icon: Clock },
  to_return: { label: "To Return", variant: "outline", icon: CheckCircle2 },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle2 },
};

const priorityColors: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

export function RepairTickets() {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tickets, setTickets] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [editingTicket, setEditingTicket] = useState<RepairTicket | null>(null);
  const [editForm, setEditForm] = useState({ customer: "", device: "", issue: "", status: "received", priority: "medium", estimatedCompletion: "", amount: "0", jobNumber: "", ticketNumber: "" });

  const openEdit = (ticket: RepairTicket) => {
    setEditingTicket(ticket);
    setEditForm({ customer: ticket.customer, device: ticket.device, issue: ticket.issue, status: ticket.status, priority: ticket.priority, estimatedCompletion: ticket.estimatedCompletion, amount: String(ticket.amount), jobNumber: ticket.jobNumber || "", ticketNumber: ticket.ticketNumber || ticket.id });
  };

  const saveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingTicket) return;
    const jobNumber = editForm.jobNumber.trim();
    const ticketNumber = editForm.ticketNumber.trim();
    if (!jobNumber) return toast.error("Job Number is required.");
    if (!ticketNumber) return toast.error("Ticket Number is required.");
    if (jobNumber.toLowerCase() === ticketNumber.toLowerCase()) return toast.error("Job Number and Ticket Number cannot be identical.");
    if (tickets.some((ticket) => ticket.id !== editingTicket.id && (ticket.jobNumber || "").toLowerCase() === jobNumber.toLowerCase())) return toast.error("Job Number already exists.");
    if (tickets.some((ticket) => ticket.id !== editingTicket.id && (ticket.ticketNumber || ticket.id).toLowerCase() === ticketNumber.toLowerCase())) return toast.error("Ticket Number already exists.");
    setTickets((current) => current.map((ticket) => ticket.id === editingTicket.id ? { ...ticket, ...editForm, jobNumber, ticketNumber, id: ticketNumber, amount: Number(editForm.amount) } : ticket));
    setEditingTicket(null);
    toast.success("Repair ticket updated.");
  };

  const deleteTicket = (ticket: RepairTicket) => {
    if (!window.confirm(`Delete ${ticket.id} permanently?`)) return;
    setTickets((current) => current.filter((item) => item.id !== ticket.id));
    toast.success("Repair ticket deleted.");
  };

  const inProgressCount = tickets.filter((ticket) =>
    ["received", "diagnosing", "repairing", "testing", "pending"].includes(ticket.status),
  ).length;
  const readyCount = tickets.filter((ticket) => ticket.status === "ready").length;
  const waitingPartsCount = tickets.filter((ticket) => ticket.status === "waiting_parts").length;

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.jobNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.ticketNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.device.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const view = searchParams.get("view");
    const matchesView = view === "today"
      ? ticket.createdAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)
      : view === "active"
        ? ["received", "diagnosing", "repairing", "testing", "pending", "waiting_approval"].includes(ticket.status)
        : true;
    return matchesSearch && matchesStatus && matchesPriority && matchesView;
  });

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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, job number, customer, or device..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="scrap">SCRAP</SelectItem>
                <SelectItem value="diagnosing">Diagnosing</SelectItem>
                <SelectItem value="repairing">Repairing</SelectItem>
                <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="to_return">To Return</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Job Number</TableHead>
                  <TableHead>Ticket Number</TableHead>
                  <TableHead>Repair ID</TableHead>
                  <TableHead>Open</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Est. Completion</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                      No repair tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => {
                    const status = statusConfig[ticket.status];
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell className="font-medium">{ticket.jobNumber || "-"}</TableCell>
                        <TableCell className="font-medium">{ticket.ticketNumber || ticket.id}</TableCell>
                        <TableCell className="font-medium">{ticket.repairId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.openStatus}</Badge>
                        </TableCell>
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
                        <TableCell>{ticket.device}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{ticket.issue}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`capitalize font-medium ${priorityColors[ticket.priority]}`}
                          >
                            {ticket.priority}
                          </span>
                        </TableCell>
                        <TableCell>{ticket.technician}</TableCell>
                        <TableCell>{ticket.estimatedCompletion}</TableCell>
                        <TableCell>₨{ticket.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={`/repairs/${ticket.id}`}><Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button></Link>
                            {isAdmin && <Button variant="outline" size="icon" title="Edit" onClick={() => openEdit(ticket)}><Pencil className="h-4 w-4" /></Button>}
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
        </CardContent>
      </Card>
      <Dialog open={Boolean(editingTicket)} onOpenChange={(open) => !open && setEditingTicket(null)}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Edit Repair Ticket {editingTicket?.id}</DialogTitle></DialogHeader><form onSubmit={saveEdit} className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Job Number</Label><Input value={editForm.jobNumber} onChange={(e) => setEditForm({ ...editForm, jobNumber: e.target.value })} required /><p className="text-xs text-muted-foreground">Customer ko diya jane wala repair reference number.</p></div><div className="space-y-2"><Label>Ticket Number</Label><Input value={editForm.ticketNumber} onChange={(e) => setEditForm({ ...editForm, ticketNumber: e.target.value })} required /><p className="text-xs text-muted-foreground">Shop mein device ke sath use hone wala internal ticket number.</p></div><div className="space-y-2"><Label>Customer</Label><Input value={editForm.customer} onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })} required /></div><div className="space-y-2"><Label>Device</Label><Input value={editForm.device} onChange={(e) => setEditForm({ ...editForm, device: e.target.value })} required /></div><div className="space-y-2 md:col-span-2"><Label>Issue</Label><Input value={editForm.issue} onChange={(e) => setEditForm({ ...editForm, issue: e.target.value })} required /></div><div className="space-y-2"><Label>Status</Label><Select value={editForm.status} onValueChange={(status) => setEditForm({ ...editForm, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusConfig).map(([value, item]) => <SelectItem key={value} value={value}>{item.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Priority</Label><Select value={editForm.priority} onValueChange={(priority) => setEditForm({ ...editForm, priority })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Estimated Completion</Label><Input type="date" value={editForm.estimatedCompletion} onChange={(e) => setEditForm({ ...editForm, estimatedCompletion: e.target.value })} /></div><div className="space-y-2"><Label>Amount</Label><Input type="number" min="0" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setEditingTicket(null)}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter></form></DialogContent></Dialog>
    </div>
  );
}
