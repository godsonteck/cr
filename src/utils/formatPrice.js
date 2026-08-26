// Format price in Ghana Cedis matching reference design (GHS 120.00)
export function formatPrice(amount) {
  if (amount === null || amount === undefined) return '';
  return `GHS ${amount.toFixed(2)}`;
}

// Format price with currency code
export function formatPriceWithCode(amount) {
  if (amount === null || amount === undefined) return '';
  return `GHS ${amount.toFixed(2)}`;
}

// Calculate discount percentage
export function getDiscountPercent(originalPrice, salePrice) {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}
