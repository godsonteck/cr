export const normalizeWhatsAppNumber = (value: string | undefined): string => {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return '233592153306';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `233${digits.slice(1)}`;
  return digits;
};

export const getWhatsAppUrl = (number: string | undefined, message?: string): string => {
  const baseUrl = `https://wa.me/${normalizeWhatsAppNumber(number)}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
};
