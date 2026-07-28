import type { PosSale } from "../types/pos-sale";

const safe = (value: string | number | undefined) =>
  String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const money = (value: number) => `Rs ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function printPosInvoice(sale: PosSale) {
  const printWindow = window.open("", "_blank", "width=900,height=750");
  if (!printWindow) return false;

  const paid = sale.paidAmount ?? sale.total;
  const balance = Math.max(0, sale.total - paid);
  const paymentStatus = balance <= 0 ? "PAID" : paid > 0 ? "PARTIALLY PAID" : "UNPAID";
  const rows = sale.items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <b>${safe(item.name)}</b>
            <div class="muted">${safe(item.partCode || item.id)}</div>
            ${item.warranty ? `<div class="muted">Warranty: ${safe(item.warranty)}</div>` : ""}
          </td>
          <td class="right">${item.quantity}</td>
          <td class="right">${money(item.price)}</td>
          <td class="right">${money(item.price * item.quantity)}</td>
        </tr>
      `,
    )
    .join("");

  printWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safe(sale.id)} Repair Invoice</title>
  <style>
    @page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;font:12px Arial;color:#172033}.header{display:flex;justify-content:space-between;border-bottom:3px solid #172033;padding-bottom:18px}.brand h1{margin:0;font-size:28px}.brand p,.muted{color:#687386;margin:4px 0}.invoice{text-align:right}.invoice h2{font-size:24px;margin:0}.status{display:inline-block;margin-top:8px;padding:5px 10px;border:1px solid #172033;font-weight:700}.details{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:24px 0}.box{border:1px solid #d9dee8;padding:14px;border-radius:6px}.box h3{font-size:11px;text-transform:uppercase;color:#687386;margin:0 0 8px}.box p{margin:4px 0}table{width:100%;border-collapse:collapse}th{background:#172033;color:white;text-align:left;padding:10px}td{border-bottom:1px solid #e4e8ef;padding:10px}.right{text-align:right}.totals{width:340px;margin:20px 0 0 auto}.totals td{border:0;padding:6px 10px}.totals .grand td{border-top:2px solid #172033;font-size:16px;font-weight:700}.footer{margin-top:45px;border-top:1px solid #d9dee8;padding-top:12px;text-align:center;color:#687386}.no-print{margin-bottom:15px;text-align:right}@media print{.no-print{display:none}}
  </style>
</head>
<body>
  <div class="no-print"><button onclick="window.print()">Print / Save as PDF</button></div>
  <div class="header">
    <div class="brand">
      <h1>GamingTech.pk</h1>
      <p>Repair Management</p>
    </div>
    <div class="invoice">
      <h2>REPAIR INVOICE</h2>
      <p><b>${safe(sale.id)}</b></p>
      <p>${safe(new Date(sale.date).toLocaleString())}</p>
      <p>Device: <b>${safe(sale.deviceNumber || "Not linked")}</b></p>
      <span class="status">${paymentStatus}</span>
    </div>
  </div>
  <div class="details">
    <div class="box">
      <h3>Customer</h3>
      <p><b>${safe(sale.customerName ?? "Customer")}</b></p>
      <p>${safe(sale.customerPhone || "No phone")}</p>
      <p>${safe(sale.customerAddress || "No address")}</p>
    </div>
    <div class="box">
      <h3>Repair Payment</h3>
      <p>Method: <b>${safe(sale.paymentMethod)}</b></p>
      <p>Cashier: <b>${safe(sale.cashierName ?? "Staff")}</b></p>
      <p>Role: <b>${safe(sale.cashierRole ?? "")}</b></p>
      <p>Repair status: <b>${safe(sale.repairStatus ?? sale.status ?? "completed")}</b></p>
      <p>Payment status: <b>${paymentStatus}</b></p>
    </div>
  </div>
  <table>
    <thead>
      <tr><th>#</th><th>Repair Item Details</th><th class="right">Qty</th><th class="right">Unit Price</th><th class="right">Amount</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals">
    <tr><td>Subtotal</td><td class="right">${money(sale.subtotal)}</td></tr>
    <tr><td>Discount</td><td class="right">- ${money(sale.discount ?? 0)}</td></tr>
    <tr><td>Tax (${safe(sale.taxRate ?? 17)}%)</td><td class="right">${money(sale.tax)}</td></tr>
    <tr class="grand"><td>Grand Total</td><td class="right">${money(sale.total)}</td></tr>
    <tr><td>Paid</td><td class="right">${money(paid)}</td></tr>
    <tr><td>Pending</td><td class="right">${money(balance)}</td></tr>
  </table>
  <div class="footer">Thank you for choosing GamingTech.pk. Warranty applies only where mentioned on repair items.</div>
  <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),180));<\/script>
</body>
</html>`);
  printWindow.document.close();
  return true;
}
