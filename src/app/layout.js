import './globals.css';
import AppShell from '@/components/layout/AppShell';
import { BUSINESS } from '@/utils/constants';

export const metadata = {
  title: `${BUSINESS.name} | Skincare & Groceries Store in Botwe, Ghana`,
  description:
    'Shop premium skincare products and everyday grocery essentials at CR Cosmetics & Essentials. Located in Botwe, near Galaxy International School, Accra, Ghana.',
  keywords: [
    'CR Cosmetics',
    'CR Essentials',
    'skincare Ghana',
    'groceries Botwe',
    'beauty store Accra',
    'daily essentials Ghana',
    'Galaxy International School Botwe',
  ],
  openGraph: {
    title: `${BUSINESS.name} | Skincare & Groceries`,
    description:
      'Premium skincare and quality everyday groceries in Botwe, Ghana.',
    type: 'website',
    locale: 'en_GH',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
