import './globals.css';
import './redesign.css';
import './reference-overrides.css';
import AppShell from '@/components/layout/AppShell';
import { BUSINESS } from '@/utils/constants';

export const metadata = {
  title: `${BUSINESS.name} | Premium Skincare & Everyday Essentials • Botwe, Accra, Ghana`,
  description: 'Shop authentic verified skincare, radiant body care, and quality everyday grocery essentials at CR Cosmetics & Essentials. Based in Botwe, near Galaxy International School, Accra, Ghana.',
  keywords: ['CR Cosmetics and Essentials', 'CR Cosmetics Ghana', 'Skincare store Accra', 'Botwe skincare', 'Groceries Botwe', 'Online beauty shop Ghana'],
  authors: [{ name: BUSINESS.name }],
  creator: BUSINESS.name,
  publisher: BUSINESS.name,
  robots: 'index, follow',
  metadataBase: new URL('https://cr-cosmetics.vercel.app'),
  openGraph: { title: `${BUSINESS.name} | Beauty & Everyday Essentials`, description: 'Beauty products and everyday essentials in Botwe, Accra.', type: 'website', locale: 'en_GH', url: 'https://cr-cosmetics.vercel.app', siteName: BUSINESS.name, images: [{ url: '/images/hero-pedestal.jpg', width: 1200, height: 630, alt: 'CR Cosmetics & Essentials Ghana' }] },
  twitter: { card: 'summary_large_image', title: `${BUSINESS.name} | Beauty & Essentials Ghana`, images: ['/images/hero-pedestal.jpg'] },
  icons: { icon: '/favicon.ico' },
};

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'Store', name: BUSINESS.name,
  image: 'https://cr-cosmetics.vercel.app/images/hero-pedestal.jpg',
  description: 'Cosmetics, skincare and everyday essentials store based in Botwe, Accra, Ghana.',
  address: { '@type': 'PostalAddress', streetAddress: 'Near Galaxy International School', addressLocality: 'Botwe', addressRegion: 'Greater Accra', addressCountry: 'GH' },
  url: 'https://cr-cosmetics.vercel.app', telephone: '+233592153306', currenciesAccepted: 'GHS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#8D3D59" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
