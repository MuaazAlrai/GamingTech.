import type { PosSale } from "../types/pos-sale";

const safe = (value: string | number) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const money = (value: number) => `Rs ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function printPosReceipt(sale: PosSale) {
  const printWindow = window.open("", "_blank", "width=420,height=650");
  if (!printWindow) return false;
  const rows = sale.items.map((item) => `<tr><td>${safe(item.name)}<small>${item.quantity} x ${money(item.price)}</small></td><td>${money(item.price * item.quantity)}</td></tr>`).join("");
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safe(sale.id)} Receipt</title><style>@page{size:80mm auto;margin:3mm}*{box-sizing:border-box}body{width:74mm;margin:0;font:10pt Arial;color:#000}.center{text-align:center}h1{font-size:17pt;margin:0}.muted{font-size:8pt;margin:1mm 0 3mm}hr{border:0;border-top:1px dashed #000;margin:3mm 0}table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top}td:last-child{text-align:right;white-space:nowrap}small{display:block;font-size:7.5pt}.total{font-size:13pt;font-weight:700}.footer{margin-top:5mm;font-size:8pt}</style></head><body><div class="center"><h1>GamingTech.pk</h1><div class="muted">SALES RECEIPT</div></div><div>Bill: <b>${safe(sale.id)}</b></div><div>Date: ${safe(new Date(sale.date).toLocaleString())}</div><hr><table>${rows}</table><hr><table><tr><td>Subtotal</td><td>${money(sale.subtotal)}</td></tr><tr><td>Tax (17%)</td><td>${money(sale.tax)}</td></tr><tr class="total"><td>Total</td><td>${money(sale.total)}</td></tr><tr><td>Payment</td><td>${safe(sale.paymentMethod)}</td></tr></table><div class="center footer">Thank you for shopping with GamingTech.pk</div><script>window.addEventListener('load',function(){setTimeout(function(){window.print()},150)});<\/script></body></html>`);
  printWindow.document.close();
  return true;
}
