import { Link } from "react-router";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { GpuHistoryEvent, GpuItem } from "../../types/gpu-item";

type TimelineEvent = GpuHistoryEvent & {
  gpuId: string;
  model: string;
  customer: string;
};

export function GpuTimeline() {
  const [gpus] = usePersistentState<GpuItem[]>("gamingtech.gpus", []);
  const events: TimelineEvent[] = gpus
    .flatMap((gpu) => {
      const history =
        gpu.history && gpu.history.length > 0
          ? gpu.history
          : [
              {
                date: gpu.createdAt ?? gpu.updatedAt ?? new Date().toISOString(),
                status: gpu.status || "Unknown",
                note: "GPU added to inventory",
              },
            ];

      return history.map((event) => ({
        ...event,
        gpuId: gpu.id,
        model: gpu.model,
        customer: gpu.customer,
      }));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Link to="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">GPU Timeline</h1>
          <p className="text-muted-foreground mt-1">Track GPU history and status changes</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {events.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <CalendarDays className="mx-auto mb-3 h-10 w-10" />
              No timeline events yet.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={`${event.gpuId}-${event.date}-${index}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    {index !== events.length - 1 && <div className="h-full w-px bg-border" />}
                  </div>
                  <div className="pb-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{event.model}</p>
                      <Badge variant="outline">{event.gpuId}</Badge>
                      <Badge variant="secondary">{event.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(event.date).toLocaleString()} - {event.customer}
                    </p>
                    <p className="text-sm mt-2">{event.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
