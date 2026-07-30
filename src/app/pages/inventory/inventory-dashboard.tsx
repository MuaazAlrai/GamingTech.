import { useState } from "react";
import { Package, TrendingUp, AlertTriangle, Cpu, CalendarDays, LayoutGrid, Images, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { GpuItem } from "../../types/gpu-item";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { formatAmount } from "../../utils/formatting";
import { toast } from "sonner";

type CatalogPart = { id: string; name: string; sku: string; category: string; stock: number; reorderLevel: number; sellingPrice: number };

const initialGpus: GpuItem[] = [];

export function InventoryDashboard() {
  const [gpus, setGpus] = usePersistentState<GpuItem[]>("gamingtech.gpus", initialGpus);
  const [parts] = usePersistentState<CatalogPart[]>("gamingtech.parts", []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGpu, setEditingGpu] = useState<GpuItem | null>(null);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [formData, setFormData] = useState({
    model: "",
    status: "Received",
    customer: "",
    serial: "",
  });

  const openAddDialog = () => {
    setEditingGpu(null);
    setSelectedPartId("");
    setFormData({ model: "", status: "Received", customer: "", serial: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (gpu: GpuItem) => {
    setEditingGpu(gpu);
    setFormData({
      model: gpu.model,
      status: gpu.status,
      customer: gpu.customer,
      serial: gpu.serial,
    });
    setDialogOpen(true);
  };

  const saveGpu = (event: React.FormEvent) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const statusChanged = Boolean(editingGpu && editingGpu.status !== formData.status);
    const nextGpu: GpuItem = {
      id: editingGpu?.id ?? `GPU-${String(gpus.length + 1).padStart(3, "0")}`,
      ...formData,
      createdAt: editingGpu?.createdAt ?? now,
      updatedAt: now,
      history: [
        ...(editingGpu?.history ?? [
          {
            date: editingGpu?.createdAt ?? now,
            status: editingGpu?.status ?? formData.status,
            note: editingGpu ? "GPU record created" : "GPU added to inventory",
          },
        ]),
        ...(statusChanged
          ? [
              {
                date: now,
                status: formData.status,
                note: `Status changed from ${editingGpu?.status} to ${formData.status}`,
              },
            ]
          : editingGpu
            ? [
                {
                  date: now,
                  status: formData.status,
                  note: "GPU record updated",
                },
              ]
            : []),
      ],
    };

    setGpus((current) =>
      editingGpu ? current.map((gpu) => (gpu.id === editingGpu.id ? nextGpu : gpu)) : [...current, nextGpu],
    );
    setDialogOpen(false);
    toast.success(editingGpu ? "GPU updated." : "GPU added.");
  };

  const deleteGpu = (id: string) => {
    const gpu = gpus.find((item) => item.id === id);
    if (!gpu) return;
    if (!window.confirm(`Delete ${gpu.id}? This GPU record will be removed immediately.`)) return;
    setGpus((current) => current.filter((gpu) => gpu.id !== id));
    toast.success("GPU deleted.");
  };

  const gpuParts = parts.filter((part) => part.category.toLowerCase().includes("gpu"));
  const gpuStock = gpuParts.reduce((sum, part) => sum + part.stock, 0);
  const gpuValue = gpuParts.reduce((sum, part) => sum + part.stock * part.sellingPrice, 0);
  const lowGpuStock = gpuParts.filter((part) => part.stock <= part.reorderLevel).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">GPU Inventory</h1>
          <p className="text-muted-foreground mt-1">Track GPUs, stock status, timelines, and customer gallery</p>
        </div>
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add GPU
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <h3 className="text-2xl font-bold mt-1">{gpuStock}</h3>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <h3 className="text-2xl font-bold mt-1">{formatAmount(gpuValue, 0)}</h3>
              </div>
              <div className="bg-success/10 text-success p-3 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <h3 className="text-2xl font-bold mt-1">{lowGpuStock}</h3>
              </div>
              <div className="bg-warning/10 text-warning p-3 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <h3 className="text-2xl font-bold mt-1">{gpuParts.length}</h3>
              </div>
              <div className="bg-accent/10 text-accent p-3 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your inventory efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Link to="/inventory">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Cpu className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="font-medium">Main Inventory</h3>
                  <p className="text-xs text-muted-foreground mt-1">Browse all inventory items</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/inventory/status-board">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <LayoutGrid className="h-8 w-8 mx-auto text-success mb-2" />
                  <h3 className="font-medium">Status Board</h3>
                  <p className="text-xs text-muted-foreground mt-1">Group GPUs by status</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/inventory/timeline">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <CalendarDays className="h-8 w-8 mx-auto text-warning mb-2" />
                  <h3 className="font-medium">Timeline</h3>
                  <p className="text-xs text-muted-foreground mt-1">Track GPU history</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/inventory/gallery">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Images className="h-8 w-8 mx-auto text-accent mb-2" />
                  <h3 className="font-medium">Customer Gallery</h3>
                  <p className="text-xs text-muted-foreground mt-1">View customer GPU media</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GPU Items</CardTitle>
          <CardDescription>Add, edit, or delete GPU inventory records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gpus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No GPU items yet. Add your first GPU.
                    </TableCell>
                  </TableRow>
                ) : (
                gpus.map((gpu) => (
                  <TableRow key={gpu.id}>
                    <TableCell className="font-medium">{gpu.id}</TableCell>
                    <TableCell>{gpu.model}</TableCell>
                    <TableCell>{gpu.serial}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{gpu.status}</Badge>
                    </TableCell>
                    <TableCell>{gpu.customer}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="app-action-icon edit" title="Edit GPU" onClick={() => openEditDialog(gpu)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="app-action-icon delete" title="Delete GPU" onClick={() => deleteGpu(gpu.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGpu ? "Edit GPU" : "Add GPU"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveGpu} className="space-y-4">
            {!editingGpu && (
              <div className="space-y-2">
                <Label>Choose GPU from Parts Catalog</Label>
                <Select value={selectedPartId} onValueChange={(value) => {
                  const part = parts.find((item) => item.id === value);
                  setSelectedPartId(value);
                  if (part) setFormData({ ...formData, model: part.name, serial: part.sku });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select an existing GPU product" /></SelectTrigger>
                  <SelectContent>{gpuParts.map((part) => <SelectItem key={part.id} value={part.id}>{part.name} - Stock: {part.stock}</SelectItem>)}</SelectContent>
                </Select>
                {gpuParts.length === 0 && <p className="text-xs text-muted-foreground">Add products with category GPU in Inventory first.</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="gpuModel">GPU Model</Label>
              <Input id="gpuModel" value={formData.model} onChange={(event) => setFormData({ ...formData, model: event.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpuSerial">Device Number</Label>
              <Input id="gpuSerial" value={formData.serial} onChange={(event) => setFormData({ ...formData, serial: event.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpuStatus">Status</Label>
              <Input id="gpuStatus" value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpuCustomer">Customer</Label>
              <Input id="gpuCustomer" value={formData.customer} onChange={(event) => setFormData({ ...formData, customer: event.target.value })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingGpu ? "Save Changes" : "Add GPU"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
