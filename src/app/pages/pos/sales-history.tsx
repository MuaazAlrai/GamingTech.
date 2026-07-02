import { Link } from "react-router";
import { ArrowLeft, ReceiptText, Search, Printer } from "lucide-react";
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

export function SalesHistory() {
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSales = sales.filter((sale) => {
    const query = searchQuery.toLowerCase();
    return (
      sale.id.toLowerCase().includes(query) ||
      sale.items.some((item) => item.name.toLowerCase().includes(query))
    );
  });

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
              placeholder="Search by sale ID or item..."
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
                  <TableHead>Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      <ReceiptText className="mx-auto mb-3 h-8 w-8" />
                      No sales found. Complete a POS checkout first.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
                      <TableCell>
                        {sale.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                      </TableCell>
                      <TableCell>{sale.paymentMethod}</TableCell>
                      <TableCell className="text-right">₨{sale.subtotal.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        ₨{sale.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₨{sale.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => printPosReceipt(sale)}>
                          <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
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
