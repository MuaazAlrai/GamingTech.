import type { RepairTicket } from "../types/repair-ticket";

const escapeHtml = (value: string | number | undefined) =>
  String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function printRepairLabel(ticket: RepairTicket) {
  const printWindow = window.open("", "_blank", "width=760,height=650");
  if (!printWindow) return false;
  const jobNumber = ticket.jobNumber || "-";
  const ticketNumber = ticket.ticketNumber || ticket.id;

  printWindow.document.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(ticket.id)} - Device Label</title>
<style>
  @page { size: 80mm 50mm; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; min-height: 100%; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; background: #f3f4f6; }
  .toolbar { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; padding: 14px; background: #fff; border-bottom: 1px solid #d1d5db; position: sticky; top: 0; z-index: 10; }
  .field { display: grid; gap: 4px; font-size: 12px; font-weight: 700; color: #374151; }
  .field input { width: 96px; height: 36px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 10px; font-size: 14px; }
  .toolbar button { height: 36px; border: 0; border-radius: 6px; padding: 0 14px; font-weight: 800; cursor: pointer; }
  .print { background: #2563eb; color: #fff; }
  .preset { background: #e5e7eb; color: #111827; }
  .hint { width: 100%; color: #6b7280; font-size: 12px; }
  .preview { padding: 24px; display: grid; gap: 24px; justify-content: center; }
  .copy { width: 148mm; padding: 8mm; border: .35mm solid #111; background: #fff; box-shadow: 0 10px 24px rgb(15 23 42 / 12%); }
  .copy-head { display: flex; justify-content: space-between; border-bottom: .35mm solid #111; padding-bottom: 4mm; margin-bottom: 4mm; }
  .copy h1 { margin: 0; font-size: 18pt; }
  .copy-job { font-size: 26pt; font-weight: 900; color: #111; }
  .copy-grid { display: grid; grid-template-columns: 34mm 1fr; gap: 2mm; font-size: 11pt; margin-top: 2mm; }
  .copy-key { font-weight: 800; }
  .label { width: 80mm; height: 50mm; padding: 3mm; border: .45mm solid #000; overflow: hidden; background: #fff; box-shadow: 0 10px 24px rgb(15 23 42 / 18%); }
  .head { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: .35mm solid #000; padding-bottom: 1.5mm; margin-bottom: 1.5mm; }
  .brand { font-size: 12pt; font-weight: 900; line-height: 1; }
  .tagline { font-size: 6.5pt; margin-top: 1mm; }
  .ticket { font-size: 18pt; line-height: 1; font-weight: 900; text-align: right; }
  .repair { font-size: 7pt; text-align: right; margin-top: 1mm; }
  .row { display: grid; grid-template-columns: 17mm 1fr; gap: 1mm; margin: 1mm 0; font-size: 8pt; line-height: 1.12; }
  .key { font-weight: 700; }
  .value { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .issue { border-top: .25mm solid #000; margin-top: 1.5mm; padding-top: 1.5mm; }
  .footer { display: flex; justify-content: space-between; border-top: .25mm solid #000; margin-top: 1.5mm; padding-top: 1mm; font-size: 6.5pt; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .preview { padding: 0; display: block; }
    .copy, .label { box-shadow: none; page-break-inside: avoid; }
    .copy { margin-bottom: 8mm; }
  }
</style></head><body>
<div class="toolbar">
  <label class="field">Width (mm)<input id="labelWidth" type="number" min="20" max="210" value="80"></label>
  <label class="field">Height (mm)<input id="labelHeight" type="number" min="15" max="297" value="50"></label>
  <button class="preset" type="button" data-size="80,50">80 x 50</button>
  <button class="preset" type="button" data-size="100,70">100 x 70</button>
  <button class="preset" type="button" data-size="50,30">50 x 30</button>
  <button class="print" type="button" onclick="window.print()">Print Label</button>
  <div class="hint">Width/height apni product label ya printer ke hisaab se set karein, phir Print Label click karein.</div>
</div>
<div class="preview">
  <section class="copy">
    <div class="copy-head"><div><h1>GamingTech.pk</h1><div>Customer Repair Copy</div></div><div class="copy-job">${escapeHtml(jobNumber)}</div></div>
    <div class="copy-grid"><span class="copy-key">Customer</span><span>${escapeHtml(ticket.customer)}</span></div>
    <div class="copy-grid"><span class="copy-key">Phone</span><span>${escapeHtml(ticket.customerPhone)}</span></div>
    <div class="copy-grid"><span class="copy-key">Ticket Number</span><span><b>${escapeHtml(ticketNumber)}</b> - Device number</span></div>
    <div class="copy-grid"><span class="copy-key">Job Number</span><span><b>${escapeHtml(jobNumber)}</b> - Customer job</span></div>
    <div class="copy-grid"><span class="copy-key">Device</span><span>${escapeHtml(ticket.device)}</span></div>
    <div class="copy-grid"><span class="copy-key">Link</span><span>${escapeHtml(ticket.device)} belongs to ${escapeHtml(ticket.customer)} and work is in progress.</span></div>
    <div class="copy-grid"><span class="copy-key">Issue</span><span>${escapeHtml(ticket.issue)}</span></div>
    <div class="copy-grid"><span class="copy-key">Date</span><span>${escapeHtml(ticket.createdAt)}</span></div>
  </section>
  <main class="label" id="label">
    <div class="head"><div><div class="brand">GamingTech.pk</div><div class="tagline">DEVICE LABEL / SHOP TICKET</div></div><div><div class="ticket">${escapeHtml(ticketNumber)}</div><div class="repair">${escapeHtml(jobNumber)}</div></div></div>
    <div class="row"><span class="key">Ticket</span><span class="value">${escapeHtml(ticketNumber)}</span></div>
    <div class="row"><span class="key">Job</span><span class="value">${escapeHtml(jobNumber)}</span></div>
    <div class="row"><span class="key">Customer</span><span class="value">${escapeHtml(ticket.customer)}</span></div>
    <div class="row"><span class="key">Phone</span><span class="value">${escapeHtml(ticket.customerPhone)}</span></div>
    <div class="row"><span class="key">Device</span><span class="value">${escapeHtml(ticket.device)}</span></div>
    <div class="row"><span class="key">Brand</span><span class="value">${escapeHtml(ticket.brand)}</span></div>
    <div class="row"><span class="key">Model</span><span class="value">${escapeHtml(ticket.model)}</span></div>
    <div class="row"><span class="key">Serial No.</span><span class="value">${escapeHtml(ticket.serialNumber)}</span></div>
    <div class="row issue"><span class="key">Issue</span><span class="value">${escapeHtml(ticket.issue)}</span></div>
    <div class="footer"><span>Received: ${escapeHtml(ticket.createdAt)}</span><span>Priority: ${escapeHtml(ticket.priority).toUpperCase()}</span></div>
  </main>
</div>
<script>
  const label = document.getElementById('label');
  const widthInput = document.getElementById('labelWidth');
  const heightInput = document.getElementById('labelHeight');
  let pageStyle = document.createElement('style');
  document.head.appendChild(pageStyle);
  function applySize() {
    const width = Math.max(20, Number(widthInput.value) || 80);
    const height = Math.max(15, Number(heightInput.value) || 50);
    label.style.width = width + 'mm';
    label.style.height = height + 'mm';
    pageStyle.textContent = '@page { size: ' + width + 'mm ' + height + 'mm; margin: 0; }';
  }
  widthInput.addEventListener('input', applySize);
  heightInput.addEventListener('input', applySize);
  document.querySelectorAll('[data-size]').forEach((button) => {
    button.addEventListener('click', () => {
      const [width, height] = button.dataset.size.split(',');
      widthInput.value = width;
      heightInput.value = height;
      applySize();
    });
  });
  applySize();
<\/script>
</body></html>`);
  printWindow.document.close();
  return true;
}
