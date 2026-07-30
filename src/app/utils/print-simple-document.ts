const safe = (value: string | number | undefined) =>
  String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

type SimplePrintOptions = {
  title?: string;
  primaryLabel?: string;
  primaryValue: string;
  customerName: string;
};

export function printSimpleDocument({ title = "Repair Invoice", primaryLabel = "Device Number", primaryValue, customerName }: SimplePrintOptions) {
  const originalTitle = document.title;
  const originalBody = document.body.innerHTML;
  let restored = false;

  const restorePage = () => {
    if (restored) return;
    restored = true;
    document.title = originalTitle;
    document.body.innerHTML = originalBody;
    window.location.reload();
  };

  document.title = `${primaryValue} ${title}`;
  document.body.innerHTML = `
    <main style="font-family: Arial, sans-serif; color: #111827; padding: 32px; max-width: 520px; margin: 0 auto;">
      <h1 style="font-size: 28px; margin: 0 0 20px;">${safe(title)}</h1>
      <div style="border: 2px solid #111827; border-radius: 8px; padding: 20px;">
        <p style="font-size: 16px; margin: 0 0 12px;">${safe(primaryLabel)}</p>
        <p style="font-size: 26px; font-weight: 700; margin: 0 0 24px;">${safe(primaryValue)}</p>
        <p style="font-size: 16px; margin: 0 0 12px;">Customer Name</p>
        <p style="font-size: 24px; font-weight: 700; margin: 0;">${safe(customerName || "Customer")}</p>
      </div>
    </main>
  `;

  window.addEventListener("afterprint", restorePage, { once: true });
  window.print();
  window.setTimeout(restorePage, 1000);
  return true;
}
