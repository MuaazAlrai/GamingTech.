import { Link } from "react-router";
import { ArrowLeft, CalendarDays, CheckCircle2, Wrench } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { usePersistentState } from "../../hooks/use-persistent-state";

type InventoryTimelineEvent = {
  date: string;
  status: string;
  note: string;
  progress: number;
};

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier?: string;
  status?: string;
  progress?: number;
  timeline?: InventoryTimelineEvent[];
};

type TimelineEvent = InventoryTimelineEvent & {
  itemId: string;
  itemName: string;
  sku: string;
  customer: string;
};

export function GpuTimeline() {
  const [parts] = usePersistentState<InventoryItem[]>("gamingtech.parts", []);
  const events: TimelineEvent[] = parts
    .flatMap((part) => {
      const progress = Math.max(0, Math.min(Number(part.progress ?? 25), 100));
      const history =
        part.timeline && part.timeline.length > 0
          ? part.timeline
          : [
              {
                date: new Date().toISOString(),
                status: part.status ?? "Work Started",
                note: "Inventory item added and work timeline started.",
                progress,
              },
            ];

      return history.map((event) => ({
        ...event,
        itemId: part.id,
        itemName: part.name,
        sku: part.sku,
        customer: part.supplier || "-",
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
          <h1 className="text-3xl font-bold">Inventory Timeline</h1>
          <p className="text-muted-foreground mt-1">Track item status, completed work, and remaining work</p>
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
              {events.map((event, index) => {
                const progress = Math.max(0, Math.min(Number(event.progress), 100));
                const remaining = 100 - progress;

                return (
                  <div key={`${event.itemId}-${event.date}-${index}`} className="flex gap-4 rounded-lg border p-4">
                    <div className="flex flex-col items-center">
                      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {progress >= 100 ? <CheckCircle2 className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{event.itemName}</p>
                            <Badge variant="outline">{event.sku || event.itemId}</Badge>
                            <Badge variant={progress >= 100 ? "default" : "secondary"}>{event.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {event.customer} - {new Date(event.date).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-sm font-medium">{progress}% complete</div>
                      </div>
                      <div className="space-y-1">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress}% kaam ho gaya</span>
                          <span>{remaining}% reh gaya</span>
                        </div>
                      </div>
                      <p className="text-sm">{event.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
