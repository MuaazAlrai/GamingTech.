import type { PosSale } from "../types/pos-sale";

const safe = (value: string | number | undefined) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const money = (value: number) => `Rs ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function printPosReceipt(sale: PosSale) {
  const printWindow = window.open("", "_blank", "width=900,height=760");
  if (!printWindow) return false;

  const paid = sale.paidAmount ?? sale.total;
  const balance = Math.max(0, sale.total - paid);
  const rows = sale.items.map((item, index) => `
    <tr>
      <td class="center">${index + 1}</td>
      <td>${safe(item.id)}</td>
      <td><b>${safe(item.name)}</b></td>
      <td class="center">${item.quantity}</td>
      <td class="right">${money(item.price)}</td>
      <td class="right">${money(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  printWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safe(sale.id)} Repair Invoice</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #111827; background: #f3f4f6; }
    .no-print { padding: 12px; text-align: right; }
    .no-print button { border: 0; border-radius: 6px; background: #10b981; color: white; padding: 10px 16px; font-weight: 800; cursor: pointer; }
    .invoice { max-width: 820px; margin: 0 auto 24px; background: white; border: 1px solid #d1d5db; box-shadow: 0 12px 28px rgb(15 23 42 / 12%); }
    .top { background: #10b981; color: white; padding: 18px 22px; display: flex; justify-content: space-between; gap: 18px; }
    .brand h1 { margin: 0; font-size: 26px; }
    .brand p { margin: 4px 0 0; opacity: .9; }
    .meta { text-align: right; font-size: 13px; line-height: 1.6; }
    .section { padding: 18px 22px; }
    .party { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .box { border: 1px solid #dbe2ea; border-radius: 6px; padding: 12px; min-height: 92px; }
    .box h3 { margin: 0 0 8px; color: #059669; font-size: 12px; text-transform: uppercase; }
    .box p { margin: 3px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #10b981; color: white; padding: 10px; font-size: 12px; text-align: left; }
    td { border-bottom: 1px solid #e5e7eb; padding: 10px; font-size: 12px; }
    .right { text-align: right; }
    .center { text-align: center; }
    .totals { width: 360px; margin-left: auto; margin-top: 18px; border: 1px solid #dbe2ea; border-radius: 6px; overflow: hidden; }
    .totals td { border: 0; padding: 8px 12px; }
    .totals .grand td { background: #10b981; color: white; font-size: 16px; font-weight: 800; }
    .footer { padding: 16px 22px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    @media print {
      body { background: white; }
      .no-print { display: none; }
      .invoice { box-shadow: none; margin: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="no-print"><button onclick="window.print()">Print / Save Invoice</button></div>
  <main class="invoice">
    <div class="top">
      <div class="brand">
        <h1>GamingTech.pk</h1>
        <p>Repair Invoice</p>
      </div>
      <div class="meta">
        <div><b>Repair Invoice:</b> ${safe(sale.id)}</div>
        <div><b>Device:</b> ${safe(sale.deviceNumber)}</div>
        <div><b>Date:</b> ${safe(new Date(sale.date).toLocaleString())}</div>
        <div><b>Cashier:</b> ${safe(sale.cashierName ?? "Staff")}</div>
      </div>
    </div>
    <section class="section party">
      <div class="box">
        <h3>Customer</h3>
        <p><b>${safe(sale.customerName ?? "Customer")}</b></p>
        <p>${safe(sale.customerPhone || "No phone")}</p>
        <p>${safe(sale.customerAddress || "No address")}</p>
      </div>
      <div class="box">
        <h3>Payment</h3>
        <p><b>Method:</b> ${safe(sale.paymentMethod)}</p>
        <p><b>Paid:</b> ${money(paid)}</p>
        <p><b>Balance:</b> ${money(balance)}</p>
      </div>
    </section>
    <section class="section">
      <table>
        <thead>
          <tr><th class="center">#</th><th>Type / Code</th><th>Repair Item</th><th class="center">Qty</th><th class="right">Unit Price</th><th class="right">Amount</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <table class="totals">
        <tr><td>Sub Total</td><td class="right">${money(sale.subtotal)}</td></tr>
        <tr><td>Discount</td><td class="right">- ${money(sale.discount ?? 0)}</td></tr>
        <tr><td>Tax (${safe(sale.taxRate ?? 0)}%)</td><td class="right">${money(sale.tax)}</td></tr>
        <tr class="grand"><td>Total</td><td class="right">${money(sale.total)}</td></tr>
        <tr><td>Paid</td><td class="right">${money(paid)}</td></tr>
        <tr><td>Balance</td><td class="right">${money(balance)}</td></tr>
      </table>
    </section>
    <div class="footer">Thank you for choosing GamingTech.pk for your repair.</div>
  </main>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 180));<\/script>
</body>
</html>`);
  printWindow.document.close();
  return true;
}
