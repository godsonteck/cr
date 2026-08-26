export const BUSINESS = {
  name: 'CR Cosmetics & Essentials',
  shortName: 'CR',
  tagline: 'Beauty • Care • Essentials',
  phone: '+233 59 215 3306',
  displayPhone: '059 215 3306',
  rawPhone: '0592153306',
  intlPhone: '+233592153306',
  whatsappNumber: '233592153306',
  whatsappUrl: 'https://wa.me/233592153306',
  email: 'crcosmetics.essential@gmail.com',
  location: 'Botwe, near Galaxy International School, Accra, Ghana',
  city: 'Accra',
  country: 'Ghana',
  currency: 'GHS',
  currencySymbol: '₵',
};

// Order statuses
export const ORDER_STATUS = {
  placed: { label: 'Order Placed', color: 'var(--color-info)' },
  confirmed: { label: 'Confirmed', color: 'var(--color-info)' },
  processing: { label: 'Processing', color: 'var(--color-warning)' },
  dispatched: { label: 'Dispatched', color: 'var(--color-primary)' },
  delivered: { label: 'Delivered', color: 'var(--color-success)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-error)' },
};

// Sort options
export const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

// Breakpoints (match CSS)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};
