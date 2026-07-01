import { Card, CardContent } from "../../components/ui/card";
import { BarChart } from "lucide-react";

export function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate and view business reports
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <BarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Reports Module</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon - advanced reporting and analytics
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
