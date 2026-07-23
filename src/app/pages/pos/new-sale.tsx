import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Plus, ReceiptText, Search, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { HeldPosSale, PosSale, PosSaleItem } from "../../types/pos-sale";
import type { Customer } from "../../types/customer";
import type { Part, StockAdjustment } from "../../types/part";
import type { CashShift } from "../../types/staff";
import { useAuth } from "../../auth/auth-context";
import { logStaffActivity } from "../../utils/staff-activity";
import { printPosReceipt } from "../../utils/print-pos-receipt";

const money = (value: number) => `Rs ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function NewSale() {
  const navigate = useNavigate();
  const { user, role, isAdmin, hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const editSaleId = searchParams.get("edit");
  const [products, setProducts] = usePersistentState<Part[]>("gamingtech.parts", []);
  const [, setStockAdjustments] = usePersistentState<StockAdjustment[]>("gamingtech.stockAdjustments", []);
  const [sales, setSales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [heldSales, setHeldSales] = usePersistentState<HeldPosSale[]>("gamingtech.heldPosSales", []);
  const [customers, setCustomers] = usePersistentState<Customer[]>("gamingtech.customers", []);
  const [shifts] = usePersistentState<CashShift[]>("gamingtech.cashShifts", []);
  const activeShift = shifts.find((shift) => shift.userId === user?.uid && shift.status === "open");
  const saleBeingEdited = useMemo(() => sales.find((sale) => sale.id === editSaleId), [editSaleId, sales]);
  const [cart, setCart] = useState<PosSaleItem[]>(() => saleBeingEdited?.items.map((item) => ({ ...item })) ?? []);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState("choose");
  const [discount, setDiscount] = useState(() => saleBeingEdited?.discount ?? 0);
  const [taxRate, setTaxRate] = useState(() => saleBeingEdited?.taxRate ?? (saleBeingEdited ? 17 : 0));
  const [paymentMethod, setPaymentMethod] = useState(() => saleBeingEdited?.paymentMethod ?? "Cash");
  const [customerId, setCustomerId] = useState(() => saleBeingEdited?.customerId ?? "walk-in");
  const [paidAmount, setPaidAmount] = useState(() => saleBeingEdited?.paidAmount ?? 0);
  const [invoiceNumber, setInvoiceNumber] = useState(() => saleBeingEdited?.id ?? "");
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: "", phone: "", address: "" });
  const [quickItemDialogOpen, setQuickItemDialogOpen] = useState(false);
  const [quickItemForm, setQuickItemForm] = useState({ name: "", price: "", costPrice: "0", quantity: "1" });

  const saveCustomer = (event: React.FormEvent) => {
    event.preventDefault();
    const existing = customers.find((customer) => customer.phone.replace(/\D/g, "") === customerForm.phone.replace(/\D/g, ""));
    if (existing) {
      setCustomerId(existing.id);
      setCustomerDialogOpen(false);
      return toast.info("This phone number already exists. Existing customer selected.");
    }
    const customer: Customer = { id: `CUS-${Date.now()}`, name: customerForm.name.trim(), phone: customerForm.phone.trim(), address: customerForm.address.trim(), email: "", totalRepairs: 0, totalSpent: 0, createdAt: new Date().toISOString() };
    setCustomers((current) => [...current, customer]);
    setCustomerId(customer.id);
    setCustomerDialogOpen(false);
    toast.success("Customer added and selected.");
  };

  const addToCart = (product: Part) => {
    const existing = cart.find((item) => item.id === product.id);
    const available = product.stock + (saleBeingEdited?.items.find((item) => item.id === product.id)?.quantity ?? 0);
    if (available < 1 || (existing && existing.quantity >= available)) return toast.error("Not enough stock available.");
    setCart(existing ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...cart, { id: product.id, name: product.name, price: product.sellingPrice, costPrice: product.costPrice, quantity: 1 }]);
  };

  const addQuickItem = (event: React.FormEvent) => {
    event.preventDefault();
    const name = quickItemForm.name.trim();
    const price = Number(quickItemForm.price);
    const quantity = Math.max(1, Number(quickItemForm.quantity) || 1);
    if (!name) return toast.error("Enter item name.");
    if (!Number.isFinite(price) || price <= 0) return toast.error("Enter sale price.");
    setCart((current) => [...current, { id: `TMP-${Date.now()}`, name, price, costPrice: Number(quickItemForm.costPrice) || 0, quantity }]);
    setQuickItemForm({ name: "", price: "", costPrice: "0", quantity: "1" });
    setQuickItemDialogOpen(false);
    toast.success("Temporary item added to invoice.");
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) return;
    const product = products.find((item) => item.id === id);
    const available = (product?.stock ?? 0) + (saleBeingEdited?.items.find((item) => item.id === id)?.quantity ?? 0);
    if (quantity > available) return toast.error("Not enough stock available.");
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity } : item));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const safeDiscount = Math.min(Math.max(0, discount || 0), subtotal);
  const tax = (subtotal - safeDiscount) * Math.max(0, taxRate || 0) / 100;
  const total = subtotal - safeDiscount + tax;

  const holdSale = () => {
    if (!cart.length) return toast.error("Please add at least one item.");
    if (!saleBeingEdited && !hasPermission("sales.create")) return toast.error("You do not have permission to create sales.");
    setHeldSales((current) => [{ id: `HOLD-${Date.now()}`, heldAt: new Date().toISOString(), items: cart, discount: safeDiscount, taxRate, paymentMethod, customerId: customerId === "walk-in" ? undefined : customerId, paidAmount }, ...current]);
    setCart([]); setDiscount(0); setPaidAmount(0); setSelectedProductId("choose");
    toast.success("Sale held successfully.");
  };

  const resumeSale = (held: HeldPosSale) => {
    if (cart.length && !window.confirm("Replace the current cart with this held sale?")) return;
    setCart(held.items); setDiscount(held.discount); setTaxRate(held.taxRate); setPaymentMethod(held.paymentMethod); setCustomerId(held.customerId ?? "walk-in"); setPaidAmount(held.paidAmount ?? 0);
    setHeldSales((current) => current.filter((sale) => sale.id !== held.id));
    toast.success("Held sale resumed.");
  };

  const handleCheckout = () => {
    if (!cart.length) return toast.error("Please add at least one item.");
    if (saleBeingEdited && !isAdmin) return toast.error("Only an admin can edit a completed invoice.");
    const selectedCustomer = customers.find((customer) => customer.id === customerId);
    const safePaidAmount = Math.min(Math.max(0, paidAmount || 0), total);
    const saleId = saleBeingEdited?.id ?? (invoiceNumber.trim() || `INV-${Date.now()}`);
    const sale: PosSale = { id: saleId, date: saleBeingEdited?.date ?? new Date().toISOString(), items: cart, subtotal, discount: safeDiscount, taxRate, tax, total, paymentMethod, customerId: selectedCustomer?.id, customerName: selectedCustomer?.name ?? "Walk-in Customer", customerPhone: selectedCustomer?.phone, customerAddress: selectedCustomer?.address, paidAmount: safePaidAmount, pendingBalance: total - safePaidAmount, cashierId: user?.uid, cashierName: user?.displayName || user?.email || "Staff", cashierRole: role ?? undefined, shiftId: activeShift?.id, status: "completed", updatedAt: saleBeingEdited ? new Date().toISOString() : undefined };
    const adjustmentDate = new Date().toISOString();
    const adjustments = products.flatMap((product): StockAdjustment[] => {
      const newQuantity = cart.find((item) => item.id === product.id)?.quantity ?? 0;
      const oldQuantity = saleBeingEdited?.items.find((item) => item.id === product.id)?.quantity ?? 0;
      const quantityChange = oldQuantity - newQuantity;
      return quantityChange === 0 ? [] : [{ id: `ADJ-${Date.now()}-${product.id}`, partId: product.id, partName: product.name, date: adjustmentDate, quantityChange, previousStock: product.stock, newStock: product.stock + quantityChange, reason: saleBeingEdited ? "sale-edit" : "sale", reference: sale.id }];
    });
    setSales((current) => saleBeingEdited ? current.map((item) => item.id === sale.id ? sale : item) : [sale, ...current]);
    if (adjustments.length) setStockAdjustments((current) => [...adjustments, ...current]);
    setProducts((current) => current.map((product) => {
      const newQuantity = cart.find((item) => item.id === product.id)?.quantity ?? 0;
      const oldQuantity = saleBeingEdited?.items.find((item) => item.id === product.id)?.quantity ?? 0;
      return newQuantity !== oldQuantity ? { ...product, stock: product.stock - (newQuantity - oldQuantity) } : product;
    }));
    if (!printPosReceipt(sale)) toast.error("Print window was blocked. Reprint it from Sales History.");
    logStaffActivity(user, role, saleBeingEdited ? "invoice.updated" : "invoice.created", `${sale.id} for ${sale.customerName} - ${money(sale.total)}`, sale.id);
    toast.success(saleBeingEdited ? "Sale updated successfully." : "Sale completed successfully!");
    navigate("/pos/sales-history");
  };

  const visibleProducts = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.sku}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const selectedCustomer = customers.find((customer) => customer.id === customerId);
  const safePaidAmount = Math.min(Math.max(0, paidAmount || 0), total);
  const remainingAmount = Math.max(0, total - safePaidAmount);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return <div className="space-y-6 pb-20 lg:pb-6">
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex flex-col gap-3 bg-primary px-4 py-3 text-primary-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 hover:text-white" onClick={() => navigate("/pos")}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex items-center gap-2 font-semibold"><ReceiptText className="h-5 w-5" />Sale Invoice</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => navigate("/pos/sales-history")}>Old Invoices</Button>
          <Button type="button" variant="secondary" size="sm" onClick={holdSale} disabled={Boolean(saleBeingEdited)}>Hold Invoice</Button>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[170px_minmax(220px,1fr)_220px_1fr_170px]">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Select Category</SelectItem><SelectItem value="GPU">GPU</SelectItem><SelectItem value="Gaming Parts">Gaming Parts</SelectItem><SelectItem value="PC Parts">PC Parts</SelectItem><SelectItem value="Laptop Parts">Laptop Parts</SelectItem><SelectItem value="Mobile Parts">Mobile Parts</SelectItem><SelectItem value="Accessories">Accessories</SelectItem><SelectItem value="POS Products">POS Products</SelectItem></SelectContent>
            </Select>
            <div className="flex">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search & Scan Item (alt + i)" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-10 rounded-r-none pl-10" /></div>
              <Button type="button" variant="outline" className="h-10 rounded-l-none" title="Add temporary item" onClick={() => { setQuickItemForm({ name: searchQuery, price: "", costPrice: "0", quantity: "1" }); setQuickItemDialogOpen(true); }}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex">
              <Select value={customerId} onValueChange={setCustomerId}><SelectTrigger className="h-10 rounded-r-none bg-white"><SelectValue placeholder="Select Party" /></SelectTrigger><SelectContent><SelectItem value="walk-in">Walk-in Customer</SelectItem>{customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</SelectItem>)}</SelectContent></Select>
              <Button type="button" variant="outline" className="h-10 rounded-l-none" onClick={() => { setCustomerForm({ name: "", phone: "", address: "" }); setCustomerDialogOpen(true); }}><Plus className="h-4 w-4" /></Button>
            </div>
            <Input value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} placeholder="Company Invoice Number" className="h-10" disabled={Boolean(saleBeingEdited)} />
            <Input type="date" value={(saleBeingEdited?.date ?? new Date().toISOString()).slice(0, 10)} readOnly className="h-10 bg-white" />
          </div>

          <div className="grid gap-3 rounded-lg border bg-primary/5 p-3 lg:grid-cols-[minmax(220px,1fr)_auto]">
            <div>
              <Label className="text-xs font-semibold text-primary">Saved Item Select Karein</Label>
              <Select value={selectedProductId} onValueChange={(value) => {
                setSelectedProductId("choose");
                const product = products.find((item) => item.id === value);
                if (product) addToCart(product);
              }}>
                <SelectTrigger className="mt-1 h-11 bg-white">
                  <SelectValue placeholder={products.length ? "Inventory se item select karein" : "Pehle item add karein"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="choose">Select saved item</SelectItem>
                  {visibleProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {money(product.sellingPrice)} - Stock {product.stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2 rounded-lg border bg-white p-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-left text-muted-foreground">
                No saved item found. Use + near search to add a temporary invoice item.
              </div>
            ) : visibleProducts.slice(0, 9).map((product) => <div key={product.id} className="rounded-md border bg-white p-3 hover:border-primary">
              <button type="button" className="w-full text-left" onClick={() => addToCart(product)}>
                <p className="font-semibold">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sku || "No SKU"} - Stock {product.stock}</p>
                <p className="mt-1 font-bold text-primary">{money(product.sellingPrice)}</p>
              </button>
            </div>)}
          </div>

          {heldSales.length > 0 && !saleBeingEdited && (
            <div className="rounded-lg border bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-900">Hold Invoices</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {heldSales.slice(0, 4).map((held) => <Button key={held.id} type="button" variant="outline" size="sm" onClick={() => resumeSale(held)}>{held.id} - {held.items.length} items</Button>)}
              </div>
            </div>
          )}

          <label className="flex w-fit items-center gap-2 rounded border bg-white px-3 py-2 text-sm"><Checkbox />Formula</label>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="px-3 py-3 text-left">Action</th>
                  <th className="px-3 py-3 text-left">#Sr</th>
                  <th className="px-3 py-3 text-left">Code</th>
                  <th className="px-3 py-3 text-left">Name</th>
                  <th className="px-3 py-3 text-left">Category</th>
                  <th className="px-3 py-3 text-left">Company</th>
                  <th className="px-3 py-3 text-left">Batch</th>
                  <th className="px-3 py-3 text-right">Purchase Price</th>
                  <th className="px-3 py-3 text-center">Qty</th>
                  <th className="px-3 py-3 text-left">Unit</th>
                  <th className="px-3 py-3 text-right">Sale Price</th>
                  <th className="px-3 py-3 text-right">Discount%</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? <tr><td colSpan={12} className="h-56 text-center text-muted-foreground"><ShoppingCart className="mx-auto mb-3 h-8 w-8" />Search item and click to add it here.</td></tr> : cart.map((item, index) => {
                  const product = products.find((row) => row.id === item.id);
                  return <tr key={item.id} className="border-t">
                    <td className="px-3 py-2"><Button variant="ghost" size="icon" onClick={() => setCart((current) => current.filter((row) => row.id !== item.id))}><Trash2 className="h-4 w-4" /></Button></td>
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2 text-muted-foreground">{product?.sku || item.id}</td>
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2">{product?.category || "-"}</td>
                    <td className="px-3 py-2">{product?.supplier || "-"}</td>
                    <td className="px-3 py-2">{product?.location || "-"}</td>
                    <td className="px-3 py-2 text-right">{money(item.costPrice ?? product?.costPrice ?? 0)}</td>
                    <td className="px-3 py-2"><Input type="number" min="1" value={item.quantity} onChange={(event) => updateQuantity(item.id, Number(event.target.value))} className="mx-auto h-9 w-20 text-center" /></td>
                    <td className="px-3 py-2">{product?.unit || "pcs"}</td>
                    <td className="px-3 py-2"><Input type="number" min="0" value={item.price} onChange={(event) => setCart((current) => current.map((row) => row.id === item.id ? { ...row, price: Math.max(0, Number(event.target.value)) } : row))} className="ml-auto h-9 w-28 text-right" /></td>
                    <td className="px-3 py-2 text-right">0</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="shadow-lg">
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3 text-center text-sm font-semibold"><div>Sub Total<br /><span className="text-lg text-primary">{money(subtotal)}</span></div><div>Pay Able<br /><span className="text-lg text-primary">{money(total)}</span></div></div>
              <div className="grid grid-cols-[120px_1fr_1fr] items-center gap-3"><Label>Discount %/Cur</Label><Input value={0} readOnly className="h-10" /><Input type="number" min="0" max={subtotal} value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="h-10" /></div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>Tax</Label><Select value={String(taxRate)} onValueChange={(value) => setTaxRate(Number(value))}><SelectTrigger className="h-10"><SelectValue placeholder="Select Tax" /></SelectTrigger><SelectContent><SelectItem value="0">No Tax</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="17">17%</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>Payment Type</Label><Select value={paymentMethod} onValueChange={setPaymentMethod}><SelectTrigger className="h-10"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Card">Card</SelectItem><SelectItem value="Bank Transfer">Bank Transfer</SelectItem><SelectItem value="Credit">Credit</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>Enter Amount</Label><Input type="text" inputMode="decimal" value={paidAmount === 0 ? "" : String(paidAmount)} onChange={(event) => setPaidAmount(Number(event.target.value.replace(/[^0-9.]/g, "")) || 0)} className="h-10" placeholder="Enter paid amount" /></div>
              <div className="flex justify-between rounded-md bg-primary px-3 py-3 font-bold text-primary-foreground"><span>Total</span><span>{money(total)}</span></div>
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-center"><div><p className="text-xs text-muted-foreground">Paid</p><p className="text-xl font-bold text-primary">{money(safePaidAmount)}</p></div><div><p className="text-xs text-muted-foreground">Balance</p><p className="text-xl font-bold">{money(remainingAmount)}</p></div></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between border-b pb-2">
                <p className="font-semibold">Invoice Preview</p>
                <span className="text-xs text-muted-foreground">{invoiceNumber.trim() || "Auto Invoice"}</span>
              </div>
              <div className="text-sm">
                <p><span className="text-muted-foreground">Customer:</span> {selectedCustomer?.name ?? "Walk-in Customer"}</p>
                <p><span className="text-muted-foreground">Payment:</span> {paymentMethod}</p>
              </div>
              <div className="max-h-48 space-y-2 overflow-auto rounded-md border p-2">
                {cart.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Item select karein, invoice yahan nazar ayegi.</p> : cart.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <b>{money(item.price * item.quantity)}</b>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Sub Total</span><b>{money(subtotal)}</b></div>
                <div className="flex justify-between"><span>Discount</span><b>- {money(safeDiscount)}</b></div>
                <div className="flex justify-between"><span>Tax</span><b>{money(tax)}</b></div>
                <div className="flex justify-between rounded bg-primary px-3 py-2 font-bold text-primary-foreground"><span>Payable</span><span>{money(total)}</span></div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="flex flex-col gap-4 border-t bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border p-3 text-center"><p className="text-sm text-muted-foreground">Total Item</p><p className="text-3xl font-bold">{itemCount}</p></div>
          <div className="rounded-lg border p-3 text-center"><p className="text-sm text-muted-foreground">Paid</p><p className="text-3xl font-bold text-primary">{money(safePaidAmount)}</p></div>
          <div className="rounded-lg border p-3 text-center"><p className="text-sm text-muted-foreground">Balance</p><p className="text-3xl font-bold text-primary">{money(remainingAmount)}</p></div>
          <div className="rounded-lg border p-3 text-center"><p className="text-sm text-muted-foreground">Return</p><p className="text-3xl font-bold">0</p></div>
        </div>
        <div className="flex flex-wrap justify-end gap-3">{hasPermission("sales.create") && <Button onClick={handleCheckout}>Save & Print Invoice</Button>}<Button onClick={holdSale} disabled={Boolean(saleBeingEdited)}>Hold</Button><Button variant="destructive" onClick={() => { setCart([]); setDiscount(0); setPaidAmount(0); setSelectedProductId("choose"); }}>Reset</Button></div>
      </div>
    </div>

    <Dialog open={quickItemDialogOpen} onOpenChange={setQuickItemDialogOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Temporary Invoice Item</DialogTitle></DialogHeader>
        <form onSubmit={addQuickItem} className="space-y-4">
          <div><Label>Item Name</Label><Input value={quickItemForm.name} onChange={(event) => setQuickItemForm({ ...quickItemForm, name: event.target.value })} required autoFocus /></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div><Label>Sale Price</Label><Input type="text" inputMode="decimal" value={quickItemForm.price} onChange={(event) => setQuickItemForm({ ...quickItemForm, price: event.target.value.replace(/[^0-9.]/g, "") })} required /></div>
            <div><Label>Quantity</Label><Input type="text" inputMode="numeric" value={quickItemForm.quantity} onChange={(event) => setQuickItemForm({ ...quickItemForm, quantity: event.target.value.replace(/[^0-9]/g, "") })} required /></div>
            <div><Label>Cost Price</Label><Input type="text" inputMode="decimal" value={quickItemForm.costPrice} onChange={(event) => setQuickItemForm({ ...quickItemForm, costPrice: event.target.value.replace(/[^0-9.]/g, "") })} /></div>
          </div>
          <p className="text-xs text-muted-foreground">Ye item inventory me save nahi hoga. Sirf is invoice ke liye use hoga.</p>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setQuickItemDialogOpen(false)}>Cancel</Button><Button type="submit">Add to Invoice</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}><DialogContent><DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader><form onSubmit={saveCustomer} className="space-y-4"><div><Label htmlFor="posCustomerName">Customer Name</Label><Input id="posCustomerName" value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} required /></div><div><Label htmlFor="posCustomerPhone">Phone Number</Label><Input id="posCustomerPhone" value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} required /></div><div><Label htmlFor="posCustomerAddress">Address</Label><Input id="posCustomerAddress" value={customerForm.address} onChange={(event) => setCustomerForm({ ...customerForm, address: event.target.value })} /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setCustomerDialogOpen(false)}>Cancel</Button><Button type="submit">Add & Select</Button></DialogFooter></form></DialogContent></Dialog>
  </div>;
}
