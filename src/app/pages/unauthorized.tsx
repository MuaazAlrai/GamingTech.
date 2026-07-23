import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/button";

export function Unauthorized() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="mt-2 text-muted-foreground">Aap ke account ko is screen ki permission nahi di gai.</p>
        <Link to="/">
          <Button className="mt-6">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
