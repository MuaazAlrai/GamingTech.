import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Package } from "lucide-react";

export function PartsInventory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Parts Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage spare parts and components
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Parts Inventory Module</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon - comprehensive parts management system
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
