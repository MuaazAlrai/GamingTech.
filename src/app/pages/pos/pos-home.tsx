import { Link } from "react-router";
import { ChevronDown, FileText, History, Wrench } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { PosSale } from "../../types/pos-sale";

const money = (value: number) => `Rs ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function POSHome() {
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const today = new Date().toDateString();
  const repairInvoices = sales.filter((sale) => sale.invoiceType === "repair" || sale.repairId);
  const todaysSales = repairInvoices.filter((sale) => new Date(sale.date).toDateString() === today && (sale.status ?? "completed") === "completed");
  const todaysTotal = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
  const pendingAmount = repairInvoices.reduce((sum, sale) => sum + Math.max(0, sale.pendingBalance ?? sale.total - (sale.paidAmount ?? sale.total)), 0);

  return (
    <div className="grid min-h-[calc(100vh-9rem)] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="overflow-hidden border-0 bg-white shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between rounded-lg px-3 py-3 font-semibold text-slate-800">
            <span className="flex items-center gap-3">
              <Wrench className="h-5 w-5" />
              Repair POS
            </span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <Link to="/pos/sale" className="ml-5 mt-1 flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-3 font-semibold text-primary">
            <FileText className="h-5 w-5" />
            New Repair Invoice
          </Link>
          <Link to="/pos/sales-history" className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-slate-600 hover:bg-muted hover:text-slate-900">
            <History className="h-5 w-5" />
            Repair Invoice History
          </Link>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="rounded-xl bg-primary px-5 py-4 font-semibold text-primary-foreground">
          Repair POS
        </div>
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <Link to="/pos/sale" className="flex max-w-md items-center gap-4 rounded-xl border bg-white p-5 shadow-sm transition hover:border-primary hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Repair Invoice</h2>
                <p className="mt-1 text-sm text-muted-foreground">Select a repair ticket, add repair work, parts, payment, and print.</p>
              </div>
            </Link>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Today Repair Billing</p>
                <p className="mt-2 text-2xl font-bold">{money(todaysTotal)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Repair Invoices</p>
                <p className="mt-2 text-2xl font-bold">{todaysSales.length}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Pending Balance</p>
                <p className="mt-2 text-2xl font-bold">{money(pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
