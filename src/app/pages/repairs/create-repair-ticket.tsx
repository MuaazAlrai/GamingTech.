import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CalendarClock, CheckCircle2, ClipboardList, Loader2, Printer, QrCode, Smartphone, UserRound, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import { usePersistentState } from "../../hooks/use-persistent-state";
import { generateRepairNumbers, valueExists } from "../../services/number-generation";
import type { RepairTicket } from "../../types/repair-ticket";
import { printRepairLabel } from "../../utils/print-repair-label";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  description?: string;
  totalRepairs: number;
  totalSpent: number;
};

const deviceTypeLabels: Record<string, string> = {
  gaming_pc: "Gaming PC",
  laptop: "Laptop",
  computer: "Desktop Computer",
  playstation: "PlayStation",
  xbox: "Xbox",
  nintendo: "Nintendo Switch",
  gpu: "Graphics Card",
  motherboard: "Motherboard",
};

const technicianLabels: Record<string, string> = {
  auto: "Choose Later",
  "1": "Ali Hassan",
  "2": "Usman Tariq",
  "3": "Hassan Raza",
  "4": "Zain Abbas",
};

const fieldClass = "h-11 bg-white";

const emptyDraft = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  customerDescription: "",
  brand: "",
  model: "",
  accessories: "",
  issueTitle: "",
  issueDescription: "",
  estimatedCost: "",
  conditionComment: "",
  estimatedCompletion: "",
  notes: "",
};

export function CreateRepairTicket() {
  const navigate = useNavigate();
  const [customerType, setCustomerType] = usePersistentState("gamingtech.createRepairCustomerType", "existing");
  const [tickets, setTickets] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [customers, setCustomers] = usePersistentState<Customer[]>("gamingtech.customers", []);
  const [selectedCustomer, setSelectedCustomer] = usePersistentState("gamingtech.createRepairCustomer", "");
  const [deviceType, setDeviceType] = usePersistentState("gamingtech.createRepairDeviceType", "");
  const [priority, setPriority] = usePersistentState("gamingtech.createRepairPriority", "");
  const [technician, setTechnician] = usePersistentState("gamingtech.createRepairTechnician", "auto");
  const [conditions, setConditions] = usePersistentState<string[]>("gamingtech.createRepairConditions", []);
  const [printLabel, setPrintLabel] = usePersistentState("gamingtech.createRepairPrintLabel", true);
  const [draft, setDraft] = usePersistentState("gamingtech.createRepairDraft", emptyDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const updateDraft = (field: keyof typeof emptyDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setFormMessage(null);
    if (customerType === "existing" && !selectedCustomer) {
      setFormMessage({ type: "error", text: "Select a customer before saving." });
      toast.error("Please select a customer.");
      return;
    }
    if (!deviceType) {
      setFormMessage({ type: "error", text: "Choose what type of device this is." });
      toast.error("Please select a device type.");
      return;
    }
    if (!priority) {
      setFormMessage({ type: "error", text: "Choose how urgent this repair is." });
      toast.error("Please select a priority level.");
      return;
    }

    setIsSaving(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const now = new Date();
    const selectedCustomerRecord = customers.find((item) => item.id === selectedCustomer);
    const newCustomerId = `CUS-${Date.now()}`;
    const customer = customerType === "existing"
      ? selectedCustomerRecord?.name || "Customer"
      : String(formData.get("customerName") || "Walk-in Customer");
    const deviceLabel = deviceTypeLabels[deviceType] || "Device";
    const model = String(formData.get("model") || "").trim();
    const issueTitle = String(formData.get("issueTitle") || "").trim();
    const customerPhone = customerType === "existing"
      ? selectedCustomerRecord?.phone || ""
      : String(formData.get("customerPhone") || "").trim();
    const customerDescription = String(formData.get("customerDescription") || "").trim();
    const estimatedCost = Number(formData.get("estimatedCost") || 0);
    let deviceNumber = "";
    let internalSerialNumber = "";
    let invoiceNumber = "";

    try {
      const generatedNumbers = await generateRepairNumbers();
      deviceNumber = generatedNumbers.deviceNumber;
      internalSerialNumber = generatedNumbers.internalSerialNumber;
      invoiceNumber = generatedNumbers.invoiceNumber;

      const deviceExistsLocally = tickets.some((ticket) =>
        [ticket.ticketNumber, ticket.id, ticket.deviceNumber].some((value) => value?.toLowerCase() === deviceNumber.toLowerCase()),
      );
      const serialExistsLocally = tickets.some((ticket) => ticket.serialNumber?.toLowerCase() === internalSerialNumber.toLowerCase());
      const invoiceExistsLocally = tickets.some((ticket) => ticket.invoiceNumber?.toLowerCase() === invoiceNumber.toLowerCase());

      if (deviceExistsLocally || await valueExists("device", deviceNumber)) {
        throw new Error("The device number was already used. Please save again.");
      }

      if (serialExistsLocally || await valueExists("serial", internalSerialNumber)) {
        throw new Error("The serial number was already used. Please save again.");
      }

      if (invoiceExistsLocally || await valueExists("invoice", invoiceNumber)) {
        throw new Error("The invoice number was already used. Please save again.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create safe repair numbers. Please try again.";
      setFormMessage({ type: "error", text: message });
      toast.error(message);
      setIsSaving(false);
      return;
    }

    const ticket: RepairTicket = {
      id: deviceNumber,
      repairId: deviceNumber,
      jobNumber: deviceNumber,
      ticketNumber: deviceNumber,
      invoiceNumber,
      openStatus: "Open",
      customer,
      device: model ? `${deviceLabel} - ${model}` : deviceLabel,
      issue: issueTitle,
      status: "received",
      priority,
      technician: technicianLabels[technician] || "Choose Later",
      createdAt: now.toISOString().slice(0, 10),
      estimatedCompletion: String(formData.get("estimatedCompletion") || ""),
      amount: estimatedCost,
      customerPhone,
      customerDescription,
      customerId: customerType === "existing" ? selectedCustomerRecord?.id : newCustomerId,
      customerEmail: customerType === "existing" ? selectedCustomerRecord?.email || "" : String(formData.get("customerEmail") || "").trim(),
      customerAddress: customerType === "existing" ? selectedCustomerRecord?.address || "" : String(formData.get("customerAddress") || "").trim(),
      brand: String(formData.get("brand") || "").trim(),
      model,
      deviceNumber,
      physicalDeviceId: `${String(formData.get("brand") || deviceLabel).trim() || deviceLabel}-${model || deviceLabel}-${internalSerialNumber}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      serialNumber: internalSerialNumber,
      accessories: String(formData.get("accessories") || "").trim(),
      issueDescription: String(formData.get("issueDescription") || "").trim(),
      condition: conditions,
      conditionComment: String(formData.get("conditionComment") || "").trim(),
      timeline: [{ date: now.toISOString(), status: "received", note: "Device received and ticket created.", technician: technicianLabels[technician] || "Choose Later", progress: 10 }],
      statusHistory: [{ id: `STATUS-${now.getTime()}`, date: now.toISOString(), status: "received", label: "Received", note: "Device received and ticket created.", technician: technicianLabels[technician] || "Choose Later", progress: 10 }],
      technicianAssignmentHistory: [{ id: `TECH-${now.getTime()}`, date: now.toISOString(), technician: technicianLabels[technician] || "Choose Later", technicianId: technician === "auto" ? undefined : technician, note: "Initial repair intake assignment." }],
      partsUsed: [],
      repairNotes: customerDescription ? [{ id: `NOTE-${now.getTime()}`, date: now.toISOString(), note: customerDescription, visibility: "internal" }] : [],
      payments: [],
      invoiceItems: estimatedCost > 0 ? [{ id: `INVITEM-${now.getTime()}`, description: "Repair estimate", quantity: 1, unitPrice: estimatedCost, type: "labour" }] : [],
    };

    setTickets((current) => [ticket, ...current]);
    setCustomers((current) => {
      const existingIndex = customerType === "existing"
        ? current.findIndex((item) => item.id === selectedCustomer)
        : current.findIndex((item) => item.phone === customerPhone && customerPhone !== "");
      if (existingIndex >= 0) {
        return current.map((item, index) => index === existingIndex
          ? { ...item, totalRepairs: item.totalRepairs + 1, totalSpent: item.totalSpent + estimatedCost }
          : item);
      }
      return [...current, {
        id: newCustomerId,
        name: customer,
        phone: customerPhone,
        email: String(formData.get("customerEmail") || "").trim(),
        address: String(formData.get("customerAddress") || "").trim(),
        description: customerDescription,
        totalRepairs: 1,
        totalSpent: estimatedCost,
      }];
    });
    if (printLabel && !printRepairLabel(ticket)) {
      toast.error("Print window was blocked. Use Print Label from the ticket list.");
    }
    setDraft(emptyDraft);
    setCustomerType("existing");
    setSelectedCustomer("");
    setDeviceType("");
    setPriority("");
    setTechnician("auto");
    setConditions([]);
    setPrintLabel(true);
    setFormMessage({ type: "success", text: "Repair saved. Opening the repair page..." });
    toast.success("Repair saved.");
    window.setTimeout(() => navigate(`/repairs/${encodeURIComponent(ticket.id)}`), 350);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/repairs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Repair Ticket</h1>
            <p className="mt-1 text-muted-foreground">Add customer, device and problem details in a simple guided form.</p>
          </div>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3 text-sm shadow-sm">
          <p className="font-semibold">New ticket starts as</p>
          <p className="text-muted-foreground">Received - Open</p>
        </div>
      </div>

      {formMessage ? (
        <div className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${formMessage.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`} role={formMessage.type === "error" ? "alert" : "status"} tabIndex={-1}>
          {formMessage.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : null}
          <p className="font-medium">{formMessage.text}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-primary" />Step 1: Customer Information</CardTitle>
              <CardDescription>Select an existing customer or enter a new customer record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button type="button" variant={customerType === "existing" ? "default" : "outline"} onClick={() => setCustomerType("existing")} className="h-12 text-base">Existing Customer</Button>
                <Button type="button" variant={customerType === "new" ? "default" : "outline"} onClick={() => setCustomerType("new")} className="h-12 text-base">New Customer</Button>
              </div>
              {customerType === "existing" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Customer</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer} required>
                      <SelectTrigger className={fieldClass}><SelectValue placeholder="Search customer by name or phone" /></SelectTrigger>
                      <SelectContent>{customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</SelectItem>)}</SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Pick the person who brought in the device.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerDescription">Customer Note</Label>
                    <Textarea id="customerDescription" name="customerDescription" value={draft.customerDescription} onChange={(event) => updateDraft("customerDescription", event.target.value)} placeholder="Any request or instruction from the customer" rows={3} className="min-h-24 bg-white" />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="customerName">Name</Label><Input id="customerName" name="customerName" value={draft.customerName} onChange={(event) => updateDraft("customerName", event.target.value)} placeholder="Customer name" required className={fieldClass} /></div>
                  <div className="space-y-2"><Label htmlFor="customerPhone">Phone</Label><Input id="customerPhone" name="customerPhone" value={draft.customerPhone} onChange={(event) => updateDraft("customerPhone", event.target.value)} type="tel" placeholder="+92 300 1234567" required className={fieldClass} /><p className="text-xs text-muted-foreground">Used for pickup updates and payment reminders.</p></div>
                  <div className="space-y-2"><Label htmlFor="customerEmail">Email</Label><Input id="customerEmail" name="customerEmail" value={draft.customerEmail} onChange={(event) => updateDraft("customerEmail", event.target.value)} type="email" placeholder="customer@email.com" className={fieldClass} /></div>
                  <div className="space-y-2"><Label htmlFor="customerAddress">Address</Label><Input id="customerAddress" name="customerAddress" value={draft.customerAddress} onChange={(event) => updateDraft("customerAddress", event.target.value)} placeholder="Customer address" className={fieldClass} /></div>
                  <div className="space-y-2 md:col-span-2"><Label htmlFor="customerDescription">Customer Note</Label><Textarea id="customerDescription" name="customerDescription" value={draft.customerDescription} onChange={(event) => updateDraft("customerDescription", event.target.value)} placeholder="Any request or instruction from the customer" rows={3} className="min-h-24 bg-white" /></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-primary" />Step 2: Device Information</CardTitle>
              <CardDescription>Record the device type, brand, model and serial details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Device Type</Label><Select value={deviceType} onValueChange={setDeviceType} required><SelectTrigger className={fieldClass}><SelectValue placeholder="Select device type" /></SelectTrigger><SelectContent><SelectItem value="gaming_pc">Gaming PC</SelectItem><SelectItem value="laptop">Laptop</SelectItem><SelectItem value="computer">Desktop Computer</SelectItem><SelectItem value="playstation">PlayStation</SelectItem><SelectItem value="xbox">Xbox</SelectItem><SelectItem value="nintendo">Nintendo Switch</SelectItem><SelectItem value="gpu">Graphics Card</SelectItem><SelectItem value="motherboard">Motherboard</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">Choose the closest match so the repair goes to the right person.</p></div>
                <div className="space-y-2"><Label htmlFor="brand">Brand</Label><Input id="brand" name="brand" value={draft.brand} onChange={(event) => updateDraft("brand", event.target.value)} placeholder="Sony, Microsoft, ASUS" required className={fieldClass} /></div>
                <div className="space-y-2"><Label htmlFor="model">Model</Label><Input id="model" name="model" value={draft.model} onChange={(event) => updateDraft("model", event.target.value)} placeholder="PlayStation 5, Xbox Series X" required className={fieldClass} /></div>
                <div className="space-y-2 rounded-lg border bg-muted/40 p-3"><Label>Device Numbers</Label><div className="flex items-center gap-2 text-sm text-muted-foreground"><QrCode className="h-4 w-4 text-primary" />Device number and internal serial number are created automatically when you save.</div></div>
              </div>
              <div className="space-y-2"><Label htmlFor="accessories">Items With Device</Label><Input id="accessories" name="accessories" value={draft.accessories} onChange={(event) => updateDraft("accessories", event.target.value)} placeholder="Controller, power cable, HDMI cable" className={fieldClass} /><p className="text-xs text-muted-foreground">List anything the customer leaves at the shop.</p></div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" />Step 3: Problem Description</CardTitle>
              <CardDescription>Write the customer complaint and visible device condition.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="issueTitle">Problem</Label><Input id="issueTitle" name="issueTitle" value={draft.issueTitle} onChange={(event) => updateDraft("issueTitle", event.target.value)} placeholder="HDMI port not working" required className={fieldClass} /></div>
              <div className="space-y-2"><Label htmlFor="issueDescription">Details</Label><Textarea id="issueDescription" name="issueDescription" value={draft.issueDescription} onChange={(event) => updateDraft("issueDescription", event.target.value)} placeholder="What the customer reported and what you noticed at check-in" rows={4} required className="min-h-28 bg-white" /><p className="text-xs text-muted-foreground">Add symptoms, when it happens, and any quick checks already done.</p></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Priority</Label><Select value={priority} onValueChange={setPriority} required><SelectTrigger className={fieldClass}><SelectValue placeholder="Select priority" /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">Use urgent only when the customer needs fast handling.</p></div>
                <div className="space-y-2"><Label htmlFor="estimatedCost">Estimate</Label><Input id="estimatedCost" name="estimatedCost" value={draft.estimatedCost} onChange={(event) => updateDraft("estimatedCost", event.target.value)} type="number" placeholder="8500" className={fieldClass} /><p className="text-xs text-muted-foreground">Expected repair amount in PKR. You can change it later.</p></div>
              </div>
              <div className="space-y-2"><Label>Condition</Label><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["Scratches", "Dents", "Water Damage", "Previous Repairs"].map((condition) => <div key={condition} className="flex items-center gap-2 rounded-lg border bg-white p-3"><Checkbox id={condition} checked={conditions.includes(condition)} onCheckedChange={(checked) => setConditions((current) => checked ? [...current, condition] : current.filter((item) => item !== condition))} /><label htmlFor={condition} className="cursor-pointer text-sm font-medium">{condition}</label></div>)}</div></div>
              <div className="space-y-2"><Label htmlFor="conditionComment">Condition Note</Label><Textarea id="conditionComment" name="conditionComment" value={draft.conditionComment} onChange={(event) => updateDraft("conditionComment", event.target.value)} placeholder="Marks, missing screws, broken panel, or other check-in notes" rows={3} className="min-h-24 bg-white" /></div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" />Step 4: Assignment & Timeline</CardTitle>
              <CardDescription>Assign a technician and expected completion date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Technician</Label><Select value={technician} onValueChange={setTechnician}><SelectTrigger className={fieldClass}><SelectValue placeholder="Select technician" /></SelectTrigger><SelectContent><SelectItem value="auto">Choose Later</SelectItem><SelectItem value="1">Ali Hassan</SelectItem><SelectItem value="2">Usman Tariq</SelectItem><SelectItem value="3">Hassan Raza</SelectItem><SelectItem value="4">Zain Abbas</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">Leave as choose later if the shop will assign this after check-in.</p></div>
                <div className="space-y-2"><Label htmlFor="estimatedCompletion">Due Date</Label><Input id="estimatedCompletion" name="estimatedCompletion" value={draft.estimatedCompletion} onChange={(event) => updateDraft("estimatedCompletion", event.target.value)} type="date" required className={fieldClass} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="notes">Shop Notes</Label><Textarea id="notes" name="notes" value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} placeholder="Notes for the repair team" rows={3} className="min-h-24 bg-white" /></div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" />Ticket Summary</CardTitle>
              <CardDescription>Review options before creating the ticket.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-semibold">{customerType === "existing" ? "Existing" : "New"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-semibold">Received</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Open</span><span className="font-semibold">Yes</span></div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
                <Checkbox id="printLabel" checked={printLabel} onCheckedChange={(checked) => setPrintLabel(checked === true)} className="mt-1" />
                <label htmlFor="printLabel" className="cursor-pointer text-sm font-medium leading-6"><span className="flex items-center gap-2"><Printer className="h-4 w-4 text-primary" />Open printable device label after creating ticket</span><span className="block text-xs font-normal text-muted-foreground">Print window me width/height user khud set kar sakta hai.</span></label>
              </div>
              <Separator />
              <div className="grid gap-3">
                <Button type="submit" size="lg" className="h-12 text-base" disabled={isSaving}>
                  {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Repair"}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => navigate("/repairs")} className="h-12 text-base" disabled={isSaving}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}
