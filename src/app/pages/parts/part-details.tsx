import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Package, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

export function PartDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const partData = {
    name: "PS5 HDMI Port",
    sku: "PS5-HDMI-001",
    category: "Gaming Parts",
    stock: 3,
    reorderLevel: 8,
    costPrice: 4500,
    sellingPrice: 6000,
    supplier: "Gaming Parts Ltd.",
    location: "Shelf B-05",
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/inventory")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{partData.name}</h1>
          <p className="text-muted-foreground mt-1">Inventory Item Details - {partData.sku}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Item Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Item Name</p>
                  <p className="font-medium">{partData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{partData.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="outline">{partData.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{partData.location}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cost Price</p>
                  <p className="text-xl font-bold">₨{partData.costPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Selling Price</p>
                  <p className="text-xl font-bold">₨{partData.sellingPrice.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className="text-3xl font-bold">{partData.stock} pcs</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reorder Level</p>
                <p className="font-medium">{partData.reorderLevel} pcs</p>
              </div>
              <Badge variant="destructive" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Low Stock Alert
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
