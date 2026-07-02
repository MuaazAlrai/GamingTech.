import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Plus, Trash2, CreditCard, Pencil } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { PosSale, PosSaleItem } from "../../types/pos-sale";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { printPosReceipt } from "../../utils/print-pos-receipt";

type InventoryProduct = {
  id: string;
  name: string;
  sellingPrice: number;
  stock: number;
  category: string; sku: string; reorderLevel: number; unit: string; costPrice: number; supplier: string; location: string;
};

export function NewSale() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<PosSaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = usePersistentState<InventoryProduct[]>("gamingtech.parts", []);
  const [sales, setSales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [productForm, setProductForm] = useState({ name: "", sku: "", sellingPrice: "0", stock: "0" });

  const openProductDialog = (product?: InventoryProduct) => {
    setEditingProduct(product || null);
    setProductForm(product ? { name: product.name, sku: product.sku, sellingPrice: String(product.sellingPrice), stock: String(product.stock) } : { name: "", sku: "", sellingPrice: "0", stock: "0" });
    setProductDialogOpen(true);
  };

  const saveProduct = (event: React.FormEvent) => {
    event.preventDefault();
    const product: InventoryProduct = editingProduct ? { ...editingProduct, name: productForm.name, sku: productForm.sku, sellingPrice: Number(productForm.sellingPrice), stock: Number(productForm.stock) } : { id: `PRT-${Date.now()}`, name: productForm.name, sku: productForm.sku, sellingPrice: Number(productForm.sellingPrice), stock: Number(productForm.stock), category: "POS Products", reorderLevel: 2, unit: "pcs", costPrice: 0, supplier: "", location: "POS" };
    setProducts((current) => editingProduct ? current.map((item) => item.id === editingProduct.id ? product : item) : [...current, product]);
    setProductDialogOpen(false);
    toast.success(editingProduct ? "Product updated." : "Product added to POS.");
  };

  const addToCart = (product: InventoryProduct) => {
    if (product.stock < 1) {
      toast.error("This product is out of stock.");
      return;
    }

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error("Not enough stock available.");
        return;
      }

      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.sellingPrice, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    const product = products.find((item) => item.id === id);
    if (product && quantity > product.stock) {
      toast.error("Not enough stock available.");
      return;
    }

    setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.17; // 17% tax
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty.");
      return;
    }

    const sale: PosSale = {
      id: `SALE-${String(sales.length + 1).padStart(4, "0")}`,
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      tax,
      total,
      paymentMethod: "Cash",
    };

    setSales((current) => [sale, ...current]);
    setProducts((current) =>
      current.map((product) => {
        const soldItem = cart.find((item) => item.id === product.id);
        return soldItem ? { ...product, stock: product.stock - soldItem.quantity } : product;
      }),
    );
    if (!printPosReceipt(sale)) toast.error("Print window was blocked. Reprint it from Sales History.");
    toast.success("Sale completed successfully!");
    navigate("/pos");
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/pos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Sale</h1>
          <p className="text-muted-foreground mt-1">Create a new transaction</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3"><CardTitle>Select Products</CardTitle><Button size="sm" className="gap-2" onClick={() => openProductDialog()}><Plus className="h-4 w-4" />Add Product</Button></div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="rounded-lg border p-8 text-center text-muted-foreground sm:col-span-2">
                    No products yet. Add products in inventory first.
                  </div>
                ) : (
                products
                  .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((product) => (
                    <Card
                      key={product.id}
                      className="hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between"><h3 className="font-medium">{product.name}</h3><Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={(event) => { event.stopPropagation(); openProductDialog(product); }}><Pencil className="h-3.5 w-3.5" /></Button></div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold">₨{product.sellingPrice.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Cart</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₨{item.price.toLocaleString()}
                          </p>
                        </div>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          className="w-16 h-8 text-center"
                          min="1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₨{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (17%)</span>
                      <span>₨{tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₨{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                  <Button className="w-full gap-2" onClick={handleCheckout}>
                    <CreditCard className="h-4 w-4" />
                    Checkout
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editingProduct ? "Edit POS Product" : "Add POS Product"}</DialogTitle></DialogHeader><form onSubmit={saveProduct} className="space-y-4"><div className="space-y-2"><Label htmlFor="posName">Product Name</Label><Input id="posName" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required /></div><div className="space-y-2"><Label htmlFor="posSku">SKU</Label><Input id="posSku" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} required /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="posPrice">Selling Price</Label><Input id="posPrice" type="number" min="0" value={productForm.sellingPrice} onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })} required /></div><div className="space-y-2"><Label htmlFor="posStock">Stock</Label><Input id="posStock" type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required /></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setProductDialogOpen(false)}>Cancel</Button><Button type="submit">{editingProduct ? "Save Changes" : "Add Product"}</Button></DialogFooter></form></DialogContent></Dialog>
    </div>
  );
}
