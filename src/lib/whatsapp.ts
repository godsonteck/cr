export const normalizeWhatsAppNumber = (value: unknown): string => {
  const rawValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  const digits = rawValue.replace(/\D/g, '');
  if (!digits) return '233592153306';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `233${digits.slice(1)}`;
  return digits;
};

export const getWhatsAppUrl = (number: unknown, message?: string): string => {
  const baseUrl = `https://wa.me/${normalizeWhatsAppNumber(number)}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
};
