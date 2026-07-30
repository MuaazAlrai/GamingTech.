import type { GpuItem } from "../types/gpu-item";
import { printSimpleDocument } from "./print-simple-document";

export function printGpuLabel(gpu: GpuItem) {
  return printSimpleDocument({
    primaryValue: gpu.id,
    customerName: gpu.customer || "Customer",
  });
}
