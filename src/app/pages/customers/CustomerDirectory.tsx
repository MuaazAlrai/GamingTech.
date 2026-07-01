import { Card, CardContent } from "../../components/ui/card";
import { Users } from "lucide-react";

export function CustomerDirectory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Customer Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage customer relationships and history
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Customer Management</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon - comprehensive customer directory
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
