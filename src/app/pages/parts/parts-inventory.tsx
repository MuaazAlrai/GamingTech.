import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, Search, Package, TrendingUp, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/auth-context";
import { DataPagination } from "../../components/shared/data-pagination";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { usePagination } from "../../hooks/use-pagination";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { StockAdjustment } from "../../types/part";
import type { PosSale } from "../../types/pos-sale";
import type { RepairTicket } from "../../types/repair-ticket";
import { formatAmount } from "../../utils/formatting";
import { buildRepairInventoryItems, type RepairInventoryItem } from "../../utils/repair-inventory";

type InventoryItem = RepairInventoryItem & { id: string };

const initialItems: InventoryItem[] = [];
const statusProgress: Record<string, number> = {
  Received: 10,
  "Work Started": 25,
  "In Progress": 50,
  Testing: 75,
  Completed: 100,
};

const money = (value: number) => formatAmount(value, 0);
const getInventoryDisplayName = (part: InventoryItem) => {
  const name = part.name.trim();
  const category = part.category.trim();
  const prefix = `${category} - `;

  return name.toLowerCase().startsWith(prefix.toLowerCase()) ? name.slice(prefix.length).trim() : name;
};

export function PartsInventory() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [parts, setParts] = usePersistentState<InventoryItem[]>("gamingtech.parts", initialItems);
  const [repairs, setRepairs] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [invoices] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
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
    totalAmount: "0",
    receivedAmount: "0",
    pendingAmount: "0",
    supplier: "",
    status: "Work Started",
    progress: "25",
  });

  const openEditDialog = (part: InventoryItem) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      category: part.category,
      sku: part.sku,
      stock: String(part.stock),
      reorderLevel: String(part.reorderLevel),
      unit: part.unit,
      totalAmount: String(part.totalAmount ?? part.costPrice ?? 0),
      receivedAmount: String(part.receivedAmount ?? part.sellingPrice ?? 0),
      pendingAmount: String(part.pendingAmount ?? 0),
      supplier: part.supplier,
      status: part.status ?? "Work Started",
      progress: String(part.progress ?? statusProgress[part.status ?? "Work Started"] ?? 25),
    });
    setDialogOpen(true);
  };

  const savePart = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingPart) return;

    const existingTimeline = editingPart.timeline ?? [];
    const nextPart: InventoryItem = {
      ...editingPart,
      name: formData.name,
      category: formData.category,
      sku: formData.sku,
      stock: Number(formData.stock),
      reorderLevel: Number(formData.reorderLevel),
      unit: formData.unit,
      costPrice: Number(formData.totalAmount),
      sellingPrice: Number(formData.receivedAmount),
      totalAmount: Number(formData.totalAmount),
      receivedAmount: Number(formData.receivedAmount),
      pendingAmount: Number(formData.pendingAmount),
      supplier: formData.supplier,
      status: formData.status,
      progress: Math.max(0, Math.min(Number(formData.progress), 100)),
      source: "part",
      timeline: existingTimeline,
    };

    const lastTimeline = existingTimeline[0];
    nextPart.timeline = lastTimeline?.status !== nextPart.status || lastTimeline?.progress !== nextPart.progress
      ? [{ date: new Date().toISOString(), status: nextPart.status ?? "Work Started", progress: nextPart.progress ?? 25, note: `Status updated to ${nextPart.status}. Progress ${nextPart.progress}%.` }, ...existingTimeline]
      : existingTimeline;

    if (nextPart.stock !== editingPart.stock) {
      setStockAdjustments((current) => [{
        id: `ADJ-${Date.now()}-${nextPart.id}`,
        partId: nextPart.id,
        partName: nextPart.name,
        date: new Date().toISOString(),
        quantityChange: nextPart.stock - editingPart.stock,
        previousStock: editingPart.stock,
        newStock: nextPart.stock,
        reason: "manual",
        reference: "Adjusted from inventory editor",
      }, ...current]);
    }

    setParts((current) => current.map((part) => (part.id === editingPart.id ? nextPart : part)));
    setDialogOpen(false);
  };

  const deletePart = (id: string) => {
    setParts((current) => current.filter((part) => part.id !== id));
  };

  const deleteInventoryItem = (part: InventoryItem) => {
    if (part.source === "repair" && part.linkedRepairId) {
      if (!window.confirm(`Delete ${part.name}? This will remove the linked repair ticket from inventory.`)) return;
      setRepairs((current) => current.filter((repair) => repair.id !== part.linkedRepairId));
      toast.success("Linked repair removed from inventory.");
      return;
    }

    if (!window.confirm(`Delete ${part.name}?`)) return;
    deletePart(part.id);
    toast.success("Inventory item deleted.");
  };

  const adjustStock = (part: InventoryItem) => {
    const quantityChange = Number(window.prompt(`Enter stock adjustment for ${part.name}. Use positive to add or negative to remove.`, "0"));
    if (!Number.isFinite(quantityChange) || quantityChange === 0) return;
    if (part.stock + quantityChange < 0) return window.alert("Stock cannot be less than zero.");
    const note = window.prompt("Reason / reference for this adjustment:", "Manual stock count") ?? "Manual stock count";
    setParts((current) => current.map((item) => item.id === part.id ? { ...item, stock: item.stock + quantityChange } : item));
    setStockAdjustments((current) => [{
      id: `ADJ-${Date.now()}-${part.id}`,
      partId: part.id,
      partName: part.name,
      date: new Date().toISOString(),
      quantityChange,
      previousStock: part.stock,
      newStock: part.stock + quantityChange,
      reason: "manual",
      reference: note,
    }, ...current]);
  };

  const repairInventoryItems = useMemo(
    () => buildRepairInventoryItems(repairs, invoices),
    [invoices, repairs],
  );

  const filteredParts = parts.filter((part) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || part.name.toLowerCase().includes(query) || part.sku.toLowerCase().includes(query) || part.supplier.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === "all" || part.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredRepairItems = repairInventoryItems.filter((repairItem) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query
      || repairItem.name.toLowerCase().includes(query)
      || repairItem.sku.toLowerCase().includes(query)
      || repairItem.invoiceNumber?.toLowerCase().includes(query)
      || repairItem.supplier.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === "all" || repairItem.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const inventoryItems = [...filteredRepairItems, ...filteredParts];
  const inventoryPagination = usePagination(inventoryItems, 10);
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.totalAmount ?? item.costPrice ?? 0), 0);
  const categoryCount = new Set(inventoryItems.map((item) => item.category)).size;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="mt-1 text-muted-foreground">Manage repair devices, amounts, and status progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <h3 className="mt-1 text-2xl font-bold">{inventoryItems.length}</h3>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
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
                <h3 className="mt-1 text-2xl font-bold">{money(totalValue)}</h3>
              </div>
              <div className="rounded-lg bg-success/10 p-3 text-success">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <h3 className="mt-1 text-2xl font-bold">{categoryCount}</h3>
              </div>
              <div className="rounded-lg bg-accent/10 p-3 text-accent">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by item, device number, invoice number, or customer..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Device Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Received Amount</TableHead>
                  <TableHead>Pending Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No inventory items yet.
                    </TableCell>
                  </TableRow>
                ) : inventoryPagination.pagedItems.map((part) => {
                  return (
                    <TableRow key={part.id}>
                      <TableCell className="min-w-[220px] font-medium">{getInventoryDisplayName(part)}</TableCell>
                      <TableCell className="min-w-[170px] text-muted-foreground">{part.sku}</TableCell>
                      <TableCell className="min-w-[160px]"><Badge variant="outline">{part.category}</Badge></TableCell>
                      <TableCell className="font-medium">{money(part.totalAmount ?? part.costPrice ?? 0)}</TableCell>
                      <TableCell className="text-success">{money(part.receivedAmount ?? part.sellingPrice ?? 0)}</TableCell>
                      <TableCell className="text-warning">{money(part.pendingAmount ?? 0)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/inventory/${part.id}`}>
                            <Button variant="outline" size="icon" className="app-action-icon view" title="View Inventory Item"><Eye className="h-4 w-4" /></Button>
                          </Link>
                          {hasPermission("inventory.edit") && (
                            <Button variant="outline" size="icon" className="app-action-icon edit" title="Edit Inventory Item" onClick={() => part.source === "repair" && part.linkedRepairId ? navigate(`/repairs/${part.linkedRepairId}`) : openEditDialog(part)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission("inventory.delete") && (
                            <Button variant="outline" size="icon" className="app-action-icon delete" title="Delete Inventory Item" onClick={() => deleteInventoryItem(part)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <DataPagination
            page={inventoryPagination.page}
            totalPages={inventoryPagination.totalPages}
            startItem={inventoryPagination.startItem}
            endItem={inventoryPagination.endItem}
            totalItems={inventoryPagination.totalItems}
            onPageChange={inventoryPagination.setPage}
            label="inventory items"
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={savePart} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="partName">Item Name</Label>
                <Input id="partName" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partSku">Device Number</Label>
                <Input id="partSku" value={formData.sku} onChange={(event) => setFormData({ ...formData, sku: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partCategory">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="partCategory"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPU">GPU</SelectItem>
                    <SelectItem value="Gaming Parts">Gaming Parts</SelectItem>
                    <SelectItem value="PC Parts">PC Parts</SelectItem>
                    <SelectItem value="Laptop Parts">Laptop Parts</SelectItem>
                    <SelectItem value="Mobile Parts">Mobile Parts</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="POS Products">POS Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partCustomer">Customer Name</Label>
                <Input id="partCustomer" value={formData.supplier} onChange={(event) => setFormData({ ...formData, supplier: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partTotal">Total Amount</Label>
                <Input id="partTotal" type="number" value={formData.totalAmount} onChange={(event) => setFormData({ ...formData, totalAmount: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partReceived">Received Amount</Label>
                <Input id="partReceived" type="number" value={formData.receivedAmount} onChange={(event) => setFormData({ ...formData, receivedAmount: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partPending">Pending Amount</Label>
                <Input id="partPending" type="number" value={formData.pendingAmount} onChange={(event) => setFormData({ ...formData, pendingAmount: event.target.value })} required />
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
