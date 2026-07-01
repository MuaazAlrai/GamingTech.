import { Card, CardContent } from "../../components/ui/card";
import { Package } from "lucide-react";

export function InventoryDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and manage all inventory
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Inventory Module</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon - full inventory tracking system
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
