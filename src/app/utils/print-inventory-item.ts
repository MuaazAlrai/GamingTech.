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

const safe = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const money = (value?: number) => `Rs ${Number(value ?? 0).toLocaleString()}`;

export function printInventoryItem(item: PrintableInventoryItem) {
  const printWindow = window.open("", "_blank", "width=900,height=760");
  if (!printWindow) return false;

  const progress = Math.max(0, Math.min(Number(item.progress ?? 25), 100));
  const remaining = 100 - progress;
  const timeline = item.timeline?.length
    ? item.timeline
    : [{ date: new Date().toISOString(), status: item.status ?? "Work Started", progress, note: "Inventory item added." }];
  const rows = timeline
    .map(
      (event) =>
        `<tr><td>${safe(new Date(event.date).toLocaleString())}</td><td>${safe(event.status)}</td><td>${safe(event.progress)}%</td><td>${safe(event.note)}</td></tr>`,
    )
    .join("");

  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safe(item.id)} - Inventory Item</title><style>
    @page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;font:13px Arial;color:#172033}.no-print{text-align:right;margin-bottom:14px}.no-print button{border:0;border-radius:6px;background:#10b981;color:white;padding:10px 16px;font-weight:800;cursor:pointer}.header{display:flex;justify-content:space-between;border-bottom:3px solid #172033;padding-bottom:16px}.brand h1{margin:0;font-size:28px}.muted{color:#687386}.id{text-align:right}.id h2{margin:0;font-size:22px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0}.box{border:1px solid #d9dee8;border-radius:8px;padding:14px}.box h3{margin:0 0 10px;font-size:11px;text-transform:uppercase;color:#687386}.row{display:flex;justify-content:space-between;gap:16px;margin:7px 0}.status{display:inline-block;border:1px solid #172033;border-radius:999px;padding:5px 10px;font-weight:800}.bar{height:18px;border:1px solid #172033;border-radius:999px;overflow:hidden;background:#eef2f7}.bar span{display:block;height:100%;background:#10b981}.split{display:grid;grid-template-columns:${progress}fr ${remaining || 1}fr;margin-top:8px;font-weight:800}.split div:last-child{text-align:right;color:#687386}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#172033;color:#fff;text-align:left;padding:9px}td{border-bottom:1px solid #e4e8ef;padding:9px}.footer{margin-top:30px;border-top:1px solid #d9dee8;padding-top:10px;text-align:center;color:#687386}@media print{.no-print{display:none}}
  </style></head><body><div class="no-print"><button onclick="window.print()">Print / Save PDF</button></div><div class="header"><div class="brand"><h1>GamingTech.pk</h1><p class="muted">Inventory Work Report</p></div><div class="id"><h2>${safe(item.id)}</h2><p>${safe(new Date().toLocaleString())}</p></div></div><div class="grid"><div class="box"><h3>Item</h3><div class="row"><b>Name</b><span>${safe(item.name)}</span></div><div class="row"><b>SKU</b><span>${safe(item.sku)}</span></div><div class="row"><b>Category</b><span>${safe(item.category)}</span></div><div class="row"><b>Customer</b><span>${safe(item.supplier || "-")}</span></div></div><div class="box"><h3>Status</h3><p><span class="status">${safe(item.status ?? "Work Started")}</span></p><div class="bar"><span style="width:${progress}%"></span></div><div class="split"><div>${progress}% complete</div><div>${remaining}% remaining</div></div><div class="row"><b>Location</b><span>${safe(item.location || "-")}</span></div><div class="row"><b>Cost Price</b><span>${safe(money(item.costPrice))}</span></div></div></div><div class="box"><h3>Timeline</h3><table><thead><tr><th>Date</th><th>Status</th><th>Complete</th><th>Note</th></tr></thead><tbody>${rows}</tbody></table></div><div class="footer">This inventory item report was generated electronically.</div><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),180));<\/script></body></html>`);
  printWindow.document.close();
  return true;
}
