import { printSimpleDocument } from "./print-simple-document";

type PrintableInventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier?: string;
  location?: string;
  costPrice?: number;
  unit?: string;
  status?: string;
  progress?: number;
  timeline?: { date: string; status: string; note: string; progress: number }[];
};

export function printInventoryItem(item: PrintableInventoryItem) {
  return printSimpleDocument({
    primaryValue: item.id,
    customerName: item.supplier || item.name || "Customer",
  });
}
