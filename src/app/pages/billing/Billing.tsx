import { Card, CardContent } from "../../components/ui/card";
import { FileText } from "lucide-react";

export function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Billing & Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage invoices, payments, and billing
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Billing Module</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon - comprehensive billing system
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
