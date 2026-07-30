import { AlertTriangle, Banknote, CheckCircle2, Clock, Package, Users, Wrench } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { Customer } from "../../types/customer";
import type { Part } from "../../types/part";
import type { PosSale } from "../../types/pos-sale";
import type { RepairTicket } from "../../types/repair-ticket";
import { formatAmount } from "../../utils/formatting";
import { getRepairDueState, labelForRepairStatus } from "../../utils/repair-status";

const money = (value: number) => formatAmount(value, 0);
const todayKey = () => new Date().toISOString().slice(0, 10);

const repairTotal = (repair: RepairTicket) => {
  if (repair.invoiceItems?.length) return repair.invoiceItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const partsTotal = (repair.partsUsed ?? []).reduce((sum, part) => sum + part.quantity * part.cost, 0);
  return Math.max(0, partsTotal + (repair.labourCharges ?? repair.amount ?? 0) - (repair.discount ?? 0));
};

const repairPaid = (repair: RepairTicket) =>
  (repair.paidAmount ?? 0) + (repair.payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);

export function Reports() {
  const [repairs] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [invoices] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [customers] = usePersistentState<Customer[]>("gamingtech.customers", []);
  const [parts] = usePersistentState<Part[]>("gamingtech.parts", []);

  const repairInvoices = invoices.filter((invoice) => invoice.invoiceType === "repair" || invoice.repairId);
  const today = todayKey();
  const todaysInvoices = repairInvoices.filter((invoice) => invoice.date?.slice(0, 10) === today);
  const revenue = repairInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paid = repairInvoices.reduce((sum, invoice) => sum + (invoice.paidAmount ?? 0), 0);
  const pending = repairInvoices.reduce((sum, invoice) => sum + Math.max(0, invoice.pendingBalance ?? invoice.total - (invoice.paidAmount ?? 0)), 0);
  const activeRepairs = repairs.filter((repair) => !["completed", "ready", "delivered", "cancelled", "dead", "scrap"].includes(repair.status));
  const readyRepairs = repairs.filter((repair) => ["completed", "ready"].includes(repair.status));
  const overdueRepairs = repairs.filter((repair) => getRepairDueState(repair).isOverdue);
  const lowStock = parts.filter((part) => part.stock <= part.reorderLevel);
  const pendingRepairPayments = repairs
    .map((repair) => ({ repair, total: repairTotal(repair), paid: repairPaid(repair) }))
    .filter((row) => row.total - row.paid > 0)
    .sort((a, b) => (b.total - b.paid) - (a.total - a.paid))
    .slice(0, 8);
  const recentInvoices = [...repairInvoices].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const statusRows = Object.entries(
    repairs.reduce<Record<string, number>>((rows, repair) => {
      rows[repair.status] = (rows[repair.status] ?? 0) + 1;
      return rows;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="mt-1 text-muted-foreground">Repair, invoice, payment, customer, and stock reports.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard icon={Banknote} label="Total Repair Revenue" value={money(revenue)} helper={`Today: ${money(todaysInvoices.reduce((sum, invoice) => sum + invoice.total, 0))}`} />
        <ReportCard icon={Clock} label="Pending Payments" value={money(pending)} helper={`Paid: ${money(paid)}`} />
        <ReportCard icon={Wrench} label="Active Repairs" value={String(activeRepairs.length)} helper={`${readyRepairs.length} ready/completed`} />
        <ReportCard icon={Users} label="Customers" value={String(customers.length)} helper={`${repairInvoices.length} repair invoices`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Repair Status Report</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {statusRows.length === 0 ? <Empty text="No repair status data yet." /> : statusRows.map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">{labelForRepairStatus(status)}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Due / Overdue Report</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3"><span>Overdue Repairs</span><Badge variant="destructive">{overdueRepairs.length}</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span>Due Today</span><Badge variant="outline">{repairs.filter((repair) => getRepairDueState(repair).isDueToday).length}</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span>Due Within 3 Days</span><Badge variant="outline">{repairs.filter((repair) => getRepairDueState(repair).isWithinThreeDays).length}</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span>Ready for Pickup</span><Badge>{readyRepairs.length}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Inventory Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3"><span>Total Items</span><Badge variant="outline">{parts.length}</Badge></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span>Low Stock Items</span><Badge variant={lowStock.length ? "destructive" : "default"}>{lowStock.length}</Badge></div>
            {lowStock.slice(0, 4).map((part) => <p key={part.id} className="text-sm text-muted-foreground">{part.name}: {part.stock} left</p>)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Repair Invoices</CardTitle></CardHeader>
          <CardContent><ReportTable headers={["Invoice", "Customer", "Device", "Status", "Total", "Pending"]} rows={recentInvoices.map((invoice) => [invoice.id, invoice.customerName || "Customer", invoice.deviceName || invoice.deviceNumber || "-", invoice.invoiceStatus?.replace("_", " ") || "-", money(invoice.total), money(Math.max(0, invoice.pendingBalance ?? 0))])} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pending Payment Report</CardTitle></CardHeader>
          <CardContent><ReportTable headers={["Invoice", "Customer", "Device", "Total", "Paid", "Remaining"]} rows={pendingRepairPayments.map(({ repair, total, paid }) => [repair.invoiceNumber || repair.id, repair.customer, repair.device, money(total), money(paid), money(total - paid)])} /></CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReportCard({ icon: Icon, label, value, helper }: { icon: typeof AlertTriangle; label: string; value: string; helper: string }) {
  return <Card><CardContent className="flex items-center justify-between gap-4 p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{helper}</p></div><div className="rounded-lg bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div></CardContent></Card>;
}

function ReportTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow>{headers.map((header) => <TableHead key={header}>{header}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.length === 0 ? <TableRow><TableCell colSpan={headers.length} className="py-8 text-center text-muted-foreground">No data yet.</TableCell></TableRow> : rows.map((row, index) => <TableRow key={index}>{row.map((cell, cellIndex) => <TableCell key={`${index}-${cellIndex}`}>{cell}</TableCell>)}</TableRow>)}</TableBody></Table></div>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border p-4 text-sm text-muted-foreground">{text}</p>;
}
