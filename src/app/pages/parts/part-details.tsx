import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarDays, CheckCircle2, Package, Printer, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Progress } from "../../components/ui/progress";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useAuth } from "../../auth/auth-context";
import { usePersistentState } from "../../hooks/use-persistent-state";
import { printInventoryItem } from "../../utils/print-inventory-item";

type InventoryTimelineEvent = {
  date: string;
  status: string;
  note: string;
  progress: number;
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  reorderLevel: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  status?: string;
  progress?: number;
  timeline?: InventoryTimelineEvent[];
};

const statusProgress: Record<string, number> = {
  "Received": 10,
  "Work Started": 25,
  "In Progress": 50,
  "Testing": 75,
  "Completed": 100,
};

export function PartDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = useAuth();
  const [parts, setParts] = usePersistentState<InventoryItem[]>("gamingtech.parts", []);
  const part = parts.find((item) => item.id === id);
  const [statusNote, setStatusNote] = useState("");

  const progress = Math.max(0, Math.min(Number(part?.progress ?? statusProgress[part?.status ?? "Work Started"] ?? 25), 100));
  const remaining = 100 - progress;
  const timeline = useMemo<InventoryTimelineEvent[]>(() => {
    if (!part) return [];
    return part.timeline?.length
      ? part.timeline
      : [{ date: new Date().toISOString(), status: part.status ?? "Work Started", progress, note: "Inventory item added and work timeline started." }];
  }, [part, progress]);

  const updateWorkStatus = (status: string, nextProgress = statusProgress[status] ?? progress) => {
    if (!part || !hasPermission("inventory.manage")) return;
    const safeProgress = Math.max(0, Math.min(Number(nextProgress), 100));
    const note = statusNote.trim() || `Status updated to ${status}. ${safeProgress}% work complete.`;
    const event = { date: new Date().toISOString(), status, progress: safeProgress, note };
    setParts((current) => current.map((item) => item.id === part.id ? { ...item, status, progress: safeProgress, timeline: [event, ...(item.timeline ?? [])] } : item));
    setStatusNote("");
    toast.success("Inventory status updated.");
  };

  if (!part) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <Button variant="ghost" className="gap-2" onClick={() => navigate("/inventory")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Button>
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Package className="mx-auto mb-3 h-10 w-10" />
            Inventory item not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/inventory")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{part.name}</h1>
            <p className="text-muted-foreground mt-1">Inventory Item Details - {part.sku}</p>
          </div>
        </div>
        {hasPermission("inventory.print") && (
          <Button variant="outline" className="gap-2" onClick={() => { if (!printInventoryItem({ ...part, progress, timeline })) toast.error("Allow pop-ups to print this item."); }}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge>{part.status ?? "Work Started"}</Badge>
                {progress === 100 ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Wrench className="h-5 w-5 text-primary" />}
              </div>
            </div>
            <div className="min-w-[220px] text-sm font-medium">
              <div className="mb-2 flex items-center justify-between">
                <span>{progress}% complete</span>
                <span className="text-muted-foreground">{remaining}% remaining</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          {hasPermission("inventory.manage") && (
            <div className="grid gap-3 md:grid-cols-[220px_130px_1fr_auto]">
              <Select value={part.status ?? "Work Started"} onValueChange={(status) => updateWorkStatus(status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(statusProgress).map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" min="0" max="100" value={progress} onChange={(event) => updateWorkStatus(part.status ?? "Work Started", Number(event.target.value))} />
              <Input value={statusNote} onChange={(event) => setStatusNote(event.target.value)} placeholder="Status note" />
              <Button variant="outline" onClick={() => updateWorkStatus(part.status ?? "Work Started", progress)}>Add Note</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[360px]">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader><CardTitle>Work Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timeline.map((event, index) => (
                  <div key={`${event.date}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      {index !== timeline.length - 1 && <div className="mt-2 h-full w-0.5 bg-border" />}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{event.status}</p>
                          <Badge variant="secondary">{event.progress}% complete</Badge>
                          <Badge variant="outline">{100 - event.progress}% remaining</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleString()}</p>
                      </div>
                      <Progress value={event.progress} className="mb-2 h-1.5" />
                      <p className="text-sm text-muted-foreground">{event.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Inventory Item Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">Item Name</p><p className="font-medium">{part.name}</p></div>
                    <div><p className="text-sm text-muted-foreground">SKU</p><p className="font-medium">{part.sku}</p></div>
                    <div><p className="text-sm text-muted-foreground">Category</p><Badge variant="outline">{part.category}</Badge></div>
                    <div><p className="text-sm text-muted-foreground">Location</p><p className="font-medium">{part.location || "-"}</p></div>
                    <div><p className="text-sm text-muted-foreground">Customer Name</p><p className="font-medium">{part.supplier || "-"}</p></div>
                    <div><p className="text-sm text-muted-foreground">Unit</p><p className="font-medium">{part.unit}</p></div>
                  </div>
                  <Separator />
                  <div><p className="text-sm text-muted-foreground">Cost Price</p><p className="text-xl font-bold">Rs {part.costPrice.toLocaleString()}</p></div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Work Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><p className="text-sm text-muted-foreground">Completed</p><p className="text-3xl font-bold">{progress}%</p></div>
                <div><p className="text-sm text-muted-foreground">Remaining</p><p className="font-medium">{remaining}%</p></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" />{timeline.length} timeline updates</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
