import { AlertCircle, CheckCircle, DollarSign, FileText } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { DataPagination } from "../../components/shared/data-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { usePagination } from "../../hooks/use-pagination";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { CustomerPayment } from "../../types/customer";
import type { PosSale } from "../../types/pos-sale";
import type { RepairTicket } from "../../types/repair-ticket";
import { formatAmount } from "../../utils/formatting";
import { displayInvoiceNumber } from "../../utils/invoice-number";

const money = (value: number) => formatAmount(value);

type BillingRow = {
  id: string;
  date: string;
  customer: string;
  type: "POS Sale" | "Repair" | "Payment";
  total: number;
  paid: number;
  pending: number;
  status: string;
  detail: string;
};

export function BillingDashboard() {
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [repairs] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [payments] = usePersistentState<CustomerPayment[]>("gamingtech.customerPayments", []);

  const completedSales = sales.filter((sale) => (sale.status ?? "completed") === "completed");
  const activeRepairs = repairs.filter((ticket) => !["dead", "scrap"].includes(ticket.status));
  const paymentByCustomer = payments.reduce<Record<string, number>>((rows, payment) => {
    rows[payment.customerId] = (rows[payment.customerId] ?? 0) + payment.amount;
    return rows;
  }, {});

  const saleRows: BillingRow[] = completedSales.map((sale) => {
    const paid = sale.paidAmount ?? sale.total;
    const pending = Math.max(0, sale.total - paid);
    return {
      id: sale.id,
      date: sale.date,
      customer: sale.customerName ?? "Walk-in Customer",
      type: "POS Sale",
      total: sale.total,
      paid,
      pending,
      status: pending > 0 ? "pending" : "paid",
      detail: sale.items.map((item) => `${item.name} x${item.quantity}`).join(", "),
    };
  });

  const repairRows: BillingRow[] = activeRepairs.map((ticket) => {
    const extraPaid = ticket.customerId ? paymentByCustomer[ticket.customerId] ?? 0 : 0;
    const paid = Math.min(ticket.amount, extraPaid);
    const pending = Math.max(0, ticket.amount - paid);
    return {
      id: displayInvoiceNumber(ticket.invoiceNumber, ticket.ticketNumber, ticket.id),
      date: ticket.createdAt,
      customer: ticket.customer,
      type: "Repair",
      total: ticket.amount,
      paid,
      pending,
      status: ticket.openStatus === "Closed" || pending === 0 ? "paid" : "pending",
      detail: `${ticket.device} - ${ticket.issue}`,
    };
  });

  const paymentRows: BillingRow[] = payments.map((payment) => ({
    id: payment.id,
    date: payment.date,
    customer: completedSales.find((sale) => sale.customerId === payment.customerId)?.customerName
      ?? repairs.find((ticket) => ticket.customerId === payment.customerId)?.customer
      ?? payment.customerId,
    type: "Payment",
    total: 0,
    paid: payment.amount,
    pending: 0,
    status: "paid",
    detail: payment.note || payment.method,
  }));

  const rows = [...saleRows, ...repairRows, ...paymentRows].sort((a, b) => b.date.localeCompare(a.date));
  const billingPagination = usePagination(rows, 10);
  const invoiceRows = [...saleRows, ...repairRows];
  const totalInvoices = invoiceRows.length;
  const totalBilled = invoiceRows.reduce((sum, row) => sum + row.total, 0);
  const totalPaid = rows.reduce((sum, row) => sum + row.paid, 0);
  const totalPending = Math.max(0, invoiceRows.reduce((sum, row) => sum + row.pending, 0));

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Invoices</h1>
        <p className="text-muted-foreground mt-1">Customer billing history from repairs, POS sales, and payments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Invoices</p><h3 className="mt-1 text-2xl font-bold">{totalInvoices}</h3></div><div className="rounded-lg bg-primary/10 p-3 text-primary"><FileText className="h-5 w-5" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Billed</p><h3 className="mt-1 text-2xl font-bold">{money(totalBilled)}</h3></div><div className="rounded-lg bg-success/10 p-3 text-success"><DollarSign className="h-5 w-5" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Paid</p><h3 className="mt-1 text-2xl font-bold">{money(totalPaid)}</h3></div><div className="rounded-lg bg-success/10 p-3 text-success"><CheckCircle className="h-5 w-5" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending</p><h3 className="mt-1 text-2xl font-bold">{money(totalPending)}</h3></div><div className="rounded-lg bg-warning/10 p-3 text-warning"><AlertCircle className="h-5 w-5" /></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Billing History</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table className="table-fixed">
              <TableHeader><TableRow><TableHead className="w-[150px]">Date</TableHead><TableHead className="w-[140px]">Invoice Number</TableHead><TableHead className="w-[160px]">Customer</TableHead><TableHead className="w-[90px]">Type</TableHead><TableHead>Detail</TableHead><TableHead className="w-[90px]">Status</TableHead><TableHead className="w-[90px] text-right">Total</TableHead><TableHead className="hidden w-[90px] text-right md:table-cell">Paid</TableHead><TableHead className="hidden w-[90px] text-right md:table-cell">Pending</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.length === 0 ? <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">No billing history yet.</TableCell></TableRow> : billingPagination.pagedItems.map((row) => (
                  <TableRow key={`${row.type}-${row.id}-${row.date}`}>
                    <TableCell className="truncate">{new Date(row.date).toLocaleString()}</TableCell>
                    <TableCell className="truncate font-medium">{row.id}</TableCell>
                    <TableCell className="truncate">{row.customer}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell className="max-w-[260px] truncate">{row.detail}</TableCell>
                    <TableCell><Badge variant={row.status === "paid" ? "default" : "secondary"}>{row.status}</Badge></TableCell>
                    <TableCell className="text-right">{row.total ? money(row.total) : "-"}</TableCell>
                    <TableCell className="hidden text-right text-success md:table-cell">{money(row.paid)}</TableCell>
                    <TableCell className="hidden text-right text-warning md:table-cell">{row.pending ? money(row.pending) : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataPagination
            page={billingPagination.page}
            totalPages={billingPagination.totalPages}
            startItem={billingPagination.startItem}
            endItem={billingPagination.endItem}
            totalItems={billingPagination.totalItems}
            onPageChange={billingPagination.setPage}
            label="billing records"
          />
        </CardContent>
      </Card>
    </div>
  );
}
