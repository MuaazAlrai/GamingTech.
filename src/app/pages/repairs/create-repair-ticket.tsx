import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CalendarClock, ClipboardList, Printer, QrCode, Smartphone, UserRound, Wrench } from "lucide-react";
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
  auto: "Auto Assign",
  "1": "Ali Hassan",
  "2": "Usman Tariq",
  "3": "Hassan Raza",
  "4": "Zain Abbas",
};

const fieldClass = "h-11 bg-white";

const nextSequence = (tickets: RepairTicket[], field: "jobNumber" | "ticketNumber", prefix: string) => {
  const max = tickets.reduce((highest, ticket) => {
    const value = ticket[field] || (field === "ticketNumber" ? ticket.id : "");
    const match = value.match(new RegExp(`^${prefix}-(\\d+)$`));
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
};

export function CreateRepairTicket() {
  const navigate = useNavigate();
  const [customerType, setCustomerType] = useState("existing");
  const [tickets, setTickets] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [customers, setCustomers] = usePersistentState<Customer[]>("gamingtech.customers", []);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [priority, setPriority] = useState("");
  const [technician, setTechnician] = useState("auto");
  const [conditions, setConditions] = useState<string[]>([]);
  const [printLabel, setPrintLabel] = useState(true);
  const nextNumber = tickets.length + 1;
  const generatedSerialNumber = `SN-${new Date().getFullYear()}-${String(nextNumber).padStart(5, "0")}`;
  const generatedJobNumber = nextSequence(tickets, "jobNumber", "JOB");
  const generatedTicketNumber = nextSequence(tickets, "ticketNumber", "TKT");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerType === "existing" && !selectedCustomer) {
      toast.error("Please select a customer.");
      return;
    }
    if (!deviceType) {
      toast.error("Please select a device type.");
      return;
    }
    if (!priority) {
      toast.error("Please select a priority level.");
      return;
    }

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
    const jobNumber = String(formData.get("jobNumber") || "").trim();
    const ticketNumber = String(formData.get("ticketNumber") || "").trim();

    if (!jobNumber) {
      toast.error("Job Number is required.");
      return;
    }
    if (!ticketNumber) {
      toast.error("Ticket Number is required.");
      return;
    }
    if (jobNumber.toLowerCase() === ticketNumber.toLowerCase()) {
      toast.error("Job Number and Ticket Number cannot be identical.");
      return;
    }
    if (tickets.some((ticket) => (ticket.jobNumber || "").toLowerCase() === jobNumber.toLowerCase())) {
      toast.error("Job Number already exists.");
      return;
    }
    if (tickets.some((ticket) => (ticket.ticketNumber || ticket.id).toLowerCase() === ticketNumber.toLowerCase())) {
      toast.error("Ticket Number already exists.");
      return;
    }

    const ticket: RepairTicket = {
      id: ticketNumber,
      repairId: `RPR-${now.getFullYear()}-${String(nextNumber).padStart(3, "0")}`,
      jobNumber,
      ticketNumber,
      openStatus: "Open",
      customer,
      device: model ? `${deviceLabel} - ${model}` : deviceLabel,
      issue: issueTitle,
      status: "received",
      priority,
      technician: technicianLabels[technician] || "Auto Assign",
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
      serialNumber: generatedSerialNumber,
      accessories: String(formData.get("accessories") || "").trim(),
      issueDescription: String(formData.get("issueDescription") || "").trim(),
      condition: conditions,
      conditionComment: String(formData.get("conditionComment") || "").trim(),
      timeline: [{ date: now.toISOString(), status: "received", note: "Device received and ticket created." }],
      partsUsed: [],
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
    toast.success("Repair ticket created successfully!");
    navigate("/repairs");
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

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-primary" />Step 1: Customer Information</CardTitle>
              <CardDescription>Select an existing customer or enter a new customer record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button type="button" variant={customerType === "existing" ? "default" : "outline"} onClick={() => setCustomerType("existing")} className="h-12">Existing Customer</Button>
                <Button type="button" variant={customerType === "new" ? "default" : "outline"} onClick={() => setCustomerType("new")} className="h-12">New Customer</Button>
              </div>
              {customerType === "existing" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Customer</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer} required>
                      <SelectTrigger className={fieldClass}><SelectValue placeholder="Search customer by name or phone" /></SelectTrigger>
                      <SelectContent>{customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerDescription">Customer Description</Label>
                    <Textarea id="customerDescription" name="customerDescription" placeholder="Add customer note, request, or special instruction..." rows={3} className="min-h-24 bg-white" />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="customerName">Full Name</Label><Input id="customerName" name="customerName" placeholder="Enter customer name" required className={fieldClass} /></div>
                  <div className="space-y-2"><Label htmlFor="customerPhone">Phone Number</Label><Input id="customerPhone" name="customerPhone" type="tel" placeholder="+92 300 1234567" required className={fieldClass} /></div>
                  <div className="space-y-2"><Label htmlFor="customerEmail">Email</Label><Input id="customerEmail" name="customerEmail" type="email" placeholder="customer@email.com" className={fieldClass} /></div>
                  <div className="space-y-2"><Label htmlFor="customerAddress">Address</Label><Input id="customerAddress" name="customerAddress" placeholder="Customer address" className={fieldClass} /></div>
                  <div className="space-y-2 md:col-span-2"><Label htmlFor="customerDescription">Customer Description</Label><Textarea id="customerDescription" name="customerDescription" placeholder="Add customer note, request, or special instruction..." rows={3} className="min-h-24 bg-white" /></div>
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
                <div className="space-y-2"><Label htmlFor="jobNumber">Job Number</Label><Input id="jobNumber" name="jobNumber" defaultValue={generatedJobNumber} required className={`${fieldClass} font-semibold text-primary`} /><p className="text-xs text-muted-foreground">Customer ko diya jane wala repair reference number.</p></div>
                <div className="space-y-2"><Label htmlFor="ticketNumber">Ticket Number</Label><Input id="ticketNumber" name="ticketNumber" defaultValue={generatedTicketNumber} required className={`${fieldClass} font-semibold text-primary`} /><p className="text-xs text-muted-foreground">Shop mein device ke sath use hone wala internal ticket number.</p></div>
                <div className="space-y-2"><Label>Device Type</Label><Select value={deviceType} onValueChange={setDeviceType} required><SelectTrigger className={fieldClass}><SelectValue placeholder="Select device type" /></SelectTrigger><SelectContent><SelectItem value="gaming_pc">Gaming PC</SelectItem><SelectItem value="laptop">Laptop</SelectItem><SelectItem value="computer">Desktop Computer</SelectItem><SelectItem value="playstation">PlayStation</SelectItem><SelectItem value="xbox">Xbox</SelectItem><SelectItem value="nintendo">Nintendo Switch</SelectItem><SelectItem value="gpu">Graphics Card</SelectItem><SelectItem value="motherboard">Motherboard</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="brand">Brand / Manufacturer</Label><Input id="brand" name="brand" placeholder="e.g., Sony, Microsoft, ASUS" required className={fieldClass} /></div>
                <div className="space-y-2"><Label htmlFor="model">Model</Label><Input id="model" name="model" placeholder="e.g., PlayStation 5, Xbox Series X" required className={fieldClass} /></div>
                <div className="space-y-2"><Label htmlFor="serialNumber">Serial Number</Label><div className="flex gap-2"><Input id="serialNumber" name="serialNumber" value={generatedSerialNumber} readOnly className={`${fieldClass} font-semibold text-primary`} /><Button type="button" variant="outline" size="icon" className="h-11 w-11" title="Auto generated"><QrCode className="h-4 w-4" /></Button></div><p className="text-xs text-muted-foreground">Serial number auto generate hota hai.</p></div>
              </div>
              <div className="space-y-2"><Label htmlFor="accessories">Accessories / Items Included</Label><Input id="accessories" name="accessories" placeholder="e.g., Controller, Power Cable, HDMI Cable" className={fieldClass} /></div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" />Step 3: Problem Description</CardTitle>
              <CardDescription>Write the customer complaint and visible device condition.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="issueTitle">Issue Title</Label><Input id="issueTitle" name="issueTitle" placeholder="e.g., HDMI Port Not Working" required className={fieldClass} /></div>
              <div className="space-y-2"><Label htmlFor="issueDescription">Detailed Description</Label><Textarea id="issueDescription" name="issueDescription" placeholder="Write what the customer reported and any initial observations..." rows={4} required className="min-h-28 bg-white" /></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Priority Level</Label><Select value={priority} onValueChange={setPriority} required><SelectTrigger className={fieldClass}><SelectValue placeholder="Select priority" /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="estimatedCost">Estimated Cost (PKR)</Label><Input id="estimatedCost" name="estimatedCost" type="number" placeholder="8500" className={fieldClass} /></div>
              </div>
              <div className="space-y-2"><Label>Device Condition</Label><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["Scratches", "Dents", "Water Damage", "Previous Repairs"].map((condition) => <div key={condition} className="flex items-center gap-2 rounded-lg border bg-white p-3"><Checkbox id={condition} checked={conditions.includes(condition)} onCheckedChange={(checked) => setConditions((current) => checked ? [...current, condition] : current.filter((item) => item !== condition))} /><label htmlFor={condition} className="cursor-pointer text-sm font-medium">{condition}</label></div>)}</div></div>
              <div className="space-y-2"><Label htmlFor="conditionComment">Condition Comment</Label><Textarea id="conditionComment" name="conditionComment" placeholder="Device ki body, missing screws, broken panel, marks, ya koi bhi extra note likhen..." rows={3} className="min-h-24 bg-white" /></div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" />Step 4: Assignment & Timeline</CardTitle>
              <CardDescription>Assign a technician and expected completion date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Assign Technician</Label><Select value={technician} onValueChange={setTechnician}><SelectTrigger className={fieldClass}><SelectValue placeholder="Select technician" /></SelectTrigger><SelectContent><SelectItem value="auto">Auto Assign</SelectItem><SelectItem value="1">Ali Hassan - PlayStation Expert</SelectItem><SelectItem value="2">Usman Tariq - Laptop Specialist</SelectItem><SelectItem value="3">Hassan Raza - PC Hardware</SelectItem><SelectItem value="4">Zain Abbas - Gaming Consoles</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="estimatedCompletion">Estimated Completion</Label><Input id="estimatedCompletion" name="estimatedCompletion" type="date" required className={fieldClass} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="notes">Internal Notes</Label><Textarea id="notes" name="notes" placeholder="Add any internal notes for technicians..." rows={3} className="min-h-24 bg-white" /></div>
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
                <Button type="submit" size="lg" className="h-12">Create Repair Ticket</Button>
                <Button type="button" variant="outline" size="lg" onClick={() => navigate("/repairs")} className="h-12">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}
