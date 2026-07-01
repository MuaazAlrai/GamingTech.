import { useState } from "react";
import { Link } from "react-router";
import { Search, Plus, Download, AlertTriangle, Package, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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

const parts = [
  {
    id: "PRT-001",
    name: "iPhone 13 Screen",
    category: "Mobile Parts",
    sku: "IP13-SCR-001",
    stock: 5,
    reorderLevel: 10,
    unit: "pcs",
    costPrice: 8500,
    sellingPrice: 12000,
    supplier: "Tech Parts Co.",
    location: "Shelf A-12",
  },
  {
    id: "PRT-002",
    name: "PS5 HDMI Port",
    category: "Gaming Parts",
    sku: "PS5-HDMI-001",
    stock: 3,
    reorderLevel: 8,
    unit: "pcs",
    costPrice: 4500,
    sellingPrice: 6000,
    supplier: "Gaming Parts Ltd.",
    location: "Shelf B-05",
  },
  {
    id: "PRT-003",
    name: "Laptop Keyboard (Dell)",
    category: "Laptop Parts",
    sku: "DELL-KB-001",
    stock: 15,
    reorderLevel: 12,
    unit: "pcs",
    costPrice: 2500,
    sellingPrice: 3500,
    supplier: "Dell Pakistan",
    location: "Shelf C-08",
  },
  {
    id: "PRT-004",
    name: "GPU Thermal Paste",
    category: "Accessories",
    sku: "TH-PASTE-001",
    stock: 4,
    reorderLevel: 15,
    unit: "tube",
    costPrice: 300,
    sellingPrice: 500,
    supplier: "Tech Accessories",
    location: "Shelf D-01",
  },
  {
    id: "PRT-005",
    name: "Motherboard ASUS ROG",
    category: "PC Parts",
    sku: "ASUS-MB-001",
    stock: 8,
    reorderLevel: 5,
    unit: "pcs",
    costPrice: 45000,
    sellingPrice: 62000,
    supplier: "ASUS Pakistan",
    location: "Shelf E-03",
  },
];

export function PartsInventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || part.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalValue = parts.reduce((sum, part) => sum + part.stock * part.costPrice, 0);
  const lowStockCount = parts.filter((p) => p.stock < p.reorderLevel).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Parts Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage parts and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Part
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Parts</p>
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
                <h3 className="text-2xl font-bold mt-1">8</h3>
              </div>
              <div className="bg-accent/10 text-accent p-3 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Parts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by part name or SKU..."
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
                  <TableHead>Part Name</TableHead>
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
                {filteredParts.map((part) => {
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
                        <Badge
                          variant={isLowStock ? "destructive" : "secondary"}
                        >
                          {isLowStock ? "Low Stock" : "In Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>₨{part.costPrice.toLocaleString()}</TableCell>
                      <TableCell>₨{part.sellingPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{part.location}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/parts/${part.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
