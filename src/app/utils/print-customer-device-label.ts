import { printSimpleDocument } from "./print-simple-document";

type PrintableCustomerDevice = {
  customerName?: string;
  deviceId?: string;
  title?: string;
};

export function printCustomerDeviceLabel({ customerName, deviceId, title = "Device Label" }: PrintableCustomerDevice) {
  return printSimpleDocument({
    title,
    primaryLabel: "Device ID",
    primaryValue: deviceId || "Pending Device ID",
    customerName: customerName || "Customer",
  });
}
