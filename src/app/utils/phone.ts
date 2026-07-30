export const CUSTOMER_PHONE_MESSAGE = "Phone number must be 11 digits or start with +92 followed by 10 digits.";

export const sanitizeCustomerPhone = (value: string) => {
  if (!value) return "";

  const trimmed = value.replace(/\s+/g, "");
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  return hasPlus ? `+${digits}` : digits;
};

export const normalizeCustomerPhone = (value: string) => value.replace(/\D/g, "");

export const isValidCustomerPhone = (value: string) => {
  const sanitized = sanitizeCustomerPhone(value);
  return /^0\d{10}$/.test(sanitized) || /^\+92\d{10}$/.test(sanitized);
};
