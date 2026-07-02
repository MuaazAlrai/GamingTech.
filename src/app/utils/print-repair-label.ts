import type { RepairTicket } from "../types/repair-ticket";

const escapeHtml = (value: string | number | undefined) =>
  String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function printRepairLabel(ticket: RepairTicket) {
  const printWindow = window.open("", "_blank", "width=500,height=500");
  if (!printWindow) return false;

  printWindow.document.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(ticket.id)} - Device Label</title>
<style>
  @page { size: 80mm 50mm; margin: 0; }
  * { box-sizing: border-box; }
  html, body { width: 80mm; height: 50mm; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; }
  .label { width: 80mm; height: 50mm; padding: 3mm; border: .45mm solid #000; overflow: hidden; }
  .head { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: .35mm solid #000; padding-bottom: 1.5mm; margin-bottom: 1.5mm; }
  .brand { font-size: 12pt; font-weight: 900; line-height: 1; }
  .tagline { font-size: 6.5pt; margin-top: 1mm; }
  .ticket { font-size: 14pt; line-height: 1; font-weight: 900; text-align: right; }
  .repair { font-size: 7pt; text-align: right; margin-top: 1mm; }
  .row { display: grid; grid-template-columns: 17mm 1fr; gap: 1mm; margin: 1mm 0; font-size: 8pt; line-height: 1.12; }
  .key { font-weight: 700; }
  .value { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .issue { border-top: .25mm solid #000; margin-top: 1.5mm; padding-top: 1.5mm; }
  .footer { display: flex; justify-content: space-between; border-top: .25mm solid #000; margin-top: 1.5mm; padding-top: 1mm; font-size: 6.5pt; }
</style></head><body>
<main class="label">
  <div class="head"><div><div class="brand">GamingTech.pk</div><div class="tagline">REPAIR DEVICE LABEL</div></div><div><div class="ticket">${escapeHtml(ticket.id)}</div><div class="repair">${escapeHtml(ticket.repairId)}</div></div></div>
  <div class="row"><span class="key">Customer</span><span class="value">${escapeHtml(ticket.customer)}</span></div>
  <div class="row"><span class="key">Device</span><span class="value">${escapeHtml(ticket.device)}</span></div>
  <div class="row"><span class="key">Serial No.</span><span class="value">${escapeHtml(ticket.serialNumber)}</span></div>
  <div class="row issue"><span class="key">Issue</span><span class="value">${escapeHtml(ticket.issue)}</span></div>
  <div class="footer"><span>Received: ${escapeHtml(ticket.createdAt)}</span><span>Priority: ${escapeHtml(ticket.priority).toUpperCase()}</span></div>
</main>
<script>window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 150); });<\/script>
</body></html>`);
  printWindow.document.close();
  return true;
}
