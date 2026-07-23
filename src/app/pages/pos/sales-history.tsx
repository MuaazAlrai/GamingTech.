import { Link, useNavigate } from "react-router";
import { ArrowLeft, Ban, FileDown, Pencil, Printer, ReceiptText, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { PosSale } from "../../types/pos-sale";
import { printPosReceipt } from "../../utils/print-pos-receipt";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import type { Part, StockAdjustment } from "../../types/part";
import { printPosInvoice } from "../../utils/print-pos-invoice";
import { useAuth } from "../../auth/auth-context";
import { logStaffActivity } from "../../utils/staff-activity";

export function SalesHistory() {
  const navigate = useNavigate();
  const { user, role, hasPermission } = useAuth();
  const [sales, setSales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [products, setProducts] = usePersistentState<Part[]>("gamingtech.parts", []);
  const [, setStockAdjustments] = usePersistentState<StockAdjustment[]>("gamingtech.stockAdjustments", []);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSales = sales.filter((sale) => {
    const query = searchQuery.toLowerCase();
    return (
      sale.id.toLowerCase().includes(query) ||
      (sale.customerName ?? "walk-in customer").toLowerCase().includes(query) ||
      (sale.customerPhone ?? "").toLowerCase().includes(query) ||
      sale.paymentMethod.toLowerCase().includes(query) ||
      new Date(sale.date).toLocaleDateString().toLowerCase().includes(query) ||
      sale.items.some((item) => item.name.toLowerCase().includes(query))
    );
  });

  const closeSale = (sale: PosSale, status: "cancelled" | "refunded") => {
    if ((sale.status ?? "completed") !== "completed") return;
    const action = status === "refunded" ? "refund" : "cancel";
    if (!window.confirm(`Are you sure you want to ${action} ${sale.id}? Sold stock will be restored.`)) return;
    const now = new Date().toISOString();
    const adjustments = products.flatMap((product): StockAdjustment[] => {
      const soldItem = sale.items.find((item) => item.id === product.id);
      return soldItem ? [{ id: `ADJ-${Date.now()}-${product.id}`, partId: product.id, partName: product.name, date: now, quantityChange: soldItem.quantity, previousStock: product.stock, newStock: product.stock + soldItem.quantity, reason: status === "refunded" ? "refund" : "sale-cancel", reference: sale.id }] : [];
    });
    setSales((current) => current.map((item) => item.id === sale.id ? { ...item, status, ...(status === "refunded" ? { refundedAt: now } : { cancelledAt: now }) } : item));
    setProducts((current) => current.map((product) => {
      const soldItem = sale.items.find((item) => item.id === product.id);
      return soldItem ? { ...product, stock: product.stock + soldItem.quantity } : product;
    }));
    if (adjustments.length) setStockAdjustments((current) => [...adjustments, ...current]);
    logStaffActivity(user, role, status === "refunded" ? "invoice.refunded" : "invoice.cancelled", `${sale.id} · stock restored`, sale.id);
    toast.success(status === "refunded" ? "Sale refunded and stock restored." : "Sale cancelled and stock restored.");
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Link to="/pos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Sales History</h1>
          <p className="text-muted-foreground mt-1">View completed POS transactions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoice, customer, phone, item or payment..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="py-8 text-center text-muted-foreground">
                      <ReceiptText className="mx-auto mb-3 h-8 w-8" />
                      No sales found. Complete a POS checkout first.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
                      <TableCell><div><p className="font-medium">{sale.customerName ?? "Walk-in Customer"}</p>{sale.customerPhone && <p className="text-xs text-muted-foreground">{sale.customerPhone}</p>}</div></TableCell>
                      <TableCell><div><p className="font-medium">{sale.cashierName ?? "Previous sale"}</p>{sale.cashierRole && <p className="text-xs capitalize text-muted-foreground">{sale.cashierRole}</p>}</div></TableCell>
                      <TableCell>
                        {sale.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                      </TableCell>
                      <TableCell>{sale.paymentMethod}</TableCell>
                      <TableCell>{(() => { const paid = sale.paidAmount ?? sale.total; const pending = Math.max(0, sale.total - paid); return <Badge variant={pending <= 0 ? "default" : "outline"}>{pending <= 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid"}</Badge>; })()}</TableCell>
                      <TableCell><Badge variant={(sale.status ?? "completed") === "completed" ? "default" : "secondary"} className="capitalize">{sale.status ?? "completed"}</Badge></TableCell>
                      <TableCell className="text-right">₨{sale.subtotal.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        ₨{sale.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₨{sale.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-1">
                        {hasPermission("sales.print") && <Button variant="outline" size="icon" title="Print receipt" onClick={() => printPosReceipt(sale)}><Printer className="h-4 w-4" /></Button>}
                        {hasPermission("sales.print") && <Button variant="outline" size="icon" title="Print invoice / Save PDF" onClick={() => printPosInvoice(sale)}><FileDown className="h-4 w-4" /></Button>}
                        {(sale.status ?? "completed") === "completed" && <>{hasPermission("sales.edit") && <Button variant="outline" size="icon" title="Edit sale" onClick={() => navigate(`/pos/sale?edit=${encodeURIComponent(sale.id)}`)}><Pencil className="h-4 w-4" /></Button>}{hasPermission("sales.edit") && <Button variant="outline" size="icon" title="Return / refund" onClick={() => closeSale(sale, "refunded")}><RotateCcw className="h-4 w-4" /></Button>}{hasPermission("sales.delete") && <Button variant="destructive" size="icon" title="Cancel sale" onClick={() => closeSale(sale, "cancelled")}><Ban className="h-4 w-4" /></Button>}</>}
                      </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
