import { Card, CardContent } from "../../components/ui/card";
import { User } from "lucide-react";

export function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">User Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Profile Module</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon - user profile management
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
