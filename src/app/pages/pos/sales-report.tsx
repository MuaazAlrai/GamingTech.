import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { CustomerPayment } from "../../types/customer";
import type { BusinessExpense } from "../../types/expense";
import type { Part } from "../../types/part";
import type { PosSale } from "../../types/pos-sale";

const money = (value: number) => `Rs ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
type PeriodRow = { key: string; invoices: number; sales: number; paid: number; pending: number; cost: number; profit: number; expenses: number };

export function SalesReport() {
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [parts] = usePersistentState<Part[]>("gamingtech.parts", []);
  const [payments] = usePersistentState<CustomerPayment[]>("gamingtech.customerPayments", []);
  const [expenses, setExpenses] = usePersistentState<BusinessExpense[]>("gamingtech.expenses", []);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().slice(0, 10), category: "General", description: "", amount: "" });
  const completedSales = sales.filter((sale) => (sale.status ?? "completed") === "completed");
  const partMap = new Map(parts.map((part) => [part.id, part]));
  const saleCost = (sale: PosSale) => sale.items.reduce((sum, item) => sum + (item.costPrice ?? partMap.get(item.id)?.costPrice ?? 0) * item.quantity, 0);
  const laterPaymentsByCustomer = payments.reduce<Record<string, number>>((rows, payment) => { rows[payment.customerId] = (rows[payment.customerId] ?? 0) + payment.amount; return rows; }, {});

  const buildPeriods = (length: 10 | 7): PeriodRow[] => Object.values(completedSales.reduce<Record<string, PeriodRow>>((rows, sale) => {
    const key = sale.date.slice(0, length);
    const row = rows[key] ?? { key, invoices: 0, sales: 0, paid: 0, pending: 0, cost: 0, profit: 0, expenses: 0 };
    const cost = saleCost(sale);
    const netRevenue = sale.subtotal - (sale.discount ?? 0);
    rows[key] = { ...row, invoices: row.invoices + 1, sales: row.sales + sale.total, paid: row.paid + (sale.paidAmount ?? sale.total), pending: row.pending + (sale.pendingBalance ?? 0), cost: row.cost + cost, profit: row.profit + netRevenue - cost };
    return rows;
  }, {})).map((row) => {
    const periodExpenses = expenses.filter((expense) => expense.date.slice(0, length) === row.key).reduce((sum, expense) => sum + expense.amount, 0);
    return { ...row, expenses: periodExpenses, profit: row.profit - periodExpenses };
  }).sort((a, b) => b.key.localeCompare(a.key));

  const dailyRows = buildPeriods(10);
  const monthlyRows = buildPeriods(7);
  const topItems = Object.values(completedSales.flatMap((sale) => sale.items).reduce<Record<string, { name: string; quantity: number; revenue: number; profit: number }>>((rows, item) => {
    const existing = rows[item.id] ?? { name: item.name, quantity: 0, revenue: 0, profit: 0 };
    const revenue = item.price * item.quantity;
    const cost = (item.costPrice ?? partMap.get(item.id)?.costPrice ?? 0) * item.quantity;
    rows[item.id] = { name: item.name, quantity: existing.quantity + item.quantity, revenue: existing.revenue + revenue, profit: existing.profit + revenue - cost };
    return rows;
  }, {})).sort((a, b) => b.quantity - a.quantity);
  const paymentRows = completedSales.map((sale) => ({ id: sale.id, date: sale.date, customer: sale.customerName ?? "Walk-in Customer", method: sale.paymentMethod, invoice: sale.total, paid: sale.paidAmount ?? sale.total, pending: sale.pendingBalance ?? 0 }));
  const khataPaymentRows = payments.map((payment) => ({ id: payment.id, date: payment.date, customer: completedSales.find((sale) => sale.customerId === payment.customerId)?.customerName ?? payment.customerId, method: payment.method, invoice: 0, paid: payment.amount, pending: 0 }));
  const allPaymentRows = [...paymentRows, ...khataPaymentRows].sort((a, b) => b.date.localeCompare(a.date));
  const totalSales = completedSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const grossProfit = completedSales.reduce((sum, sale) => sum + sale.subtotal - (sale.discount ?? 0) - saleCost(sale), 0);
  const invoicePaid = completedSales.reduce((sum, sale) => sum + (sale.paidAmount ?? sale.total), 0);
  const laterPaid = Object.values(laterPaymentsByCustomer).reduce((sum, amount) => sum + amount, 0);
  const pending = Math.max(0, totalSales - invoicePaid - laterPaid);

  const saveExpense = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(expenseForm.amount);
    if (amount <= 0) return toast.error("Enter a valid expense amount.");
    setExpenses((current) => [{ id: `EXP-${Date.now()}`, date: new Date(`${expenseForm.date}T12:00:00`).toISOString(), category: expenseForm.category.trim(), description: expenseForm.description.trim(), amount }, ...current]);
    setExpenseOpen(false);
    setExpenseForm({ date: new Date().toISOString().slice(0, 10), category: "General", description: "", amount: "" });
    toast.success("Expense saved.");
  };

  const PeriodTable = ({ rows, monthly = false }: { rows: PeriodRow[]; monthly?: boolean }) => <div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>{monthly ? "Month" : "Date"}</TableHead><TableHead className="text-right">Invoices</TableHead><TableHead className="text-right">Sales</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Pending</TableHead><TableHead className="text-right">Expenses</TableHead><TableHead className="text-right">Net Profit</TableHead></TableRow></TableHeader><TableBody>{rows.length === 0 ? <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No report data yet.</TableCell></TableRow> : rows.map((row) => <TableRow key={row.key}><TableCell className="font-medium">{monthly ? new Date(`${row.key}-01T12:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : new Date(`${row.key}T12:00:00`).toLocaleDateString()}</TableCell><TableCell className="text-right">{row.invoices}</TableCell><TableCell className="text-right">{money(row.sales)}</TableCell><TableCell className="text-right text-success">{money(row.paid)}</TableCell><TableCell className="text-right text-warning">{money(row.pending)}</TableCell><TableCell className="text-right text-destructive">{money(row.expenses)}</TableCell><TableCell className="text-right font-semibold">{money(row.profit)}</TableCell></TableRow>)}</TableBody></Table></div>;

  return <div className="space-y-6 pb-20 lg:pb-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><Link to="/pos"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link><div><h1 className="text-3xl font-bold">POS Reports</h1><p className="mt-1 text-muted-foreground">Daily, monthly, payment and profitability reports</p></div></div><Button onClick={() => setExpenseOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Expense</Button></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Sales</p><p className="mt-1 text-2xl font-bold">{money(totalSales)}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending Payments</p><p className="mt-1 text-2xl font-bold text-warning">{money(pending)}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Expenses</p><p className="mt-1 text-2xl font-bold text-destructive">{money(totalExpenses)}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Net Profit</p><p className="mt-1 text-2xl font-bold">{money(grossProfit - totalExpenses)}</p></CardContent></Card></div>
    <Tabs defaultValue="daily"><TabsList className="grid h-auto w-full grid-cols-2 lg:grid-cols-4"><TabsTrigger value="daily">Daily Sales</TabsTrigger><TabsTrigger value="monthly">Monthly Report</TabsTrigger><TabsTrigger value="payments">Payment Report</TabsTrigger><TabsTrigger value="items">Top Items</TabsTrigger></TabsList><TabsContent value="daily"><Card><CardHeader><CardTitle>Daily Sales Report</CardTitle></CardHeader><CardContent><PeriodTable rows={dailyRows} /></CardContent></Card></TabsContent><TabsContent value="monthly"><Card><CardHeader><CardTitle>Monthly Report</CardTitle></CardHeader><CardContent><PeriodTable rows={monthlyRows} monthly /></CardContent></Card></TabsContent><TabsContent value="payments"><Card><CardHeader><CardTitle>Payment Report</CardTitle></CardHeader><CardContent><div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Customer</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Invoice</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Pending</TableHead></TableRow></TableHeader><TableBody>{allPaymentRows.length === 0 ? <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No payment records yet.</TableCell></TableRow> : allPaymentRows.map((row) => <TableRow key={row.id}><TableCell>{new Date(row.date).toLocaleString()}</TableCell><TableCell className="font-medium">{row.id}</TableCell><TableCell>{row.customer}</TableCell><TableCell>{row.method}</TableCell><TableCell className="text-right">{row.invoice ? money(row.invoice) : "—"}</TableCell><TableCell className="text-right text-success">{money(row.paid)}</TableCell><TableCell className="text-right text-warning">{row.pending ? money(row.pending) : "—"}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card></TabsContent><TabsContent value="items"><Card><CardHeader><CardTitle>Top-selling Items</CardTitle></CardHeader><CardContent><div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Quantity</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Gross Profit</TableHead></TableRow></TableHeader><TableBody>{topItems.length === 0 ? <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No sales data yet.</TableCell></TableRow> : topItems.map((item) => <TableRow key={item.name}><TableCell className="font-medium">{item.name}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">{money(item.revenue)}</TableCell><TableCell className="text-right">{money(item.profit)}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card></TabsContent></Tabs>
    <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}><DialogContent><DialogHeader><DialogTitle>Add Business Expense</DialogTitle></DialogHeader><form onSubmit={saveExpense} className="space-y-4"><div><Label htmlFor="expenseDate">Date</Label><Input id="expenseDate" type="date" value={expenseForm.date} onChange={(event) => setExpenseForm({ ...expenseForm, date: event.target.value })} required /></div><div><Label htmlFor="expenseCategory">Category</Label><Input id="expenseCategory" value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })} required /></div><div><Label htmlFor="expenseDescription">Description</Label><Input id="expenseDescription" value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} required /></div><div><Label htmlFor="expenseAmount">Amount</Label><Input id="expenseAmount" type="number" min="1" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} required /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setExpenseOpen(false)}>Cancel</Button><Button type="submit">Save Expense</Button></DialogFooter></form></DialogContent></Dialog>
  </div>;
}
