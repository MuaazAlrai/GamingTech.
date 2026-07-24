import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Plus, AlertTriangle, Package, TrendingUp, Pencil, Trash2, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Progress } from "../../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { StockAdjustment } from "../../types/part";
import { useAuth } from "../../auth/auth-context";

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
  timeline?: { date: string; status: string; note: string; progress: number }[];
};

const initialItems: InventoryItem[] = [];
const statusProgress: Record<string, number> = {
  "Received": 10,
  "Work Started": 25,
  "In Progress": 50,
  "Testing": 75,
  "Completed": 100,
};

export function PartsInventory() {
  const { hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [parts, setParts] = usePersistentState<InventoryItem[]>("gamingtech.parts", initialItems);
  const [, setStockAdjustments] = usePersistentState<StockAdjustment[]>("gamingtech.stockAdjustments", []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "PC Parts",
    sku: "",
    stock: "0",
    reorderLevel: "5",
    unit: "pcs",
    costPrice: "0",
    sellingPrice: "0",
    supplier: "",
    location: "",
    status: "Work Started",
    progress: "25",
  });

  const openAddDialog = () => {
    setEditingPart(null);
    setFormData({
      name: "",
      category: "PC Parts",
      sku: "",
      stock: "0",
      reorderLevel: "5",
      unit: "pcs",
      costPrice: "0",
      sellingPrice: "0",
      supplier: "",
      location: "",
      status: "Work Started",
      progress: "25",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (part: InventoryItem) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      category: part.category,
      sku: part.sku,
      stock: String(part.stock),
      reorderLevel: String(part.reorderLevel),
      unit: part.unit,
      costPrice: String(part.costPrice),
      sellingPrice: String(part.sellingPrice),
      supplier: part.supplier,
      location: part.location,
      status: part.status ?? "Work Started",
      progress: String(part.progress ?? statusProgress[part.status ?? "Work Started"] ?? 25),
    });
    setDialogOpen(true);
  };

  const savePart = (event: React.FormEvent) => {
    event.preventDefault();
    const nextPart: InventoryItem = {
      id: editingPart?.id ?? `PRT-${String(parts.length + 1).padStart(3, "0")}`,
      name: formData.name,
      category: formData.category,
      sku: formData.sku,
      stock: Number(formData.stock),
      reorderLevel: Number(formData.reorderLevel),
      unit: formData.unit,
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      supplier: formData.supplier,
      location: formData.location,
      status: formData.status,
      progress: Math.max(0, Math.min(Number(formData.progress), 100)),
      timeline: editingPart?.timeline ?? [],
    };
    const timelineNote = editingPart
      ? `Status updated to ${nextPart.status}. Progress ${nextPart.progress}%.`
      : "Inventory item added and work timeline started.";
    const lastTimeline = editingPart?.timeline?.[0];
    nextPart.timeline = !editingPart || lastTimeline?.status !== nextPart.status || lastTimeline?.progress !== nextPart.progress
      ? [{ date: new Date().toISOString(), status: nextPart.status ?? "Work Started", progress: nextPart.progress ?? 25, note: timelineNote }, ...(editingPart?.timeline ?? [])]
      : editingPart.timeline;

    if (editingPart && nextPart.stock !== editingPart.stock) {
      setStockAdjustments((current) => [{ id: `ADJ-${Date.now()}-${nextPart.id}`, partId: nextPart.id, partName: nextPart.name, date: new Date().toISOString(), quantityChange: nextPart.stock - editingPart.stock, previousStock: editingPart.stock, newStock: nextPart.stock, reason: "manual", reference: "Adjusted from product editor" }, ...current]);
    }

    setParts((current) =>
      editingPart
        ? current.map((part) => (part.id === editingPart.id ? nextPart : part))
        : [...current, nextPart],
    );
    setDialogOpen(false);
  };

  const deletePart = (id: string) => {
    setParts((current) => current.filter((part) => part.id !== id));
  };

  const adjustStock = (part: InventoryItem) => {
    const quantityChange = Number(window.prompt(`Enter stock adjustment for ${part.name}. Use a positive number to add or negative number to remove.`, "0"));
    if (!Number.isFinite(quantityChange) || quantityChange === 0) return;
    if (part.stock + quantityChange < 0) return window.alert("Stock cannot be less than zero.");
    const note = window.prompt("Reason / reference for this adjustment:", "Manual stock count") ?? "Manual stock count";
    setParts((current) => current.map((item) => item.id === part.id ? { ...item, stock: item.stock + quantityChange } : item));
    setStockAdjustments((current) => [{ id: `ADJ-${Date.now()}-${part.id}`, partId: part.id, partName: part.name, date: new Date().toISOString(), quantityChange, previousStock: part.stock, newStock: part.stock + quantityChange, reason: "manual", reference: note }, ...current]);
  };

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || part.category === categoryFilter;
    const matchesView = searchParams.get("view") === "low" ? part.stock <= part.reorderLevel : true;
    return matchesSearch && matchesCategory && matchesView;
  });

  const totalValue = parts.reduce((sum, part) => sum + part.stock * part.costPrice, 0);
  const lowStockCount = parts.filter((p) => p.stock < p.reorderLevel).length;
  const categoryCount = new Set(parts.map((part) => part.category)).size;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage all products, GPUs, stock levels, pricing, and locations</p>
        </div>
        <div className="flex gap-2">
          {hasPermission("inventory.create") && <Button className="gap-2" onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add Inventory Item
          </Button>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <h3 className="text-2xl font-bold mt-1">{parts.length}</h3>
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
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <h3 className="text-2xl font-bold mt-1">₨{(totalValue / 1000).toFixed(0)}K</h3>
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
                <h3 className="text-2xl font-bold mt-1">{lowStockCount}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{categoryCount}</h3>
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
          <CardTitle>Inventory Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/inventory/timeline" className="rounded-lg border bg-card p-4 transition hover:bg-muted">
              <CalendarDays className="mb-3 h-6 w-6 text-warning" />
              <p className="font-semibold">Timeline</p>
              <p className="text-sm text-muted-foreground">Track item status and work progress</p>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>All Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Mobile Parts">Mobile Parts</SelectItem>
                <SelectItem value="Gaming Parts">Gaming Parts</SelectItem>
                <SelectItem value="GPU">GPU</SelectItem>
                <SelectItem value="Laptop Parts">Laptop Parts</SelectItem>
                <SelectItem value="PC Parts">PC Parts</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                      No inventory items yet. Add your first item.
                    </TableCell>
                  </TableRow>
                ) : (
                filteredParts.map((part) => {
                  const stockPercentage = (part.stock / part.reorderLevel) * 100;
                  const isLowStock = part.stock < part.reorderLevel;
                  return (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell className="text-muted-foreground">{part.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{part.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {part.stock} {part.unit}
                            </span>
                            {isLowStock && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                          </div>
                          <Progress
                            value={Math.min(stockPercentage, 100)}
                            className="h-1.5"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-[150px] space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant={(part.progress ?? 25) >= 100 ? "default" : "secondary"}>
                              {part.status ?? "Work Started"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{part.progress ?? 25}%</span>
                          </div>
                          <Progress value={part.progress ?? 25} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>₨{part.costPrice.toLocaleString()}</TableCell>
                      <TableCell>₨{part.sellingPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{part.location}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/inventory/${part.id}`}>
                            <Button variant="ghost" size="sm">
                            View Details
                            </Button>
                          </Link>
                          {hasPermission("inventory.manage") && <Button variant="outline" size="sm" onClick={() => adjustStock(part)}>
                            <TrendingUp className="mr-2 h-4 w-4" /> Adjust Stock
                          </Button>}
                          {hasPermission("inventory.edit") && <Button variant="outline" size="sm" onClick={() => openEditDialog(part)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>}
                          {hasPermission("inventory.delete") && <Button variant="destructive" size="sm" onClick={() => deletePart(part.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPart ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={savePart} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="partName">Item Name</Label>
                <Input id="partName" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partSku">SKU</Label>
                <Input id="partSku" value={formData.sku} onChange={(event) => setFormData({ ...formData, sku: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partCategory">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger id="partCategory"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="GPU">GPU</SelectItem><SelectItem value="Gaming Parts">Gaming Parts</SelectItem><SelectItem value="PC Parts">PC Parts</SelectItem><SelectItem value="Laptop Parts">Laptop Parts</SelectItem><SelectItem value="Mobile Parts">Mobile Parts</SelectItem><SelectItem value="Accessories">Accessories</SelectItem><SelectItem value="POS Products">POS Products</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partCustomer">Customer Name</Label>
                <Input id="partCustomer" value={formData.supplier} onChange={(event) => setFormData({ ...formData, supplier: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partCost">Cost Price</Label>
                <Input id="partCost" type="number" value={formData.costPrice} onChange={(event) => setFormData({ ...formData, costPrice: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partUnit">Unit</Label>
                <Input id="partUnit" value={formData.unit} onChange={(event) => setFormData({ ...formData, unit: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partLocation">Location</Label>
                <Input id="partLocation" value={formData.location} onChange={(event) => setFormData({ ...formData, location: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partStatus">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value, progress: String(statusProgress[value] ?? Number(formData.progress)) })}>
                  <SelectTrigger id="partStatus"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(statusProgress).map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partProgress">Work Complete (%)</Label>
                <Input id="partProgress" type="number" min="0" max="100" value={formData.progress} onChange={(event) => setFormData({ ...formData, progress: event.target.value })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingPart ? "Save Changes" : "Add Item"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
