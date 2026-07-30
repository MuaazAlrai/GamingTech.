import type { PosSale } from "../types/pos-sale";
import type { RepairTicket } from "../types/repair-ticket";
import { labelForRepairStatus, progressForRepairStatus } from "./repair-status";

export type RepairInventoryItem = {
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
  totalAmount?: number;
  receivedAmount?: number;
  pendingAmount?: number;
  invoiceNumber?: string;
  customerPhone?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  linkedRepairId?: string;
  source?: "part" | "repair";
  timeline?: { date: string; status: string; note: string; progress: number }[];
};

const moneyValue = (repair: RepairTicket, invoice?: PosSale) =>
  Math.max(0, invoice?.total ?? repair.amount ?? 0);

const receivedValue = (repair: RepairTicket, invoice?: PosSale) =>
  Math.max(0, invoice?.paidAmount ?? repair.paidAmount ?? 0);

export function buildRepairInventoryItems(repairs: RepairTicket[], invoices: PosSale[]): RepairInventoryItem[] {
  return repairs.map((repair) => {
    const linkedInvoice = invoices.find((invoice) =>
      invoice.repairId === repair.id ||
      invoice.id === repair.invoiceNumber ||
      invoice.deviceNumber === repair.deviceNumber,
    );

    const totalAmount = moneyValue(repair, linkedInvoice);
    const receivedAmount = receivedValue(repair, linkedInvoice);
    const pendingAmount = Math.max(0, linkedInvoice?.pendingBalance ?? totalAmount - receivedAmount);

    return {
      id: repair.id,
      name: repair.device || linkedInvoice?.deviceName || "Repair Device",
      category: repair.category || "Repair Device",
      sku: repair.deviceNumber || repair.ticketNumber || repair.id,
      stock: 1,
      reorderLevel: 1,
      unit: "device",
      costPrice: moneyValue(repair, linkedInvoice),
      sellingPrice: moneyValue(repair, linkedInvoice),
      supplier: repair.customer || linkedInvoice?.customerName || "Customer",
      location: repair.invoiceNumber || linkedInvoice?.id || "Pending Invoice",
      status: labelForRepairStatus(repair.status),
      progress: repair.statusHistory?.[0]?.progress ?? repair.timeline?.[0]?.progress ?? progressForRepairStatus(repair.status),
      totalAmount,
      receivedAmount,
      pendingAmount,
      invoiceNumber: repair.invoiceNumber || linkedInvoice?.id,
      customerPhone: repair.customerPhone || linkedInvoice?.customerPhone,
      brand: repair.brand || linkedInvoice?.deviceBrand,
      model: repair.model || linkedInvoice?.deviceModel,
      serialNumber: repair.serialNumber || linkedInvoice?.deviceSerialNumber,
      linkedRepairId: repair.id,
      source: "repair",
      timeline: (repair.timeline ?? []).map((event) => ({
        date: event.date,
        status: labelForRepairStatus(event.status),
        note: event.note,
        progress: event.progress ?? progressForRepairStatus(event.status),
      })),
    };
  });
}
