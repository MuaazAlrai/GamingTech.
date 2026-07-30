import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../auth/auth-context";
import { DataPagination } from "../../components/shared/data-pagination";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { usePagination } from "../../hooks/use-pagination";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { Customer, CustomerPayment } from "../../types/customer";
import type { PosSale } from "../../types/pos-sale";
import type { RepairTicket } from "../../types/repair-ticket";
import type { CashShift } from "../../types/staff";
import { formatAmount } from "../../utils/formatting";
import { getRepairDueState, labelForRepairStatus } from "../../utils/repair-status";
import { logStaffActivity } from "../../utils/staff-activity";

const money = (value: number) => formatAmount(value);
const normalizePhone = (value: string) => value.replace(/\D/g, "");

const repairGrandTotal = (repair: RepairTicket) => {
  if (repair.invoiceItems?.length) {
    return repair.invoiceItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  const partsTotal = (repair.partsUsed ?? []).reduce((sum, part) => sum + part.quantity * part.cost, 0);
  const labourCharges = repair.labourCharges ?? Math.max(0, repair.amount - partsTotal);
  return Math.max(0, partsTotal + labourCharges - (repair.discount ?? 0));
};

const repairPaidAmount = (repair: RepairTicket) =>
  (repair.paidAmount ?? 0) + (repair.payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);

export function CustomerProfile() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [customers] = usePersistentState<Customer[]>("gamingtech.customers", []);
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [repairs] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [payments, setPayments] = usePersistentState<CustomerPayment[]>("gamingtech.customerPayments", []);
  const [shifts] = usePersistentState<CashShift[]>("gamingtech.cashShifts", []);
  const activeShift = shifts.find((shift) => shift.userId === user?.uid && shift.status === "open");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "Cash", note: "" });
  const customer = customers.find((item) => item.id === id);

  if (!customer) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-muted-foreground">Customer not found.</p>
          <Button onClick={() => navigate("/customers")}>Back to Customers</Button>
        </CardContent>
      </Card>
    );
  }

  const normalizedCustomerName = customer.name.toLowerCase().trim();
  const normalizedCustomerPhone = normalizePhone(customer.phone);

  const customerSales = sales.filter((sale) => {
    const salePhone = normalizePhone(String(sale.customerPhone ?? ""));
    return (
      (sale.customerId === customer.id || salePhone === normalizedCustomerPhone || sale.customerName?.toLowerCase().trim() === normalizedCustomerName) &&
      (sale.status ?? "completed") === "completed"
    );
  });

  const customerRepairs = repairs.filter((repair) => {
    const repairPhone = normalizePhone(String(repair.customerPhone ?? ""));
    return repair.customerId === customer.id || repairPhone === normalizedCustomerPhone || repair.customer.toLowerCase().trim() === normalizedCustomerName;
  });

  const customerRepairInvoices = customerSales.filter((sale) => sale.invoiceType === "repair" || sale.repairId);
  const customerPayments = payments.filter((payment) => payment.customerId === customer.id);
  const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.total, 0);
  const invoicePaid = customerSales.reduce((sum, sale) => sum + (sale.paidAmount ?? sale.total), 0);
  const laterPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaid = invoicePaid + laterPaid;
  const pendingBalance = Math.max(0, totalPurchases - totalPaid);
  const openRepairs = customerRepairs.filter((repair) => !["completed", "ready", "delivered", "cancelled", "dead", "scrap"].includes(repair.status));
  const history = [
    ...customerSales.map((sale) => ({
      id: sale.id,
      date: sale.date,
      detail: `Invoice ${sale.id} - ${sale.deviceName || sale.deviceNumber || "Device"}`,
      method: sale.paymentMethod,
      debit: sale.total,
      credit: sale.paidAmount ?? sale.total,
    })),
    ...customerPayments.map((payment) => ({
      id: payment.id,
      date: payment.date,
      detail: payment.note || "Khata payment",
      method: payment.method,
      debit: 0,
      credit: payment.amount,
    })),
    ...customerRepairs.map((repair) => ({
      id: `REPAIR-${repair.id}`,
      date: repair.createdAt,
      detail: `Repair ${repair.invoiceNumber || repair.ticketNumber || repair.id} - ${labelForRepairStatus(repair.status)}`,
      method: "Repair Status",
      debit: 0,
      credit: 0,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const historyPagination = usePagination(history, 10);
  const invoicePagination = usePagination(customerRepairInvoices, 10);
  const repairPagination = usePagination(customerRepairs, 10);

  const recordPayment = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(paymentForm.amount);
    if (amount <= 0) return toast.error("Enter a valid payment amount.");
    if (amount > pendingBalance) return toast.error("Payment cannot exceed the pending balance.");
    const paymentId = `PAY-${Date.now()}`;
    setPayments((current) => [{
      id: paymentId,
      customerId: customer.id,
      date: new Date().toISOString(),
      amount,
      method: paymentForm.method,
      note: paymentForm.note.trim(),
      cashierId: user?.uid,
      cashierName: user?.displayName || user?.email || "Staff",
      shiftId: activeShift?.id,
    }, ...current]);
    logStaffActivity(user, role, "payment.received", `${money(amount)} received from ${customer.name} by ${paymentForm.method}`, paymentId);
    setPaymentOpen(false);
    setPaymentForm({ amount: "", method: "Cash", note: "" });
    toast.success("Customer payment recorded.");
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Customer Ledger / Khata</h1>
          <p className="mt-1 text-muted-foreground">Purchases, repair invoices, payments and pending balance</p>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{customer.phone}</p>
              <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />Joined {new Date(customer.createdAt ?? Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Total Purchases</p>
            <p className="text-2xl font-bold">{money(totalPurchases)}</p>
            <p className="mt-3 text-sm text-muted-foreground">Repair Invoices</p>
            <p className="text-xl font-semibold">{customerRepairInvoices.length}</p>
            <p className="mt-3 text-sm text-muted-foreground">Total Paid</p>
            <p className="text-xl font-semibold text-success">{money(totalPaid)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Pending Balance</p>
            <p className="text-3xl font-bold text-destructive">{money(pendingBalance)}</p>
            <p className="mt-3 text-sm text-muted-foreground">Open Repairs</p>
            <p className="text-xl font-semibold">{openRepairs.length}</p>
            <Button className="mt-4 w-full" onClick={() => setPaymentOpen(true)} disabled={pendingBalance <= 0}>
              <Plus className="mr-2 h-4 w-4" />Receive Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment & Purchase History</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Date</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[120px]">Method</TableHead>
                  <TableHead className="text-right">Purchase</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No purchases or payments yet.</TableCell>
                  </TableRow>
                ) : historyPagination.pagedItems.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="truncate">{new Date(row.date).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{row.detail}</TableCell>
                    <TableCell>{row.method}</TableCell>
                    <TableCell className="text-right">{row.debit ? money(row.debit) : "-"}</TableCell>
                    <TableCell className="text-right text-success">{row.credit ? money(row.credit) : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataPagination
            page={historyPagination.page}
            totalPages={historyPagination.totalPages}
            startItem={historyPagination.startItem}
            endItem={historyPagination.endItem}
            totalItems={historyPagination.totalItems}
            onPageChange={historyPagination.setPage}
            label="history records"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Repair Invoices</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Invoice</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead className="w-[110px]">Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Paid</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerRepairInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No repair invoices for this customer.</TableCell>
                  </TableRow>
                ) : invoicePagination.pagedItems.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell className="truncate">{invoice.deviceName || invoice.deviceNumber || "-"}</TableCell>
                    <TableCell>{labelForRepairStatus(invoice.repairStatus || "received")}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{money(invoice.total)}</TableCell>
                    <TableCell className="hidden text-right sm:table-cell">{money(invoice.paidAmount ?? 0)}</TableCell>
                    <TableCell className="hidden text-right sm:table-cell">{money(Math.max(0, invoice.pendingBalance ?? invoice.total - (invoice.paidAmount ?? 0)))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataPagination
            page={invoicePagination.page}
            totalPages={invoicePagination.totalPages}
            startItem={invoicePagination.startItem}
            endItem={invoicePagination.endItem}
            totalItems={invoicePagination.totalItems}
            onPageChange={invoicePagination.setPage}
            label="repair invoices"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Customer Repair Records</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Invoice Number</TableHead>
                  <TableHead>Device Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Problem</TableHead>
                  <TableHead className="hidden xl:table-cell">Technician</TableHead>
                  <TableHead className="w-[130px]">Current Status</TableHead>
                  <TableHead className="hidden md:table-cell">Received Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Expected Return Date</TableHead>
                  <TableHead className="hidden md:table-cell">Due</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Remaining Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerRepairs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">No repair records for this customer.</TableCell>
                  </TableRow>
                ) : repairPagination.pagedItems.map((repair) => {
                  const grandTotal = repairGrandTotal(repair);
                  const remaining = Math.max(0, grandTotal - repairPaidAmount(repair));
                  const dueState = getRepairDueState(repair);
                  return (
                    <TableRow key={repair.id} className="cursor-pointer" onClick={() => navigate(`/repairs/${repair.id}`)}>
                      <TableCell>
                        <Link className="font-medium text-primary hover:underline" to={`/repairs/${repair.id}`} onClick={(event) => event.stopPropagation()}>
                          {repair.invoiceNumber || repair.ticketNumber || repair.id}
                        </Link>
                      </TableCell>
                      <TableCell className="truncate">{repair.device}</TableCell>
                      <TableCell className="hidden max-w-[240px] truncate lg:table-cell">{repair.issueDescription || repair.issue}</TableCell>
                      <TableCell className="hidden xl:table-cell">{repair.technician || "Unassigned"}</TableCell>
                      <TableCell>{labelForRepairStatus(repair.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">{repair.createdAt ? new Date(repair.createdAt).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{repair.estimatedCompletion ? new Date(repair.estimatedCompletion).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{dueState.label}</TableCell>
                      <TableCell className="text-right">{money(grandTotal)}</TableCell>
                      <TableCell className="hidden text-right sm:table-cell">{remaining ? money(remaining) : "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <DataPagination
            page={repairPagination.page}
            totalPages={repairPagination.totalPages}
            startItem={repairPagination.startItem}
            endItem={repairPagination.endItem}
            totalItems={repairPagination.totalItems}
            onPageChange={repairPagination.setPage}
            label="repair records"
          />
        </CardContent>
      </Card>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Receive Khata Payment</DialogTitle></DialogHeader>
          <form onSubmit={recordPayment} className="space-y-4">
            <div>
              <Label htmlFor="paymentAmount">Amount</Label>
              <Input id="paymentAmount" type="number" min="1" max={pendingBalance} value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} required />
              <p className="mt-1 text-xs text-muted-foreground">Pending: {money(pendingBalance)}</p>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentForm.method} onValueChange={(method) => setPaymentForm({ ...paymentForm, method })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentNote">Note</Label>
              <Input id="paymentNote" value={paymentForm.note} onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })} placeholder="Optional reference" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
              <Button type="submit">Save Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
