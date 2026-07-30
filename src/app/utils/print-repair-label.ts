import type { RepairTicket } from "../types/repair-ticket";
import { printSimpleDocument } from "./print-simple-document";

export function printRepairLabel(ticket: RepairTicket) {
  const deviceNumber = ticket.deviceNumber || ticket.ticketNumber || ticket.id;
  return printSimpleDocument({
    title: "Customer Device",
    primaryLabel: "Device ID",
    primaryValue: deviceNumber,
    customerName: ticket.customer || "Customer",
  });
}
