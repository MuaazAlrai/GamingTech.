import { Link } from "react-router";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { GpuItem } from "../../types/gpu-item";

export function GpuStatusBoard() {
  const [gpus] = usePersistentState<GpuItem[]>("gamingtech.gpus", []);
  const statuses = Array.from(new Set(gpus.map((gpu) => gpu.status || "Unknown")));

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Link to="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Status Board</h1>
          <p className="text-muted-foreground mt-1">Group GPUs by status</p>
        </div>
      </div>

      {gpus.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <LayoutGrid className="mx-auto mb-3 h-10 w-10" />
            No GPU items yet. Add GPUs first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statuses.map((status) => {
            const statusGpus = gpus.filter((gpu) => (gpu.status || "Unknown") === status);

            return (
              <Card key={status}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{status}</CardTitle>
                    <Badge variant="outline">{statusGpus.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {statusGpus.map((gpu) => (
                    <div key={gpu.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{gpu.model}</p>
                        <Badge variant="secondary">{gpu.id}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{gpu.serial}</p>
                      <p className="text-sm mt-2">{gpu.customer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
