import { BUSINESS } from '@/utils/constants';

export default function manifest() {
  return {
    name: `${BUSINESS.name} — Skincare & Essentials`,
    short_name: 'CR Cosmetics',
    description: 'Premier cosmetics, verified skincare, and everyday groceries in Botwe, Accra, Ghana.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F6',
    theme_color: '#6B1733',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
