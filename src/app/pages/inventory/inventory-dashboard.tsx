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

type GpuItem = {
  id: string;
  model: string;
  status: string;
  customer: string;
  serial: string;
};

const initialGpus: GpuItem[] = [];

export function InventoryDashboard() {
  const [gpus, setGpus] = useState<GpuItem[]>(initialGpus);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGpu, setEditingGpu] = useState<GpuItem | null>(null);
  const [formData, setFormData] = useState({
    model: "",
    status: "Received",
    customer: "",
    serial: "",
  });

  const openAddDialog = () => {
    setEditingGpu(null);
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
    const nextGpu: GpuItem = {
      id: editingGpu?.id ?? `GPU-${String(gpus.length + 1).padStart(3, "0")}`,
      ...formData,
    };

    setGpus((current) =>
      editingGpu ? current.map((gpu) => (gpu.id === editingGpu.id ? nextGpu : gpu)) : [...current, nextGpu],
    );
    setDialogOpen(false);
  };

  const deleteGpu = (id: string) => {
    setGpus((current) => current.filter((gpu) => gpu.id !== id));
  };

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
                <h3 className="text-2xl font-bold mt-1">{gpus.length}</h3>
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
                <h3 className="text-2xl font-bold mt-1">₨0</h3>
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
                <h3 className="text-2xl font-bold mt-1">0</h3>
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
                <h3 className="text-2xl font-bold mt-1">0</h3>
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
            <Link to="/parts">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Cpu className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="font-medium">All GPUs</h3>
                  <p className="text-xs text-muted-foreground mt-1">Browse GPU inventory</p>
                </CardContent>
              </Card>
            </Link>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <LayoutGrid className="h-8 w-8 mx-auto text-success mb-2" />
                <h3 className="font-medium">Status Board</h3>
                <p className="text-xs text-muted-foreground mt-1">Group GPUs by status</p>
              </CardContent>
            </Card>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <CalendarDays className="h-8 w-8 mx-auto text-warning mb-2" />
                <h3 className="font-medium">Timeline</h3>
                <p className="text-xs text-muted-foreground mt-1">Track GPU history</p>
              </CardContent>
            </Card>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Images className="h-8 w-8 mx-auto text-accent mb-2" />
                <h3 className="font-medium">Customer Gallery</h3>
                <p className="text-xs text-muted-foreground mt-1">View customer GPU media</p>
              </CardContent>
            </Card>
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
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(gpu)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteGpu(gpu.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
            <div className="space-y-2">
              <Label htmlFor="gpuModel">GPU Model</Label>
              <Input id="gpuModel" value={formData.model} onChange={(event) => setFormData({ ...formData, model: event.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpuSerial">Serial / Repair ID</Label>
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
