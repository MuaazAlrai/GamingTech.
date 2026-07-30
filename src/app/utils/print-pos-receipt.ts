import type { PosSale } from "../types/pos-sale";
import { printSimpleDocument } from "./print-simple-document";

export function printPosReceipt(sale: PosSale) {
  return printSimpleDocument({
    primaryValue: sale.deviceNumber || sale.id,
    customerName: sale.customerName || "Customer",
  });
}
