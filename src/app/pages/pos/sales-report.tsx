import { Link } from "react-router";
import { ArrowLeft, BarChart3, Package, ReceiptText, TrendingUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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

export function SalesReport() {
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const itemsSold = sales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0;

  const topItems = sales
    .flatMap((sale) => sale.items)
    .reduce<Record<string, { name: string; quantity: number; revenue: number }>>((items, item) => {
      const existing = items[item.id] ?? { name: item.name, quantity: 0, revenue: 0 };
      items[item.id] = {
        ...existing,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.price * item.quantity,
      };
      return items;
    }, {});

  const topItemRows = Object.values(topItems).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Link to="/pos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">POS Sales Report</h1>
          <p className="text-muted-foreground mt-1">Summary of completed POS sales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₨{totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h3>
              </div>
              <div className="bg-success/10 text-success p-3 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <h3 className="text-2xl font-bold mt-1">{sales.length}</h3>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <ReceiptText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <h3 className="text-2xl font-bold mt-1">{itemsSold}</h3>
              </div>
              <div className="bg-accent/10 text-accent p-3 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Sale</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₨{averageSale.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h3>
              </div>
              <div className="bg-success/10 text-success p-3 rounded-lg">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItemRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No sales data yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  topItemRows.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ₨{item.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
