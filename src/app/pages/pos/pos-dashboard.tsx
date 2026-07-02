import { Link } from "react-router";
import { ShoppingCart, DollarSign, TrendingUp, Package, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { PosSale } from "../../types/pos-sale";

export function POSDashboard() {
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const today = new Date().toISOString().slice(0, 10);
  const todaysSales = sales.filter((sale) => sale.date.slice(0, 10) === today);
  const todaysTotal = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
  const itemsSold = todaysSales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  const averageSale = todaysSales.length > 0 ? todaysTotal / todaysSales.length : 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground mt-1">Manage sales and transactions</p>
        </div>
        <Link to="/pos/new-sale">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Sale
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Sales</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₨{todaysTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h3>
              </div>
              <div className="bg-success/10 text-success p-3 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <h3 className="text-2xl font-bold mt-1">{todaysSales.length}</h3>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <ShoppingCart className="h-5 w-5" />
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
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your point of sale operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/pos/new-sale">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="font-medium">New Sale</h3>
                  <p className="text-xs text-muted-foreground mt-1">Start transaction</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/pos/sales-history">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-success mb-2" />
                  <h3 className="font-medium">Sales History</h3>
                  <p className="text-xs text-muted-foreground mt-1">View transactions</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/pos/reports">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-accent mb-2" />
                  <h3 className="font-medium">Reports</h3>
                  <p className="text-xs text-muted-foreground mt-1">Sales analytics</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
