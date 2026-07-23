import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, MapPin, Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { Customer, CustomerPayment } from "../../types/customer";
import type { PosSale } from "../../types/pos-sale";
import type { CashShift } from "../../types/staff";
import { useAuth } from "../../auth/auth-context";
import { logStaffActivity } from "../../utils/staff-activity";

const money = (value: number) => `Rs ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function CustomerProfile() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [customers] = usePersistentState<Customer[]>("gamingtech.customers", []);
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [payments, setPayments] = usePersistentState<CustomerPayment[]>("gamingtech.customerPayments", []);
  const [shifts] = usePersistentState<CashShift[]>("gamingtech.cashShifts", []);
  const activeShift = shifts.find((shift) => shift.userId === user?.uid && shift.status === "open");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "Cash", note: "" });
  const customer = customers.find((item) => item.id === id);

  if (!customer) return <Card><CardContent className="p-8 text-center"><p className="mb-4 text-muted-foreground">Customer not found.</p><Button onClick={() => navigate("/customers")}>Back to Customers</Button></CardContent></Card>;

  const customerSales = sales.filter((sale) => sale.customerId === customer.id && (sale.status ?? "completed") === "completed");
  const customerPayments = payments.filter((payment) => payment.customerId === customer.id);
  const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.total, 0);
  const invoicePaid = customerSales.reduce((sum, sale) => sum + (sale.paidAmount ?? sale.total), 0);
  const laterPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaid = invoicePaid + laterPaid;
  const pendingBalance = Math.max(0, totalPurchases - totalPaid);
  const history = [
    ...customerSales.map((sale) => ({ id: sale.id, date: sale.date, detail: `Invoice ${sale.id}`, method: sale.paymentMethod, debit: sale.total, credit: sale.paidAmount ?? sale.total })),
    ...customerPayments.map((payment) => ({ id: payment.id, date: payment.date, detail: payment.note || "Khata payment", method: payment.method, debit: 0, credit: payment.amount })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const recordPayment = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(paymentForm.amount);
    if (amount <= 0) return toast.error("Enter a valid payment amount.");
    if (amount > pendingBalance) return toast.error("Payment cannot exceed the pending balance.");
    const paymentId = `PAY-${Date.now()}`;
    setPayments((current) => [{ id: paymentId, customerId: customer.id, date: new Date().toISOString(), amount, method: paymentForm.method, note: paymentForm.note.trim(), cashierId: user?.uid, cashierName: user?.displayName || user?.email || "Staff", shiftId: activeShift?.id }, ...current]);
    logStaffActivity(user, role, "payment.received", `${money(amount)} received from ${customer.name} by ${paymentForm.method}`, paymentId);
    setPaymentOpen(false);
    setPaymentForm({ amount: "", method: "Cash", note: "" });
    toast.success("Customer payment recorded.");
  };

  return <div className="space-y-6 pb-20 lg:pb-6">
    <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => navigate("/customers")}><ArrowLeft className="h-5 w-5" /></Button><div><h1 className="text-3xl font-bold">Customer Ledger / Khata</h1><p className="mt-1 text-muted-foreground">Purchases, payments and pending balance</p></div></div>
    <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3"><div><h2 className="text-2xl font-bold">{customer.name}</h2><div className="mt-3 space-y-2 text-sm"><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{customer.phone}</p><p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />{customer.address || "No address added"}</p><p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />Joined {new Date(customer.createdAt ?? (Number(customer.id) || Date.now())).toLocaleDateString()}</p></div></div><div className="rounded-lg bg-muted p-4"><p className="text-sm text-muted-foreground">Total Purchases</p><p className="text-2xl font-bold">{money(totalPurchases)}</p><p className="mt-3 text-sm text-muted-foreground">Total Paid</p><p className="text-xl font-semibold text-success">{money(totalPaid)}</p></div><div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Pending Balance</p><p className="text-3xl font-bold text-destructive">{money(pendingBalance)}</p><Button className="mt-4 w-full" onClick={() => setPaymentOpen(true)} disabled={pendingBalance <= 0}><Plus className="mr-2 h-4 w-4" />Receive Payment</Button></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Payment & Purchase History</CardTitle></CardHeader><CardContent><div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Details</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Purchase</TableHead><TableHead className="text-right">Paid</TableHead></TableRow></TableHeader><TableBody>{history.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No purchases or payments yet.</TableCell></TableRow> : history.map((row) => <TableRow key={row.id}><TableCell>{new Date(row.date).toLocaleString()}</TableCell><TableCell className="font-medium">{row.detail}</TableCell><TableCell>{row.method}</TableCell><TableCell className="text-right">{row.debit ? money(row.debit) : "—"}</TableCell><TableCell className="text-right text-success">{row.credit ? money(row.credit) : "—"}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
    <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}><DialogContent><DialogHeader><DialogTitle>Receive Khata Payment</DialogTitle></DialogHeader><form onSubmit={recordPayment} className="space-y-4"><div><Label htmlFor="paymentAmount">Amount</Label><Input id="paymentAmount" type="number" min="1" max={pendingBalance} value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} required /><p className="mt-1 text-xs text-muted-foreground">Pending: {money(pendingBalance)}</p></div><div><Label>Payment Method</Label><Select value={paymentForm.method} onValueChange={(method) => setPaymentForm({ ...paymentForm, method })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Card">Card</SelectItem><SelectItem value="Bank Transfer">Bank Transfer</SelectItem></SelectContent></Select></div><div><Label htmlFor="paymentNote">Note</Label><Input id="paymentNote" value={paymentForm.note} onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })} placeholder="Optional reference" /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button><Button type="submit">Save Payment</Button></DialogFooter></form></DialogContent></Dialog>
  </div>;
}
