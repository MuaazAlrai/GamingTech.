import type { PosSale } from "../types/pos-sale";
import { printSimpleDocument } from "./print-simple-document";

export function printPosInvoice(sale: PosSale) {
  return printSimpleDocument({
    title: "Repair Invoice",
    primaryLabel: "Invoice Number",
    primaryValue: sale.id,
    customerName: sale.customerName || "Customer",
  });
}
