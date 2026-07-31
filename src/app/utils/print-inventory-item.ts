import { displayInvoiceNumber } from "./invoice-number";

const safe = (value: string | number | undefined) =>
  String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

type PrintableInventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier?: string;
  customerPhone?: string;
  totalAmount?: number;
  receivedAmount?: number;
  pendingAmount?: number;
  invoiceNumber?: string;
};

const money = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 2 });

export function printInventoryItem(item: PrintableInventoryItem) {
  const originalTitle = document.title;
  const originalBody = document.body.innerHTML;
  const now = new Date();
  const invoiceNumber = displayInvoiceNumber(item.invoiceNumber, item.id);
  const totalAmount = Math.max(0, item.totalAmount ?? 0);
  const receivedAmount = Math.max(0, item.receivedAmount ?? 0);
  const pendingAmount = Math.max(0, item.pendingAmount ?? Math.max(0, totalAmount - receivedAmount));
  let restored = false;

  const restorePage = () => {
    if (restored) return;
    restored = true;
    document.title = originalTitle;
    document.body.innerHTML = originalBody;
    window.location.reload();
  };

  document.title = `${invoiceNumber} Sale Invoice`;
  document.body.innerHTML = `
    <main style="font-family: Arial, sans-serif; color: #111827; padding: 28px; max-width: 900px; margin: 0 auto;">
      <header style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 30px; margin: 0;">GamingTech.pk</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #4b5563;">Repair Management System</p>
        <h2 style="font-size: 28px; margin: 18px 0 0;">Sale Invoice</h2>
      </header>

      <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px;">
        <div>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Invoice ID:</strong> ${safe(invoiceNumber)}</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Invoice Date:</strong> ${safe(now.toLocaleDateString())}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Time:</strong> ${safe(now.toLocaleTimeString())}</p>
        </div>
        <div>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Customer:</strong> ${safe(item.supplier || "Customer")}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Phone:</strong> ${safe(item.customerPhone || "-")}</p>
        </div>
      </section>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <thead>
          <tr>
            <th style="border-bottom: 1px solid #111827; padding: 10px 8px; text-align: left; font-size: 13px;">SN</th>
            <th style="border-bottom: 1px solid #111827; padding: 10px 8px; text-align: left; font-size: 13px;">Item</th>
            <th style="border-bottom: 1px solid #111827; padding: 10px 8px; text-align: right; font-size: 13px;">Qty</th>
            <th style="border-bottom: 1px solid #111827; padding: 10px 8px; text-align: right; font-size: 13px;">Rate</th>
            <th style="border-bottom: 1px solid #111827; padding: 10px 8px; text-align: right; font-size: 13px;">Item Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border-bottom: 1px solid #d1d5db; padding: 10px 8px; font-size: 13px;">${safe(item.sku)}</td>
            <td style="border-bottom: 1px solid #d1d5db; padding: 10px 8px; font-size: 13px;">${safe(item.name)}</td>
            <td style="border-bottom: 1px solid #d1d5db; padding: 10px 8px; text-align: right; font-size: 13px;">1</td>
            <td style="border-bottom: 1px solid #d1d5db; padding: 10px 8px; text-align: right; font-size: 13px;">${safe(money(totalAmount))}</td>
            <td style="border-bottom: 1px solid #d1d5db; padding: 10px 8px; text-align: right; font-size: 13px;">${safe(money(totalAmount))}</td>
          </tr>
        </tbody>
      </table>

      <section style="display: flex; justify-content: flex-end; margin-bottom: 28px;">
        <div style="width: 320px;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;"><span>Sub Total</span><strong>${safe(money(totalAmount))}</strong></div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;"><span>Adjustments</span><strong>0</strong></div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;"><span>Receivable</span><strong>${safe(money(totalAmount))}</strong></div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;"><span>Received</span><strong>${safe(money(receivedAmount))}</strong></div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0 0; border-top: 1px solid #111827; font-size: 15px;"><span>Balance</span><strong>${safe(money(pendingAmount))}</strong></div>
        </div>
      </section>

      <section style="margin-bottom: 18px;">
        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700;">Note:</p>
        <p style="margin: 0; font-size: 13px; color: #4b5563;">Inventory invoice generated from GamingTech.pk system.</p>
      </section>

      <section style="margin-bottom: 18px;">
        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700;">Terms and Conditions</p>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #374151; line-height: 1.6;">
          <li>All invoice details are generated from the system record.</li>
          <li>Please verify item name, device number, and amount before final delivery.</li>
          <li>Received and pending balances are shown according to the current inventory record.</li>
        </ul>
      </section>

      <footer style="border-top: 1px solid #d1d5db; padding-top: 14px; text-align: center; font-size: 12px; color: #4b5563;">
        <p style="margin: 0;">GamingTech.pk</p>
      </footer>
    </main>
  `;

  window.addEventListener("afterprint", restorePage, { once: true });
  window.print();
  window.setTimeout(restorePage, 1000);
  return true;
}
