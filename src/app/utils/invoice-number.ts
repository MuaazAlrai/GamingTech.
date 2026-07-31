const normalizeInvoiceNumber = (value: string | undefined) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  if (trimmed.toUpperCase().startsWith("TKT-")) {
    return `INV-${trimmed.slice(4)}`;
  }

  return trimmed;
};

export const displayInvoiceNumber = (...values: Array<string | undefined>) => {
  const raw = values.find((value) => String(value ?? "").trim());
  return normalizeInvoiceNumber(raw);
};
