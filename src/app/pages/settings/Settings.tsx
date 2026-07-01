import { Card, CardContent } from "../../components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure system preferences and settings
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <SettingsIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Settings Module</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon - comprehensive settings management
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
