export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

export function toWhatsAppUrl(phone: string): string {
  const digits = normalizePhone(phone);
  const withCountryCode = digits.startsWith('55') ? digits : `55${digits}`;

  return `https://wa.me/${withCountryCode}`;
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return digits.length >= 10 && digits.length <= 13;
}
