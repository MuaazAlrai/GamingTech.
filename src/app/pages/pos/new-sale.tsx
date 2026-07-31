import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, Pencil, Plus, Printer, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../auth/auth-context";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { usePersistentState } from "../../hooks/use-persistent-state";
import { generateInvoiceNumber, generateNextNumber, valueExists } from "../../services/number-generation";
import type { AppUser } from "../../types/app-user";
import type { Customer } from "../../types/customer";
import type { PosSale, PosSaleDevice } from "../../types/pos-sale";
import type { RepairTicket } from "../../types/repair-ticket";
import type { CashShift } from "../../types/staff";
import { formatAmount } from "../../utils/formatting";
import { CUSTOMER_PHONE_MESSAGE, isValidCustomerPhone, normalizeCustomerPhone, sanitizeCustomerPhone } from "../../utils/phone";
import { printPosInvoice } from "../../utils/print-pos-invoice";
import { labelForRepairStatus } from "../../utils/repair-status";
import { logStaffActivity } from "../../utils/staff-activity";

const money = (value: number) => formatAmount(value);
const todayInput = () => new Date().toISOString().slice(0, 10);
const defaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
};
const normalize = (value: unknown) => String(value ?? "").toLowerCase();
const isDeviceNumber = (value: string) => /^DEV-\d+$/i.test(value.trim());
const defaultDeviceTypes = ["Gaming PC", "Laptop", "Desktop Computer", "PlayStation", "Xbox", "Nintendo Switch", "Graphics Card", "Motherboard", "Other Device"];
const defaultTerms = "Estimated repair time is 10-14 days. Warranty applies only to repaired parts/services mentioned on this invoice. Physical or liquid damage after handover is not covered.";
const steps = ["Customer", "Devices", "Invoice Details", "Payment"] as const;

type DeviceDraft = {
  localId: string;
  linkedRepairId?: string;
  deviceNumber: string;
  serialNumber: string;
  deviceType: string;
  brand: string;
  model: string;
  fault: string;
  amount: string;
  priority: NonNullable<PosSale["priority"]>;
  technician: string;
  repairStatus: string;
  estimatedCompletion: string;
};

const createDraftFromRepair = (repair: RepairTicket): DeviceDraft => ({
  localId: repair.id,
  linkedRepairId: repair.id,
  deviceNumber: repair.deviceNumber || repair.ticketNumber || repair.id,
  serialNumber: repair.serialNumber || "",
  deviceType: repair.category || repair.device || "PlayStation",
  brand: repair.brand || "",
  model: repair.model || "",
  fault: repair.issueDescription || repair.issue || "",
  amount: String(repair.amount ?? 0),
  priority: (repair.priority as NonNullable<PosSale["priority"]>) || "medium",
  technician: repair.technician || "",
  repairStatus: repair.status || "received",
  estimatedCompletion: repair.estimatedCompletion?.slice(0, 10) || defaultDueDate(),
});

const createDraftFromInvoiceDevice = (device: PosSaleDevice): DeviceDraft => ({
  localId: device.id,
  linkedRepairId: device.repairId,
  deviceNumber: device.deviceNumber,
  serialNumber: device.deviceSerialNumber || "",
  deviceType: device.deviceType || device.deviceName || "PlayStation",
  brand: device.deviceBrand || "",
  model: device.deviceModel || "",
  fault: device.faultDescription || "",
  amount: String(device.amount ?? 0),
  priority: device.priority || "medium",
  technician: device.technician || "",
  repairStatus: device.repairStatus || "received",
  estimatedCompletion: device.estimatedCompletion?.slice(0, 10) || defaultDueDate(),
});

const allocatePayments = (devices: DeviceDraft[], paidAmount: number) => {
  const total = devices.reduce((sum, device) => sum + Math.max(0, Number(device.amount) || 0), 0);
  let assigned = 0;

  return devices.map((device, index) => {
    const deviceAmount = Math.max(0, Number(device.amount) || 0);
    if (paidAmount <= 0 || total <= 0 || deviceAmount <= 0) return 0;
    if (index === devices.length - 1) return Math.max(0, paidAmount - assigned);
    const allocated = Math.min(deviceAmount, Math.round((paidAmount * deviceAmount / total) * 100) / 100);
    assigned += allocated;
    return allocated;
  });
};

export function NewSale() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const editInvoiceId = searchParams.get("edit");
  const [repairs, setRepairs] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [customers, setCustomers] = usePersistentState<Customer[]>("gamingtech.customers", []);
  const [invoices, setInvoices] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [shifts] = usePersistentState<CashShift[]>("gamingtech.cashShifts", []);
  const [appUsers] = usePersistentState<AppUser[]>("gamingtech.users", []);
  const [savedDeviceTypes, setSavedDeviceTypes] = usePersistentState<string[]>("gamingtech.posDeviceTypes", []);
  const activeShift = shifts.find((shift) => shift.userId === user?.uid && shift.status === "open");
  const invoiceBeingEdited = useMemo(() => invoices.find((invoice) => invoice.id === editInvoiceId), [editInvoiceId, invoices]);
  const initialRepair = useMemo(() => repairs.find((repair) => repair.id === invoiceBeingEdited?.repairId || repair.invoiceNumber === editInvoiceId), [invoiceBeingEdited?.repairId, editInvoiceId, repairs]);
  const initialDevices = useMemo(() => {
    if (invoiceBeingEdited?.devices?.length) return invoiceBeingEdited.devices.map(createDraftFromInvoiceDevice);
    if (initialRepair) return [createDraftFromRepair(initialRepair)];
    return [{
      localId: `draft-${Date.now()}`,
      linkedRepairId: undefined,
      deviceNumber: "",
      serialNumber: "",
      deviceType: "PlayStation",
      brand: "",
      model: "",
      fault: "",
      amount: "",
      priority: "medium" as NonNullable<PosSale["priority"]>,
      technician: "",
      repairStatus: "received",
      estimatedCompletion: defaultDueDate(),
    }];
  }, [initialRepair, invoiceBeingEdited?.devices]);

  const [activeStep, setActiveStep] = useState(0);
  const [generatedInvoiceNumber, setGeneratedInvoiceNumber] = useState(invoiceBeingEdited?.id ?? "");
  const [selectedCustomerId, setSelectedCustomerId] = useState(invoiceBeingEdited?.customerId ?? initialRepair?.customerId ?? "");
  const [customerQuery, setCustomerQuery] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(invoiceBeingEdited?.date.slice(0, 10) ?? todayInput());
  const [paidAmount, setPaidAmount] = useState(String(invoiceBeingEdited?.paidAmount ?? 0));
  const [paymentMethod, setPaymentMethod] = useState(invoiceBeingEdited?.paymentMethod ?? "Cash");
  const [invoiceNote, setInvoiceNote] = useState(invoiceBeingEdited?.customerNote ?? "");
  const [terms, setTerms] = useState(invoiceBeingEdited?.termsAndConditions ?? defaultTerms);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: "", phone: "", address: "", description: "" });
  const [customDeviceType, setCustomDeviceType] = useState("");
  const [devices, setDevices] = useState<DeviceDraft[]>(initialDevices);
  const [activeDeviceId, setActiveDeviceId] = useState(initialDevices[0]?.localId ?? "");

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);
  const activeDevice = devices.find((device) => device.localId === activeDeviceId) ?? devices[0];
  const deviceTypes = useMemo(() => Array.from(new Set([...defaultDeviceTypes, ...savedDeviceTypes].filter(Boolean))).sort(), [savedDeviceTypes]);
  const technicians = appUsers.filter((item) => item.status === "active" && (item.staffRole === "technician" || item.designation.toLowerCase().includes("technician")));
  const invoiceNumber = invoiceBeingEdited?.id || generatedInvoiceNumber || "Generating...";
  const totalAmount = devices.reduce((sum, device) => sum + Math.max(0, Number(device.amount) || 0), 0);
  const safePaid = Math.min(Math.max(0, Number(paidAmount) || 0), totalAmount);
  const remainingBalance = Math.max(0, totalAmount - safePaid);
  const paymentStatus = remainingBalance <= 0 ? "Paid" : safePaid > 0 ? "Partially Paid" : "Unpaid";
  const invoiceStatus: NonNullable<PosSale["invoiceStatus"]> = remainingBalance <= 0 ? "paid" : safePaid > 0 ? "partially_paid" : "unpaid";

  useEffect(() => {
    if (invoiceBeingEdited?.id || generatedInvoiceNumber) return;
    let cancelled = false;
    generateInvoiceNumber()
      .then((number) => { if (!cancelled) setGeneratedInvoiceNumber(number); })
      .catch(() => { if (!cancelled) toast.error("Invoice number could not be generated yet."); });
    return () => { cancelled = true; };
  }, [generatedInvoiceNumber, invoiceBeingEdited?.id]);

  useEffect(() => {
    const devicesMissingNumbers = devices.filter((device) => !device.linkedRepairId && (!device.deviceNumber || !device.serialNumber));
    if (!devicesMissingNumbers.length) return;
    let cancelled = false;

    Promise.all(devicesMissingNumbers.map(async (device) => ({
      localId: device.localId,
      deviceNumber: device.deviceNumber || await generateNextNumber("device"),
      serialNumber: device.serialNumber || await generateNextNumber("serial"),
    }))).then((results) => {
      if (cancelled) return;
      setDevices((current) => current.map((device) => {
        const match = results.find((item) => item.localId === device.localId);
        return match ? { ...device, deviceNumber: match.deviceNumber, serialNumber: match.serialNumber } : device;
      }));
    }).catch(() => {
      if (!cancelled) toast.error("Device or serial number could not be generated yet.");
    });

    return () => { cancelled = true; };
  }, [devices]);

  const matchingCustomers = useMemo(() => {
    const query = normalize(customerQuery).trim();
    if (!query) return [];
    return customers
      .filter((customer) => customer.id !== selectedCustomerId)
      .filter((customer) => [customer.name, customer.phone, customer.address].some((value) => normalize(value).includes(query)))
      .slice(0, 10);
  }, [customerQuery, customers, selectedCustomerId]);

  const updateDevice = (localId: string, patch: Partial<DeviceDraft>) => {
    setDevices((current) => current.map((device) => device.localId === localId ? { ...device, ...patch } : device));
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomerId("");
    setCustomerQuery("");
  };

  const openCustomerDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomerId(customer.id);
      setCustomerForm({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
        description: customer.description || "",
      });
    } else {
      setEditingCustomerId("");
      setCustomerForm({ name: "", phone: "", address: "", description: "" });
    }
    setCustomerOpen(true);
  };

  const clearDeviceField = <K extends keyof DeviceDraft>(field: K, value: DeviceDraft[K]) => {
    if (!activeDevice) return;
    updateDevice(activeDevice.localId, { [field]: value } as Partial<DeviceDraft>);
  };

  const addDeviceType = () => {
    const nextType = customDeviceType.trim();
    if (!nextType) return toast.error("Enter a device type first.");
    if (deviceTypes.some((type) => type.toLowerCase() === nextType.toLowerCase())) return toast.info("This device type already exists.");
    setSavedDeviceTypes((current) => [...current, nextType]);
    if (activeDevice) updateDevice(activeDevice.localId, { deviceType: nextType });
    setCustomDeviceType("");
    toast.success("Device type added.");
  };

  const addDevice = async () => {
    try {
      const [deviceNumber, serialNumber] = await Promise.all([
        generateNextNumber("device"),
        generateNextNumber("serial"),
      ]);
      const nextDevice: DeviceDraft = {
        localId: `draft-${Date.now()}-${devices.length + 1}`,
        linkedRepairId: undefined,
        deviceNumber,
        serialNumber,
        deviceType: activeDevice?.deviceType || "PlayStation",
        brand: "",
        model: "",
        fault: "",
        amount: "",
        priority: activeDevice?.priority || "medium",
        technician: activeDevice?.technician || "",
        repairStatus: activeDevice?.repairStatus || "received",
        estimatedCompletion: activeDevice?.estimatedCompletion || defaultDueDate(),
      };
      setDevices((current) => [...current, nextDevice]);
      setActiveDeviceId(nextDevice.localId);
      toast.success("Another device added to this invoice.");
    } catch {
      toast.error("Could not generate numbers for the new device yet.");
    }
  };

  const removeDevice = (localId: string) => {
    if (devices.length === 1) return toast.error("At least one device is required.");
    setDevices((current) => current.filter((device) => device.localId !== localId));
    if (activeDeviceId === localId) {
      const fallback = devices.find((device) => device.localId !== localId);
      if (fallback) setActiveDeviceId(fallback.localId);
    }
  };

  const canOpenStep = (index: number) => index === 0 || (index === 1 && Boolean(selectedCustomer)) || (index >= 2 && Boolean(selectedCustomer && devices.length));
  const goNext = () => {
    if (activeStep === 0 && !selectedCustomer) return toast.error("Select or add a customer first.");
    if (activeStep === 1 && devices.some((device) => !device.deviceType.trim() || !device.amount || !device.fault.trim())) return toast.error("Complete each device detail before continuing.");
    setActiveStep((step) => Math.min(steps.length - 1, step + 1));
  };

  const saveCustomer = (event: React.FormEvent) => {
    event.preventDefault();
    const phone = sanitizeCustomerPhone(customerForm.phone);
    if (!isValidCustomerPhone(phone)) {
      toast.error(CUSTOMER_PHONE_MESSAGE);
      return;
    }
    const cleanPhone = normalizeCustomerPhone(phone);
    const existing = customers.find((customer) => cleanPhone && normalizeCustomerPhone(customer.phone) === cleanPhone && customer.id !== editingCustomerId);
    if (existing) {
      setSelectedCustomerId(existing.id);
      setCustomerOpen(false);
      toast.info("Customer already exists. Existing customer selected.");
      return;
    }
    const customer: Customer = editingCustomerId
      ? {
        ...(customers.find((item) => item.id === editingCustomerId) as Customer),
        name: customerForm.name.trim(),
        phone,
        address: customerForm.address.trim(),
        description: customerForm.description.trim(),
      }
      : {
        id: `CUS-${Date.now()}`,
        name: customerForm.name.trim(),
        phone,
        address: customerForm.address.trim(),
        description: customerForm.description.trim(),
        totalRepairs: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
    setCustomers((current) => editingCustomerId ? current.map((item) => item.id === editingCustomerId ? customer : item) : [customer, ...current]);
    setSelectedCustomerId(customer.id);
    setCustomerForm({ name: "", phone: "", address: "", description: "" });
    setEditingCustomerId("");
    setCustomerOpen(false);
    toast.success(editingCustomerId ? "Customer updated." : "Customer added.");
  };

  const saveInvoice = async () => {
    if (isSaving) return;
    if (!selectedCustomer) return toast.error("Select a customer first.");
    if (!devices.length) return toast.error("Add at least one device.");
    if (devices.some((device) => !device.deviceType.trim() || !device.fault.trim() || Math.max(0, Number(device.amount) || 0) <= 0)) return toast.error("Every device needs type, fault, and amount.");
    if (!generatedInvoiceNumber && !invoiceBeingEdited?.id) return toast.error("Invoice number is still generating.");
    if (Number(paidAmount) < 0) return toast.error("Paid Amount cannot be negative.");
    setIsSaving(true);

    try {
      const finalInvoiceNumber = invoiceBeingEdited?.id || generatedInvoiceNumber;
      if (!invoiceBeingEdited?.id && await valueExists("invoice", finalInvoiceNumber)) throw new Error("Invoice number already exists. Please save again.");

      for (const device of devices.filter((item) => !item.linkedRepairId)) {
        if (await valueExists("device", device.deviceNumber)) throw new Error(`Device number ${device.deviceNumber} already exists. Please try again.`);
        if (await valueExists("serial", device.serialNumber)) throw new Error(`Serial number ${device.serialNumber} already exists. Please try again.`);
      }

      const invoiceDateTime = new Date(`${invoiceDate}T${new Date().toTimeString().slice(0, 8)}`).toISOString();
      const paymentAllocations = allocatePayments(devices, safePaid);
      const invoiceRepairs: RepairTicket[] = devices.map((device, index) => {
        const existingRepair = device.linkedRepairId ? repairs.find((item) => item.id === device.linkedRepairId) : undefined;
        const amount = Math.max(0, Number(device.amount) || 0);
        const deviceName = device.model.trim() ? `${device.deviceType} - ${device.model.trim()}` : device.deviceType;
        const paidForDevice = paymentAllocations[index] ?? 0;
        const now = new Date().toISOString();
        const technicianName = device.technician.trim();

        return {
          id: existingRepair?.id || device.deviceNumber,
          repairId: existingRepair?.repairId || device.deviceNumber,
          jobNumber: existingRepair?.jobNumber || device.deviceNumber,
          ticketNumber: existingRepair?.ticketNumber || device.deviceNumber,
          invoiceNumber: finalInvoiceNumber,
          openStatus: ["completed", "delivered", "dead", "scrap"].includes(device.repairStatus) ? "Closed" : "Open",
          customer: selectedCustomer.name,
          customerPhone: selectedCustomer.phone,
          customerEmail: selectedCustomer.email,
          customerAddress: selectedCustomer.address,
          customerId: selectedCustomer.id,
          device: deviceName,
          issue: device.fault.trim(),
          issueDescription: device.fault.trim(),
          status: device.repairStatus,
          priority: device.priority,
          technician: technicianName,
          createdAt: existingRepair?.createdAt || now,
          estimatedCompletion: new Date(`${device.estimatedCompletion}T12:00:00`).toISOString(),
          amount,
          category: device.deviceType,
          deviceNumber: device.deviceNumber,
          brand: device.brand.trim(),
          model: device.model.trim(),
          serialNumber: device.serialNumber.trim(),
          physicalDeviceId: `${device.brand || device.deviceType}-${device.model || device.deviceNumber}-${device.serialNumber || device.deviceNumber}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          timeline: [{ date: now, status: device.repairStatus, note: `Device saved on invoice ${finalInvoiceNumber}.`, technician: technicianName || undefined }],
          statusHistory: existingRepair?.statusHistory ?? [],
          technicianAssignmentHistory: existingRepair?.technicianAssignmentHistory ?? [],
          partsUsed: existingRepair?.partsUsed ?? [],
          repairNotes: existingRepair?.repairNotes ?? [],
          payments: paidForDevice > 0 ? [{
            id: `PAY-${Date.now()}-${index}`,
            date: invoiceDateTime,
            amount: paidForDevice,
            method: paymentMethod,
            note: invoiceNote.trim(),
            cashierId: user?.uid,
            cashierName: user?.displayName || user?.email || "Staff",
          }] : existingRepair?.payments ?? [],
          invoiceItems: [{ id: `INVITEM-${Date.now()}-${index}`, description: deviceName, quantity: 1, unitPrice: amount, type: "labour" }],
          discount: 0,
          paidAmount: paidForDevice,
        };
      });

      const invoiceDevices: PosSaleDevice[] = invoiceRepairs.map((repair, index) => ({
        id: devices[index].localId,
        repairId: repair.id,
        deviceNumber: repair.deviceNumber || repair.id,
        deviceName: repair.device,
        deviceType: repair.category || repair.device,
        deviceBrand: repair.brand,
        deviceModel: repair.model,
        deviceSerialNumber: repair.serialNumber,
        faultDescription: repair.issueDescription || repair.issue,
        priority: repair.priority as NonNullable<PosSale["priority"]>,
        technician: repair.technician,
        repairStatus: repair.status,
        estimatedCompletion: repair.estimatedCompletion,
        amount: repair.amount,
      }));

      const invoice: PosSale = {
        id: finalInvoiceNumber,
        date: invoiceDateTime,
        items: invoiceDevices.map((device) => ({
          id: device.repairId || device.id,
          name: device.deviceName,
          price: device.amount,
          quantity: 1,
          itemType: "repair_service",
          notes: device.faultDescription,
        })),
        subtotal: totalAmount,
        taxRate: 0,
        tax: 0,
        total: totalAmount,
        paymentMethod,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerAddress: selectedCustomer.address,
        paidAmount: safePaid,
        pendingBalance: remainingBalance,
        cashierId: user?.uid,
        cashierName: user?.displayName || user?.email || "Staff",
        cashierRole: role ?? undefined,
        shiftId: activeShift?.id,
        repairId: invoiceRepairs[0]?.id,
        repairIds: invoiceRepairs.map((repair) => repair.id),
        deviceNumber: invoiceDevices[0]?.deviceNumber,
        deviceName: invoiceDevices[0]?.deviceName,
        deviceBrand: invoiceDevices[0]?.deviceBrand,
        deviceModel: invoiceDevices[0]?.deviceModel,
        deviceSerialNumber: invoiceDevices[0]?.deviceSerialNumber,
        devices: invoiceDevices,
        faultDescription: invoiceDevices.map((device) => `${device.deviceName}: ${device.faultDescription || "-"}`).join(" | "),
        invoiceStatus,
        priority: invoiceDevices[0]?.priority,
        technician: invoiceDevices[0]?.technician,
        estimatedCompletion: invoiceDevices[0]?.estimatedCompletion,
        termsAndConditions: terms.trim(),
        invoiceType: "repair",
        repairStatus: invoiceDevices[0]?.repairStatus,
        customerNote: invoiceNote.trim(),
        status: "completed",
        updatedAt: new Date().toISOString(),
      };

      setInvoices((current) => current.some((item) => item.id === finalInvoiceNumber) ? current.map((item) => item.id === finalInvoiceNumber ? invoice : item) : [invoice, ...current]);
      setRepairs((current) => {
        const next = [...current];
        for (const repair of invoiceRepairs) {
          const index = next.findIndex((item) => item.id === repair.id);
          if (index >= 0) next[index] = repair;
          else next.unshift(repair);
        }
        return next;
      });

      logStaffActivity(user, role, invoiceBeingEdited ? "repair_invoice.updated" : "repair_invoice.created", `${finalInvoiceNumber} - ${selectedCustomer.name} - ${money(totalAmount)} - ${invoiceDevices.length} device(s)`, finalInvoiceNumber);
      toast.success("Multi-device repair invoice generated.");
      if (!printPosInvoice(invoice)) toast.error("Unable to print this invoice. Open the repair detail page to print again.");
      navigate(`/repairs/${invoiceRepairs[0].id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-20 lg:pb-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Repair POS Invoice</h1>
          <p className="text-sm text-muted-foreground">One customer can have multiple devices on one invoice.</p>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => (
          <button key={step} type="button" disabled={!canOpenStep(index)} onClick={() => setActiveStep(index)} className={`rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${activeStep === index ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-white hover:border-primary"}`}>
            <span className="text-xs font-semibold">Step {index + 1}</span>
            <span className="mt-1 block font-semibold">{step}</span>
          </button>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 md:p-5">
          {activeStep === 0 && (
            <div className="space-y-4">
              <StepHeader title="Customer" helper="Search by phone/name, or add a new customer." action={<Button className="gap-2" onClick={() => openCustomerDialog()}><Plus className="h-4 w-4" />Add Customer</Button>} />
              <SearchBox value={customerQuery} onChange={setCustomerQuery} placeholder="Search customer phone, name, or address..." onClear={() => setCustomerQuery("")} />
              {matchingCustomers.length ? (
                <div className="overflow-hidden rounded-lg border bg-white">
                  <div className="max-h-72 overflow-y-auto">
                    {matchingCustomers.map((customer, index) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setCustomerQuery("");
                        }}
                        className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-muted/40 ${index !== matchingCustomers.length - 1 ? "border-b" : ""}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{customer.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{customer.phone || "No phone"}</p>
                        </div>
                        <p className="max-w-[45%] truncate text-xs text-muted-foreground">{customer.address || "No address"}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {customerQuery && !matchingCustomers.length && !selectedCustomer ? <Empty text="No matching customer found. Add customer to continue." /> : null}
              {selectedCustomer ? (
                <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="grid flex-1 gap-4 text-sm md:grid-cols-3 lg:gap-6">
                    <div><span className="text-muted-foreground">Customer</span><p className="font-medium">{selectedCustomer.name}</p></div>
                    <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{selectedCustomer.phone || "-"}</p></div>
                    <div className="min-w-0"><span className="text-muted-foreground">Address</span><p className="truncate font-medium">{selectedCustomer.address || "-"}</p></div>
                  </div>
                  <div className="flex items-center gap-2 self-start lg:self-center">
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => openCustomerDialog(selectedCustomer)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={clearSelectedCustomer}>
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : <Empty text="Select a customer to continue." />}
            </div>
          )}

          {activeStep === 1 && activeDevice && (
            <div className="space-y-4">
              <StepHeader title="Devices" helper="Add one or more devices for the same customer on this invoice." action={<Button className="gap-2" onClick={addDevice}><Plus className="h-4 w-4" />Add Another Device</Button>} />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {devices.map((device, index) => {
                  const deviceName = device.deviceType;
                  return (
                    <button key={device.localId} type="button" onClick={() => setActiveDeviceId(device.localId)} className={`rounded-lg border p-3 text-left transition ${activeDeviceId === device.localId ? "border-primary bg-primary/5" : "bg-white hover:border-primary"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">Device {index + 1}</p>
                          <p className="text-sm text-muted-foreground">{device.deviceNumber || "Generating..."}</p>
                        </div>
                        {devices.length > 1 ? (
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={(event) => { event.stopPropagation(); removeDevice(device.localId); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm font-medium">{deviceName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{device.fault || "Fault not entered yet"}</p>
                      <p className="mt-2 text-sm font-semibold">{money(Math.max(0, Number(device.amount) || 0))}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Device Number"><Input className="h-11 font-semibold" value={activeDevice.deviceNumber || "Generating..."} readOnly /></Field>
                <Field label="Device Type" action={activeDevice.deviceType ? <ClearButton onClick={() => clearDeviceField("deviceType", "")} /> : null}><><Input className="h-11" list="pos-device-type-options" value={activeDevice.deviceType} onChange={(event) => updateDevice(activeDevice.localId, { deviceType: event.target.value })} placeholder="Type or choose device type" /><datalist id="pos-device-type-options">{deviceTypes.map((device) => <option key={device} value={device} />)}</datalist></></Field>
                <Field label="Save New Device Type" action={customDeviceType ? <ClearButton onClick={() => setCustomDeviceType("")} /> : null}><div className="flex gap-2"><Input className="h-11" value={customDeviceType} onChange={(event) => setCustomDeviceType(event.target.value)} placeholder="Custom type" /><Button type="button" variant="outline" onClick={addDeviceType}>Add</Button></div></Field>
                <Field label="Brand" action={activeDevice.brand ? <ClearButton onClick={() => clearDeviceField("brand", "")} /> : null}><Input className="h-11" value={activeDevice.brand} onChange={(event) => updateDevice(activeDevice.localId, { brand: event.target.value })} /></Field>
                <Field label="Model" action={activeDevice.model ? <ClearButton onClick={() => clearDeviceField("model", "")} /> : null}><Input className="h-11" value={activeDevice.model} onChange={(event) => updateDevice(activeDevice.localId, { model: event.target.value })} /></Field>
                <Field label="Serial Number" action={activeDevice.serialNumber ? <ClearButton onClick={() => clearDeviceField("serialNumber", "")} /> : null}><Input className="h-11" value={activeDevice.serialNumber} onChange={(event) => updateDevice(activeDevice.localId, { serialNumber: event.target.value })} /></Field>
                <Field label="Device Amount" action={activeDevice.amount ? <ClearButton onClick={() => clearDeviceField("amount", "")} /> : null}><Input className="h-11" type="number" min="0" value={activeDevice.amount} onChange={(event) => updateDevice(activeDevice.localId, { amount: event.target.value })} /></Field>
                <Field label="Priority" action={activeDevice.priority !== "medium" ? <ClearButton onClick={() => clearDeviceField("priority", "medium" as NonNullable<PosSale["priority"]>)} /> : null}><Select value={activeDevice.priority} onValueChange={(value) => updateDevice(activeDevice.localId, { priority: value as NonNullable<PosSale["priority"]> })}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent>{["low", "medium", "high", "urgent"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Technician (Optional)" action={activeDevice.technician ? <ClearButton onClick={() => clearDeviceField("technician", "")} /> : null}><Select value={activeDevice.technician || "unassigned"} onValueChange={(value) => updateDevice(activeDevice.localId, { technician: value === "unassigned" ? "" : value })}><SelectTrigger className="h-11"><SelectValue placeholder="Not Assigned" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Not Assigned</SelectItem>{technicians.map((item) => <SelectItem key={item.id} value={item.fullName}>{item.fullName}{item.designation ? ` - ${item.designation}` : ""}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Repair Status" action={activeDevice.repairStatus !== "received" ? <ClearButton onClick={() => clearDeviceField("repairStatus", "received")} /> : null}><Select value={activeDevice.repairStatus} onValueChange={(value) => updateDevice(activeDevice.localId, { repairStatus: value })}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent>{["received", "diagnosing", "waiting_approval", "waiting_parts", "repairing", "testing", "completed", "ready", "delivered"].map((status) => <SelectItem key={status} value={status}>{labelForRepairStatus(status)}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Expected Completion" action={activeDevice.estimatedCompletion ? <ClearButton onClick={() => clearDeviceField("estimatedCompletion", defaultDueDate())} /> : null}><Input className="h-11" type="date" value={activeDevice.estimatedCompletion} onChange={(event) => updateDevice(activeDevice.localId, { estimatedCompletion: event.target.value })} /></Field>
              </div>
              <Field label="Fault Description" action={activeDevice.fault ? <ClearButton onClick={() => clearDeviceField("fault", "")} /> : null}><Textarea rows={3} value={activeDevice.fault} onChange={(event) => updateDevice(activeDevice.localId, { fault: event.target.value })} placeholder="Mention customer fault or issue here..." /></Field>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <StepHeader title="Invoice Details" helper="All selected devices will be saved under the same invoice number." />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Invoice Number"><Input className="h-11" value={invoiceNumber} readOnly /></Field>
              <Field label="Invoice Date" action={invoiceDate !== todayInput() ? <ClearButton onClick={() => setInvoiceDate(todayInput())} /> : null}><Input className="h-11" type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} /></Field>
              <Field label="Devices on Invoice"><Input className="h-11" value={String(devices.length)} readOnly /></Field>
              </div>
              <Summary title="Device Summary" rows={devices.map((device, index) => [`Device ${index + 1}`, `${device.deviceType} | ${money(Math.max(0, Number(device.amount) || 0))}`])} />
              <Field label="Invoice Note" action={invoiceNote ? <ClearButton onClick={() => setInvoiceNote("")} /> : null}><Textarea value={invoiceNote} onChange={(event) => setInvoiceNote(event.target.value)} rows={3} placeholder="Any note for customer or invoice..." /></Field>
              <Field label="Terms & Conditions" action={terms !== defaultTerms ? <ClearButton onClick={() => setTerms(defaultTerms)} /> : null}><Textarea value={terms} onChange={(event) => setTerms(event.target.value)} rows={4} /></Field>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <StepHeader title="Payment" helper="One invoice total for all devices combined." />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Grand Total"><Input className="h-11 font-semibold" value={money(totalAmount)} readOnly /></Field>
                <Field label="Paid Amount" action={Number(paidAmount) > 0 ? <ClearButton onClick={() => setPaidAmount("0")} /> : null}><Input className="h-11" type="number" min="0" max={totalAmount} value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} /></Field>
                <Field label="Remaining Balance"><Input className="h-11 font-semibold" value={money(remainingBalance)} readOnly /></Field>
                <Field label="Payment Method" action={paymentMethod !== "Cash" ? <ClearButton onClick={() => setPaymentMethod("Cash")} /> : null}><Select value={paymentMethod} onValueChange={setPaymentMethod}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent>{["Cash", "Card", "Bank Transfer", "JazzCash", "EasyPaisa", "Credit"].map((method) => <SelectItem key={method} value={method}>{method}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Payment Status"><Input className="h-11 font-semibold" value={paymentStatus} readOnly /></Field>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-background/95 py-3 backdrop-blur">
        <Button variant="outline" size="lg" onClick={() => setActiveStep((step) => Math.max(0, step - 1))} disabled={activeStep === 0}>Back</Button>
        {activeStep < steps.length - 1 ? (
          <Button size="lg" onClick={goNext}>Next</Button>
        ) : (
          <Button size="lg" className="gap-2" onClick={saveInvoice} disabled={isSaving}>
            {isSaving ? <CheckCircle2 className="h-5 w-5 animate-pulse" /> : <Printer className="h-5 w-5" />}
            {isSaving ? "Saving..." : "Generate Invoice"}
          </Button>
        )}
      </div>

      <Dialog open={customerOpen} onOpenChange={setCustomerOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCustomerId ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
          <form onSubmit={saveCustomer} className="space-y-4">
            <Field label="Customer Name"><Input required value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} /></Field>
            <Field label="Phone Number"><Input required type="tel" inputMode="tel" value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: sanitizeCustomerPhone(event.target.value) })} placeholder="03XXXXXXXXX or +92XXXXXXXXXX" /></Field>
            <Field label="Address"><Textarea value={customerForm.address} onChange={(event) => setCustomerForm({ ...customerForm, address: event.target.value })} rows={3} /></Field>
            <Field label="Description"><Textarea value={customerForm.description} onChange={(event) => setCustomerForm({ ...customerForm, description: event.target.value })} rows={3} /></Field>
            <DialogFooter><Button type="button" variant="outline" onClick={() => { setCustomerOpen(false); setEditingCustomerId(""); setCustomerForm({ name: "", phone: "", address: "", description: "" }); }}>Cancel</Button><Button type="submit">{editingCustomerId ? "Save Changes" : "Save Customer"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StepHeader({ title, helper, action }: { title: string; helper: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{helper}</p></div>{action}</div>;
}

function SearchBox({ value, onChange, placeholder, onClear }: { value: string; onChange: (value: string) => void; placeholder: string; onClear?: () => void }) {
  return <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-12 pl-10 pr-11 text-base" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />{value ? <button type="button" onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"><X className="h-4 w-4" /></button> : null}</div>;
}

function SelectCard({ title, detail, active, onClick }: { title: string; detail: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${active ? "border-primary bg-primary/5" : "bg-white hover:border-primary"}`}><p className="text-base font-semibold">{title}</p>{detail ? <p className="mt-1 text-sm text-muted-foreground">{detail}</p> : null}</button>;
}

function Summary({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return <div className="rounded-lg border bg-muted/30 p-4"><p className="mb-2 font-semibold">{title}</p>{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-t py-2 text-sm"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>)}</div>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">{text}</p>;
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"><X className="h-3.5 w-3.5" />Clear</button>;
}

function Field({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) {
  return <div className="space-y-2"><div className="flex items-center justify-between gap-3"><Label>{label}</Label>{action}</div>{children}</div>;
}
