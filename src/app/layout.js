import './globals.css';
import AppShell from '@/components/layout/AppShell';
import { BUSINESS } from '@/utils/constants';

export const metadata = {
  title: `${BUSINESS.name} | Premium Skincare & Everyday Essentials • Botwe, Accra, Ghana`,
  description:
    'Shop authentic verified skincare, radiant body care, and quality everyday grocery essentials at CR Cosmetics & Essentials. Based in Botwe, near Galaxy International School, Accra, Ghana. Same-day delivery & MoMo payment available.',
  keywords: [
    'CR Cosmetics and Essentials',
    'CR Cosmetics Ghana',
    'Skincare store Accra',
    'Botwe skincare',
    'Body oils Ghana',
    'Fairest Glow',
    'African Shea Butter',
    'Groceries Botwe',
    'Galaxy International School Botwe',
    'Online beauty shop Ghana',
  ],
  authors: [{ name: BUSINESS.name }],
  creator: BUSINESS.name,
  publisher: BUSINESS.name,
  robots: 'index, follow',
  metadataBase: new URL('https://crcosmetics.gh'),
  openGraph: {
    title: `${BUSINESS.name} | Radiant Skincare & Daily Essentials`,
    description:
      'Verified skincare, organic body care, and grocery essentials in Botwe, Accra. Fast delivery and flexible Mobile Money checkout.',
    type: 'website',
    locale: 'en_GH',
    url: 'https://crcosmetics.gh',
    siteName: BUSINESS.name,
    images: [
      {
        url: '/images/hero-pedestal.jpg',
        width: 1200,
        height: 630,
        alt: 'CR Cosmetics & Essentials Ghana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BUSINESS.name} | Skincare & Essentials Ghana`,
    description:
      'Verified skincare, organic body care, and grocery essentials in Botwe, Accra.',
    images: ['/images/hero-pedestal.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: BUSINESS.name,
  image: 'https://crcosmetics.gh/images/hero-pedestal.jpg',
  description:
    'Premier cosmetics, verified skincare, and daily grocery essentials store based in Botwe, Accra, Ghana.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Near Galaxy International School',
    addressLocality: 'Botwe',
    addressRegion: 'Greater Accra',
    addressCountry: 'GH',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 5.6791,
    longitude: -0.1534,
  },
  url: 'https://crcosmetics.gh',
  telephone: '+233592153306',
  priceRange: 'GHS 15 - GHS 500',
  paymentAccepted: 'Cash, Mobile Money, MTN MoMo, Telecel Cash, AT Money',
  currenciesAccepted: 'GHS',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '20:00',
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#6B1733" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
