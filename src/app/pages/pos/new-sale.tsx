import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, FileText, Plus, Printer, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../auth/auth-context";
import { usePersistentState } from "../../hooks/use-persistent-state";
import { generateInvoiceNumber, valueExists } from "../../services/number-generation";
import type { Customer } from "../../types/customer";
import type { Part, StockAdjustment } from "../../types/part";
import type { PosSale, PosSaleItem } from "../../types/pos-sale";
import type { RepairTicket } from "../../types/repair-ticket";
import type { CashShift } from "../../types/staff";
import { logStaffActivity } from "../../utils/staff-activity";
import { printPosReceipt } from "../../utils/print-pos-receipt";
import { getRepairDueState, labelForRepairStatus, progressForRepairStatus, repairStatusOptions } from "../../utils/repair-status";

const money = (value: number) => `Rs ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const itemTypeLabels: Record<NonNullable<PosSaleItem["itemType"]>, string> = {
  repair_service: "Repair Service",
  labour: "Labour Charge",
  diagnosis: "Diagnosis Fee",
  inspection: "Inspection Fee",
  replacement_part: "Replacement Part",
  software: "Software Service",
  cleaning: "Cleaning Service",
  other: "Other Charge",
};

const serviceOptions = [
  "HDMI Port Repair",
  "Charging Port Replacement",
  "Power Supply Repair",
  "Screen Replacement",
  "Motherboard Repair",
  "Software Installation",
  "Device Cleaning",
  "Data Recovery",
  "Controller Repair",
  "General Labour",
];

const normalize = (value: unknown) => String(value ?? "").toLowerCase();

export function NewSale() {
  const navigate = useNavigate();
  const { user, role, hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const editInvoiceId = searchParams.get("edit");
  const [repairs, setRepairs] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [customers] = usePersistentState<Customer[]>("gamingtech.customers", []);
  const [parts, setParts] = usePersistentState<Part[]>("gamingtech.parts", []);
  const [, setStockAdjustments] = usePersistentState<StockAdjustment[]>("gamingtech.stockAdjustments", []);
  const [invoices, setInvoices] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [shifts] = usePersistentState<CashShift[]>("gamingtech.cashShifts", []);
  const activeShift = shifts.find((shift) => shift.userId === user?.uid && shift.status === "open");
  const invoiceBeingEdited = useMemo(() => invoices.find((invoice) => invoice.id === editInvoiceId), [editInvoiceId, invoices]);
  const initialRepair = useMemo(() => repairs.find((repair) => repair.id === invoiceBeingEdited?.repairId || repair.invoiceNumber === editInvoiceId), [invoiceBeingEdited?.repairId, editInvoiceId, repairs]);
  const [repairSearch, setRepairSearch] = useState("");
  const [selectedRepairId, setSelectedRepairId] = useState(initialRepair?.id ?? "");
  const selectedRepair = repairs.find((repair) => repair.id === selectedRepairId);
  const selectedCustomer = selectedRepair
    ? customers.find((customer) => customer.id === selectedRepair.customerId)
      ?? customers.find((customer) => customer.phone === selectedRepair.customerPhone)
    : undefined;
  const [items, setItems] = useState<PosSaleItem[]>(() => invoiceBeingEdited?.items.map((item) => ({ ...item })) ?? initialRepair?.invoiceItems?.map((item) => ({ id: item.partId ?? item.id, name: item.description, price: item.unitPrice, quantity: item.quantity, itemType: item.type === "part" ? "replacement_part" : "repair_service" })) ?? []);
  const [itemForm, setItemForm] = useState({ itemType: "repair_service" as NonNullable<PosSaleItem["itemType"]>, description: "General Labour", partId: "", quantity: "1", unitPrice: "", discount: "0", warranty: "", notes: "" });
  const [workForm, setWorkForm] = useState({ diagnosis: invoiceBeingEdited?.diagnosis ?? "", repairWorkPerformed: invoiceBeingEdited?.repairWorkPerformed ?? "", technicianNotes: "", customerNote: invoiceBeingEdited?.customerNote ?? "", warrantyDetails: "" });
  const [statusValue, setStatusValue] = useState(initialRepair?.status ?? "repairing");
  const [discount, setDiscount] = useState(invoiceBeingEdited?.discount ?? 0);
  const [taxRate, setTaxRate] = useState(invoiceBeingEdited?.taxRate ?? 0);
  const [paymentMethod, setPaymentMethod] = useState(invoiceBeingEdited?.paymentMethod ?? "Cash");
  const [paidAmount, setPaidAmount] = useState(invoiceBeingEdited?.paidAmount ?? 0);
  const [paymentNote, setPaymentNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredRepairs = useMemo(() => {
    const query = normalize(repairSearch);
    return repairs.filter((repair) => {
      if (!query) return true;
      return [
        repair.invoiceNumber,
        repair.deviceNumber,
        repair.ticketNumber,
        repair.customer,
        repair.customerPhone,
        repair.serialNumber,
        repair.device,
        repair.brand,
        repair.model,
      ].some((value) => normalize(value).includes(query));
    }).slice(0, 20);
  }, [repairSearch, repairs]);

  const selectedPart = parts.find((part) => part.id === itemForm.partId);
  const subtotal = items.reduce((sum, item) => sum + Math.max(0, item.quantity * item.price - (item.discount ?? 0)), 0);
  const safeDiscount = Math.min(Math.max(0, discount || 0), subtotal);
  const tax = (subtotal - safeDiscount) * Math.max(0, taxRate || 0) / 100;
  const grandTotal = Math.max(0, subtotal - safeDiscount + tax);
  const safePaidAmount = Math.min(Math.max(0, paidAmount || 0), grandTotal);
  const balance = Math.max(0, grandTotal - safePaidAmount);
  const paymentStatus = balance <= 0 ? "Paid" : safePaidAmount > 0 ? "Partially Paid" : "Unpaid";
  const dueState = selectedRepair ? getRepairDueState(selectedRepair) : null;
  const statusProgress = progressForRepairStatus(statusValue);

  const addInvoiceItem = () => {
    const quantity = Math.max(1, Number(itemForm.quantity) || 1);
    const discountAmount = Math.max(0, Number(itemForm.discount) || 0);
    const isPart = itemForm.itemType === "replacement_part";
    const description = isPart ? selectedPart?.name ?? "" : itemForm.description.trim();
    const unitPrice = Number(itemForm.unitPrice || (isPart ? selectedPart?.sellingPrice : 0));
    if (!description) return toast.error(isPart ? "Select a replacement part." : "Enter repair work description.");
    if (!Number.isFinite(unitPrice) || unitPrice < 0) return toast.error("Enter a valid unit price.");
    if (isPart && selectedPart && quantity > selectedPart.stock) return toast.error("Not enough stock available for this part.");
    setItems((current) => [...current, {
      id: isPart ? selectedPart?.id ?? `PART-${Date.now()}` : `SERVICE-${Date.now()}`,
      name: description,
      price: unitPrice,
      costPrice: isPart ? selectedPart?.costPrice ?? 0 : 0,
      quantity,
      discount: discountAmount,
      itemType: itemForm.itemType,
      partCode: isPart ? selectedPart?.sku : undefined,
      warranty: itemForm.warranty.trim(),
      notes: itemForm.notes.trim(),
    }]);
    setItemForm({ itemType: "repair_service", description: "General Labour", partId: "", quantity: "1", unitPrice: "", discount: "0", warranty: "", notes: "" });
  };

  const removeItem = (index: number) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const saveRepairInvoice = async () => {
    if (isSaving) return;
    if (!selectedRepair) return toast.error("Select a repair ticket to continue.");
    if (!items.length) return toast.error("Add repair service or replacement part.");
    if (items.some((item) => item.quantity <= 0 || item.price < 0 || (item.discount ?? 0) < 0)) return toast.error("Invoice item amounts must be valid.");
    setIsSaving(true);
    let invoiceNumber = selectedRepair.invoiceNumber || invoiceBeingEdited?.id || "";
    try {
      if (!invoiceNumber) {
        invoiceNumber = await generateInvoiceNumber();
        if (await valueExists("invoice", invoiceNumber)) throw new Error("Invoice number already exists. Please save again.");
      }
      const now = new Date().toISOString();
      const sale: PosSale = {
        id: invoiceNumber,
        date: invoiceBeingEdited?.date ?? now,
        items,
        subtotal,
        discount: safeDiscount,
        taxRate,
        tax,
        total: grandTotal,
        paymentMethod,
        customerId: selectedRepair.customerId,
        customerName: selectedRepair.customer,
        customerPhone: selectedRepair.customerPhone,
        customerAddress: selectedRepair.customerAddress,
        paidAmount: safePaidAmount,
        pendingBalance: balance,
        cashierId: user?.uid,
        cashierName: user?.displayName || user?.email || "Staff",
        cashierRole: role ?? undefined,
        shiftId: activeShift?.id,
        repairId: selectedRepair.id,
        deviceNumber: selectedRepair.deviceNumber,
        invoiceType: "repair",
        repairStatus: statusValue,
        repairProgress: statusProgress,
        diagnosis: workForm.diagnosis.trim(),
        repairWorkPerformed: workForm.repairWorkPerformed.trim(),
        customerNote: workForm.customerNote.trim(),
        status: "completed",
        updatedAt: invoiceBeingEdited ? now : undefined,
      };
      const previousItems = invoiceBeingEdited?.items ?? [];
      const adjustmentDate = now;
      const physicalPartDeltas = new Map<string, number>();
      for (const item of previousItems) if (item.itemType === "replacement_part") physicalPartDeltas.set(item.id, (physicalPartDeltas.get(item.id) ?? 0) + item.quantity);
      for (const item of items) if (item.itemType === "replacement_part") physicalPartDeltas.set(item.id, (physicalPartDeltas.get(item.id) ?? 0) - item.quantity);
      const adjustments: StockAdjustment[] = [];
      setProducts((current) => current.map((part) => {
        const delta = physicalPartDeltas.get(part.id) ?? 0;
        if (delta === 0) return part;
        adjustments.push({ id: `ADJ-${Date.now()}-${part.id}`, partId: part.id, partName: part.name, date: adjustmentDate, quantityChange: delta, previousStock: part.stock, newStock: part.stock + delta, reason: invoiceBeingEdited ? "sale-edit" : "sale", reference: invoiceNumber });
        return { ...part, stock: part.stock + delta };
      }));
      if (adjustments.length) setStockAdjustments((current) => [...adjustments, ...current]);
      setInvoices((current) => invoiceBeingEdited ? current.map((item) => item.id === invoiceBeingEdited.id ? sale : item) : [sale, ...current.filter((item) => item.id !== sale.id)]);
      setRepairs((current) => current.map((repair) => {
        if (repair.id !== selectedRepair.id) return repair;
        const statusChanged = repair.status !== statusValue;
        return {
          ...repair,
          invoiceNumber,
          status: statusValue,
          openStatus: ["completed", "delivered", "cancelled", "dead", "scrap"].includes(statusValue) ? "Closed" : "Open",
          amount: grandTotal,
          discount: safeDiscount,
          paidAmount: safePaidAmount,
          invoiceItems: items.map((item) => ({ id: `INVITEM-${item.id}-${Date.now()}`, description: item.name, quantity: item.quantity, unitPrice: item.price, type: item.itemType === "replacement_part" ? "part" : item.itemType === "labour" ? "labour" : "other", partId: item.itemType === "replacement_part" ? item.id : undefined })),
          partsUsed: [
            ...items.filter((item) => item.itemType === "replacement_part").map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, cost: item.price })),
            ...(repair.partsUsed ?? []).filter((part) => !items.some((item) => item.itemType === "replacement_part" && item.id === part.id)),
          ],
          payments: safePaidAmount > 0 ? [{ id: `PAY-${Date.now()}`, date: now, amount: safePaidAmount, method: paymentMethod, note: paymentNote.trim(), cashierId: user?.uid, cashierName: user?.displayName || user?.email || "Staff" }, ...(repair.payments ?? [])] : repair.payments,
          repairNotes: [
            ...(workForm.customerNote.trim() ? [{ id: `NOTE-CUSTOMER-${Date.now()}`, date: now, note: workForm.customerNote.trim(), author: user?.displayName || user?.email || "Staff", visibility: "customer" as const }] : []),
            ...(workForm.technicianNotes.trim() ? [{ id: `NOTE-INTERNAL-${Date.now()}`, date: now, note: workForm.technicianNotes.trim(), author: user?.displayName || user?.email || "Staff", visibility: "internal" as const }] : []),
            ...(repair.repairNotes ?? []),
          ],
          timeline: [{ date: now, status: statusValue, note: workForm.repairWorkPerformed.trim() || "Repair invoice saved.", technician: repair.technician, diagnosis: workForm.diagnosis.trim(), progress: statusProgress }, ...(repair.timeline ?? [])],
          statusHistory: statusChanged ? [{ id: `STATUS-${Date.now()}`, date: now, status: statusValue, label: labelForRepairStatus(statusValue), note: workForm.customerNote.trim() || "Updated from Repair POS.", technician: repair.technician, progress: statusProgress }, ...(repair.statusHistory ?? [])] : repair.statusHistory,
        };
      }));
      if (!printPosReceipt(sale)) toast.error("Print window was blocked. Reprint from Repair Invoice History.");
      logStaffActivity(user, role, invoiceBeingEdited ? "repair_invoice.updated" : "repair_invoice.created", `${invoiceNumber} for ${selectedRepair.customer} - ${money(grandTotal)}`, selectedRepair.id);
      toast.success("Repair invoice saved.");
      navigate("/pos/sales-history");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save repair invoice.");
      setIsSaving(false);
    }
  };

  return <div className="space-y-6 pb-20 lg:pb-6">
    <div className="flex flex-col gap-3 rounded-xl border bg-primary px-4 py-3 text-primary-foreground md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="text-white hover:bg-white/15 hover:text-white" onClick={() => navigate("/pos")}><ArrowLeft className="h-5 w-5" /></Button><div className="flex items-center gap-2 font-semibold"><FileText className="h-5 w-5" />Repair POS</div></div>
      <Button type="button" variant="secondary" size="sm" onClick={() => navigate("/pos/sales-history")}>Repair Invoice History</Button>
    </div>

    <Card><CardHeader><CardTitle>1. Find Repair</CardTitle></CardHeader><CardContent className="space-y-3"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={repairSearch} onChange={(event) => setRepairSearch(event.target.value)} placeholder="Search invoice, device number, ticket, customer, phone, serial, brand or model" className="pl-10" /></div><Select value={selectedRepairId || "none"} onValueChange={(value) => { setSelectedRepairId(value); const repair = repairs.find((item) => item.id === value); if (repair) setStatusValue(repair.status); }}><SelectTrigger><SelectValue placeholder="Select repair ticket" /></SelectTrigger><SelectContent><SelectItem value="none" disabled>Select repair ticket</SelectItem>{filteredRepairs.map((repair) => <SelectItem key={repair.id} value={repair.id}>{repair.invoiceNumber || "No invoice"} | {repair.deviceNumber || repair.ticketNumber || repair.id} | {repair.customer} | {repair.device} | {labelForRepairStatus(repair.status)}</SelectItem>)}</SelectContent></Select>{!selectedRepair && <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Select a repair ticket to continue.</p>}</CardContent></Card>

    {selectedRepair && <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="space-y-6">
        <Card><CardHeader><CardTitle>2. Customer and Device Summary</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[
          ["Customer Name", selectedRepair.customer],
          ["Phone Number", selectedRepair.customerPhone || selectedCustomer?.phone || "-"],
          ["Email", selectedRepair.customerEmail || selectedCustomer?.email || "-"],
          ["Address", selectedRepair.customerAddress || selectedCustomer?.address || "-"],
          ["Device Number", selectedRepair.deviceNumber || selectedRepair.ticketNumber || selectedRepair.id],
          ["Invoice Number", selectedRepair.invoiceNumber || "Will create on save"],
          ["Ticket Number", selectedRepair.ticketNumber || "-"],
          ["Device Type", selectedRepair.device],
          ["Brand / Model", [selectedRepair.brand, selectedRepair.model].filter(Boolean).join(" / ") || "-"],
          ["Serial Number", selectedRepair.serialNumber || "-"],
          ["Accessories", selectedRepair.accessories || "-"],
          ["Customer Complaint", selectedRepair.issueDescription || selectedRepair.issue],
          ["Technician", selectedRepair.technician || "Unassigned"],
          ["Current Status", `${labelForRepairStatus(selectedRepair.status)} - ${progressForRepairStatus(selectedRepair.status)}%`],
          ["Expected Return", `${selectedRepair.estimatedCompletion || "-"} (${dueState?.label ?? "-"})`],
        ].map(([label, value]) => <div key={label} className="rounded-md border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>)}</CardContent></Card>

        <Card><CardHeader><CardTitle>3. Add Repair Work</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Diagnosis</Label><Textarea value={workForm.diagnosis} onChange={(event) => setWorkForm({ ...workForm, diagnosis: event.target.value })} rows={3} /></div><div className="space-y-2"><Label>Repair Work Performed</Label><Textarea value={workForm.repairWorkPerformed} onChange={(event) => setWorkForm({ ...workForm, repairWorkPerformed: event.target.value })} rows={3} /></div><div className="space-y-2"><Label>Technician Notes</Label><Textarea value={workForm.technicianNotes} onChange={(event) => setWorkForm({ ...workForm, technicianNotes: event.target.value })} rows={3} /></div><div className="space-y-2"><Label>Customer-Facing Note</Label><Textarea value={workForm.customerNote} onChange={(event) => setWorkForm({ ...workForm, customerNote: event.target.value })} rows={3} /></div><div className="space-y-2 md:col-span-2"><Label>Warranty Details</Label><Input value={workForm.warrantyDetails} onChange={(event) => setWorkForm({ ...workForm, warrantyDetails: event.target.value })} placeholder="e.g. 7 days checking warranty" /></div></CardContent></Card>

        <Card><CardHeader><CardTitle>4. Repair Items</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Select value={itemForm.itemType} onValueChange={(itemType) => setItemForm({ ...itemForm, itemType: itemType as NonNullable<PosSaleItem["itemType"]>, partId: "", unitPrice: "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(itemTypeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>{itemForm.itemType === "replacement_part" ? <Select value={itemForm.partId || "none"} onValueChange={(partId) => { const part = parts.find((item) => item.id === partId); setItemForm({ ...itemForm, partId, unitPrice: String(part?.sellingPrice ?? "") }); }}><SelectTrigger><SelectValue placeholder="Select replacement part" /></SelectTrigger><SelectContent><SelectItem value="none" disabled>Select replacement part</SelectItem>{parts.map((part) => <SelectItem key={part.id} value={part.id}>{part.name} | {part.sku || "No SKU"} | Stock {part.stock}</SelectItem>)}</SelectContent></Select> : <Select value={itemForm.description} onValueChange={(description) => setItemForm({ ...itemForm, description })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{serviceOptions.map((service) => <SelectItem key={service} value={service}>{service}</SelectItem>)}</SelectContent></Select>}<Input type="number" min="1" value={itemForm.quantity} onChange={(event) => setItemForm({ ...itemForm, quantity: event.target.value })} placeholder="Quantity" /><Input type="number" min="0" value={itemForm.unitPrice} onChange={(event) => setItemForm({ ...itemForm, unitPrice: event.target.value })} placeholder="Unit price" /><Input type="number" min="0" value={itemForm.discount} onChange={(event) => setItemForm({ ...itemForm, discount: event.target.value })} placeholder="Discount" /><Input value={itemForm.warranty} onChange={(event) => setItemForm({ ...itemForm, warranty: event.target.value })} placeholder="Warranty" /><Input className="xl:col-span-2" value={itemForm.notes} onChange={(event) => setItemForm({ ...itemForm, notes: event.target.value })} placeholder="Notes" /></div><Button type="button" onClick={addInvoiceItem} className="gap-2"><Plus className="h-4 w-4" />Add Repair Item</Button><div className="overflow-x-auto rounded-md border"><table className="w-full min-w-[920px] text-sm"><thead className="bg-primary text-primary-foreground"><tr><th className="px-3 py-3 text-left">Action</th><th className="px-3 py-3 text-left">Sr#</th><th className="px-3 py-3 text-left">Item Type</th><th className="px-3 py-3 text-left">Description</th><th className="px-3 py-3 text-left">Part Code</th><th className="px-3 py-3 text-right">Quantity</th><th className="px-3 py-3 text-right">Unit Price</th><th className="px-3 py-3 text-right">Discount</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3 text-left">Warranty</th><th className="px-3 py-3 text-left">Notes</th></tr></thead><tbody>{items.length === 0 ? <tr><td colSpan={11} className="h-32 text-center text-muted-foreground">No repair service or part added.</td></tr> : items.map((item, index) => <tr key={`${item.id}-${index}`} className="border-t"><td className="px-3 py-2"><Button variant="ghost" size="icon" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4" /></Button></td><td className="px-3 py-2">{index + 1}</td><td className="px-3 py-2">{itemTypeLabels[item.itemType ?? "other"]}</td><td className="px-3 py-2 font-medium">{item.name}</td><td className="px-3 py-2">{item.partCode || "-"}</td><td className="px-3 py-2 text-right">{item.quantity}</td><td className="px-3 py-2 text-right">{money(item.price)}</td><td className="px-3 py-2 text-right">{money(item.discount ?? 0)}</td><td className="px-3 py-2 text-right">{money(item.quantity * item.price - (item.discount ?? 0))}</td><td className="px-3 py-2">{item.warranty || "-"}</td><td className="px-3 py-2">{item.notes || "-"}</td></tr>)}</tbody></table></div></CardContent></Card>
      </div>

      <aside className="space-y-4">
        <Card><CardHeader><CardTitle>5. Charges and Payment</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3 text-center text-sm font-semibold"><div>Subtotal<br /><span className="text-lg text-primary">{money(subtotal)}</span></div><div>Grand Total<br /><span className="text-lg text-primary">{money(grandTotal)}</span></div></div><div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>Discount</Label><Input type="number" min="0" max={subtotal} value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /></div><div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>Tax</Label><Select value={String(taxRate)} onValueChange={(value) => setTaxRate(Number(value))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">No Tax</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="17">17%</SelectItem></SelectContent></Select></div><div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>Payment</Label><Select value={paymentMethod} onValueChange={setPaymentMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Bank">Bank</SelectItem><SelectItem value="Card">Card</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div><div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>Paid Amount</Label><Input type="number" min="0" max={grandTotal} value={paidAmount} onChange={(event) => setPaidAmount(Number(event.target.value) || 0)} /></div><div className="space-y-2"><Label>Payment Notes</Label><Input value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} /></div><div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-center"><div><p className="text-xs text-muted-foreground">Payment Status</p><p className="text-xl font-bold text-primary">{paymentStatus}</p></div><div><p className="text-xs text-muted-foreground">Balance</p><p className="text-xl font-bold">{money(balance)}</p></div></div></CardContent></Card>
        <Card><CardHeader><CardTitle>6. Repair Status</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">Current Status: {labelForRepairStatus(selectedRepair.status)} - {progressForRepairStatus(selectedRepair.status)}%</p><Select value={statusValue} onValueChange={setStatusValue}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{repairStatusOptions.map((status) => <SelectItem key={status} value={status}>{labelForRepairStatus(status)}</SelectItem>)}</SelectContent></Select><p className="text-sm font-medium">New progress: {statusProgress}%</p></CardContent></Card>
        <Card><CardHeader><CardTitle>7. Save and Print</CardTitle></CardHeader><CardContent className="space-y-3"><Button className="w-full gap-2" onClick={saveRepairInvoice} disabled={isSaving || !hasPermission("sales.create")}><Printer className="h-4 w-4" />{isSaving ? "Saving..." : "Save Repair Invoice"}</Button><Link to={`/repairs/${selectedRepair.id}`}><Button variant="outline" className="w-full">View Repair Details</Button></Link></CardContent></Card>
      </aside>
    </div>}
  </div>;
}
