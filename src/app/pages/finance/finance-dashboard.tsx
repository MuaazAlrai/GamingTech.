import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { CustomerPayment } from "../../types/customer";
import type { BusinessExpense } from "../../types/expense";
import type { Part } from "../../types/part";
import type { PosSale } from "../../types/pos-sale";
import type { RepairTicket } from "../../types/repair-ticket";

const money = (value: number) => `Rs ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

type LedgerRow = {
  id: string;
  date: string;
  source: string;
  description: string;
  income: number;
  expense: number;
};

export function FinanceDashboard() {
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [parts] = usePersistentState<Part[]>("gamingtech.parts", []);
  const [repairs] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [payments] = usePersistentState<CustomerPayment[]>("gamingtech.customerPayments", []);
  const [expenses] = usePersistentState<BusinessExpense[]>("gamingtech.expenses", []);

  const completedSales = sales.filter((sale) => (sale.status ?? "completed") === "completed");
  const partMap = new Map(parts.map((part) => [part.id, part]));
  const saleCost = (sale: PosSale) => sale.items.reduce((sum, item) => sum + (item.costPrice ?? partMap.get(item.id)?.costPrice ?? 0) * item.quantity, 0);
  const salesIncome = completedSales.reduce((sum, sale) => sum + (sale.paidAmount ?? sale.total), 0);
  const salesPending = completedSales.reduce((sum, sale) => sum + (sale.pendingBalance ?? 0), 0);
  const salesCost = completedSales.reduce((sum, sale) => sum + saleCost(sale), 0);
  const repairEstimateIncome = repairs.filter((ticket) => ["completed", "delivered"].includes(ticket.status)).reduce((sum, ticket) => sum + ticket.amount, 0);
  const laterPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = salesIncome + repairEstimateIncome + laterPayments;
  const netProfit = totalIncome - salesCost - totalExpenses;
  const cashBalance = totalIncome - totalExpenses;

  const ledgerRows: LedgerRow[] = [
    ...completedSales.map((sale) => ({
      id: sale.id,
      date: sale.date,
      source: "POS Sale",
      description: `${sale.customerName ?? "Walk-in Customer"} - ${sale.items.length} item(s)`,
      income: sale.paidAmount ?? sale.total,
      expense: saleCost(sale),
    })),
    ...repairs.filter((ticket) => ["completed", "delivered"].includes(ticket.status)).map((ticket) => ({
      id: ticket.ticketNumber || ticket.id,
      date: ticket.createdAt,
      source: "Repair",
      description: `${ticket.customer} - ${ticket.device}`,
      income: ticket.amount,
      expense: 0,
    })),
    ...payments.map((payment) => ({
      id: payment.id,
      date: payment.date,
      source: "Customer Payment",
      description: payment.note || payment.method,
      income: payment.amount,
      expense: 0,
    })),
    ...expenses.map((expense) => ({
      id: expense.id,
      date: expense.date,
      source: "Expense",
      description: `${expense.category} - ${expense.description}`,
      income: 0,
      expense: expense.amount,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <p className="text-muted-foreground mt-1">Income, expenses, profit, and cash flow from user history</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Income</p><h3 className="mt-1 text-2xl font-bold">{money(totalIncome)}</h3></div><div className="rounded-lg bg-success/10 p-3 text-success"><TrendingUp className="h-5 w-5" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Expenses</p><h3 className="mt-1 text-2xl font-bold">{money(totalExpenses + salesCost)}</h3></div><div className="rounded-lg bg-destructive/10 p-3 text-destructive"><TrendingDown className="h-5 w-5" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Net Profit</p><h3 className="mt-1 text-2xl font-bold">{money(netProfit)}</h3></div><div className="rounded-lg bg-primary/10 p-3 text-primary"><DollarSign className="h-5 w-5" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Cash Balance</p><h3 className="mt-1 text-2xl font-bold">{money(cashBalance)}</h3><p className="mt-1 text-xs text-warning">Pending: {money(salesPending)}</p></div><div className="rounded-lg bg-accent/10 p-3 text-accent"><Wallet className="h-5 w-5" /></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Finance Ledger</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Source</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Income</TableHead><TableHead className="text-right">Expense / Cost</TableHead><TableHead className="text-right">Net</TableHead></TableRow></TableHeader>
              <TableBody>
                {ledgerRows.length === 0 ? <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No finance history yet.</TableCell></TableRow> : ledgerRows.map((row) => (
                  <TableRow key={`${row.source}-${row.id}-${row.date}`}>
                    <TableCell>{new Date(row.date).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>{row.source}</TableCell>
                    <TableCell className="max-w-[320px] truncate">{row.description}</TableCell>
                    <TableCell className="text-right text-success">{row.income ? money(row.income) : "-"}</TableCell>
                    <TableCell className="text-right text-destructive">{row.expense ? money(row.expense) : "-"}</TableCell>
                    <TableCell className="text-right font-semibold">{money(row.income - row.expense)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
