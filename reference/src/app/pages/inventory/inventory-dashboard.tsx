import { Package, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "react-router";

export function InventoryDashboard() {
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage all inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <h3 className="text-2xl font-bold mt-1">4,521</h3>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <h3 className="text-2xl font-bold mt-1">₨2.4M</h3>
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
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <h3 className="text-2xl font-bold mt-1">28</h3>
              </div>
              <div className="bg-warning/10 text-warning p-3 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <h3 className="text-2xl font-bold mt-1">12</h3>
              </div>
              <div className="bg-accent/10 text-accent p-3 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your inventory efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/parts">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Package className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="font-medium">View All Parts</h3>
                  <p className="text-xs text-muted-foreground mt-1">Browse inventory</p>
                </CardContent>
              </Card>
            </Link>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-success mb-2" />
                <h3 className="font-medium">Stock Movement</h3>
                <p className="text-xs text-muted-foreground mt-1">Track changes</p>
              </CardContent>
            </Card>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto text-warning mb-2" />
                <h3 className="font-medium">Low Stock Alerts</h3>
                <p className="text-xs text-muted-foreground mt-1">Reorder items</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
