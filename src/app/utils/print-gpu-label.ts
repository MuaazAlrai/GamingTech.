import type { GpuItem } from "../types/gpu-item";

const escapeHtml = (value: string | undefined) => String(value ?? "-")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

export function printGpuLabel(gpu: GpuItem) {
  const printWindow = window.open("", "_blank", "width=500,height=500");
  if (!printWindow) return false;
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(gpu.id)} - GPU Label</title><style>
  @page{size:80mm 50mm;margin:0}*{box-sizing:border-box}html,body{width:80mm;height:50mm;margin:0}body{font-family:Arial;color:#000}.label{width:80mm;height:50mm;padding:3mm;border:.45mm solid #000;overflow:hidden}.head{display:flex;justify-content:space-between;border-bottom:.35mm solid #000;padding-bottom:2mm;margin-bottom:2mm}.brand{font-size:12pt;font-weight:900}.kind{font-size:6.5pt;margin-top:1mm}.id{font-size:14pt;font-weight:900}.row{display:grid;grid-template-columns:18mm 1fr;gap:1mm;margin:2mm 0;font-size:9pt}.key{font-weight:700}.value{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.footer{border-top:.25mm solid #000;margin-top:2mm;padding-top:1.5mm;font-size:7pt}
  </style></head><body><main class="label"><div class="head"><div><div class="brand">GamingTech.pk</div><div class="kind">GPU DEVICE LABEL</div></div><div class="id">${escapeHtml(gpu.id)}</div></div><div class="row"><span class="key">Customer</span><span class="value">${escapeHtml(gpu.customer)}</span></div><div class="row"><span class="key">GPU Model</span><span class="value">${escapeHtml(gpu.model)}</span></div><div class="row"><span class="key">Serial</span><span class="value">${escapeHtml(gpu.serial)}</span></div><div class="row"><span class="key">Status</span><span class="value">${escapeHtml(gpu.status)}</span></div><div class="footer">Added: ${escapeHtml(gpu.createdAt?.slice(0,10))}</div></main><script>window.addEventListener('load',function(){setTimeout(function(){window.print()},150)});<\/script></body></html>`);
  printWindow.document.close();
  return true;
}
