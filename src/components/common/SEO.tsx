import React from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  productName?: string;
  productPrice?: number;
  productCurrency?: string;
  productAvailability?: string;
  productImage?: string;
  productDescription?: string;
}

const defaultTitle = 'CR Mart | Beauty · Care · Essentials';
const defaultDescription = 'CR Mart: Authentic skincare, makeup, designer fragrances, and everyday essentials.';
const defaultImage = '/logo.jpeg';

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': { title: 'CR Mart | Beauty and everyday care', description: 'Shop curated skincare, beauty products, fragrances, and everyday essentials from CR Mart.' },
  '/shop': { title: 'Shop all products | CR Mart', description: 'Browse beauty, personal care, household, and everyday essentials available from CR Mart.' },
  '/beauty': { title: 'Beauty collection | CR Mart', description: 'Explore skincare, makeup, fragrances, and beauty tools selected for your everyday routine.' },
  '/groceries': { title: 'Groceries and essentials | CR Mart', description: 'Shop practical groceries, household care, snacks, beverages, and daily essentials.' },
  '/about': { title: 'About CR Mart', description: 'Learn about CR Mart and the products we bring together for everyday routines.' },
  '/support': { title: 'Customer support | CR Mart', description: 'Get help with delivery, payments, returns, product questions, and order updates.' },
  '/contact': { title: 'Contact us | CR Mart', description: 'Contact the CR Mart team by phone, email, or WhatsApp.' },
  '/signin': { title: 'Sign in | CR Mart', description: 'Sign in to manage your orders, saved items, and delivery details.' },
  '/signup': { title: 'Create an account | CR Mart', description: 'Create your CR Mart account for faster checkout and order tracking.' },
  '/account': { title: 'My account | CR Mart', description: 'Manage your CR Mart profile, orders, saved items, addresses, and preferences.' },
  '/cart': { title: 'Your cart | CR Mart', description: 'Review your selected products before checkout.' },
  '/checkout': { title: 'Checkout | CR Mart', description: 'Complete your delivery details and payment securely.' },
  '/routine-builder': { title: 'Routine builder | CR Mart', description: 'Build a personalized beauty routine from products selected for each step.' },
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  productName,
  productPrice,
  productCurrency = 'GHS',
  productAvailability = 'InStock',
  productImage,
  productDescription,
}) => {
  const location = useLocation();
  const { storeSettings } = useStore();

  const routeMeta = pageMeta[location.pathname] || (location.pathname.startsWith('/product/')
    ? { title: 'Product details | CR Mart', description: 'View product details, options, price, availability, and delivery information.' }
    : location.pathname.startsWith('/category/')
      ? { title: 'Category collection | CR Mart', description: 'Browse products in this CR Mart collection.' }
      : { title: defaultTitle, description: defaultDescription });
  const pageTitle = title || routeMeta.title;
  const pageDescription = description || routeMeta.description;
  const pageImage = image || productImage || storeSettings.storeLogo || defaultImage;
  const absoluteImage = pageImage.startsWith('http')
    ? pageImage
    : pageImage.startsWith('data:')
      ? `${window.location.origin}${defaultImage}`
      : `${window.location.origin}${pageImage.startsWith('/') ? '' : '/'}${pageImage}`;
  const pageUrl = url || `${window.location.origin}${location.pathname}`;
  const isPrivatePage = ['/account', '/cart', '/checkout', '/signin', '/signup'].some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));

  const breadcrumbItems = [
    { name: 'Home', url: `${window.location.origin}/` },
    ...(location.pathname !== '/' ? [{ name: pageTitle.split('|')[0].trim(), url: pageUrl }] : []),
  ];
  const structuredData = productName && productPrice ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: productDescription,
    image: productImage && !productImage.startsWith('data:') ? [productImage.startsWith('http') ? productImage : `${window.location.origin}${productImage.startsWith('/') ? '' : '/'}${productImage}`] : undefined,
    offers: {
      '@type': 'Offer',
      price: productPrice,
      priceCurrency: productCurrency,
      availability: `https://schema.org/${productAvailability}`,
      seller: {
        '@type': 'Organization',
        name: storeSettings.storeName,
      },
    },
  } : [
    { '@context': 'https://schema.org', '@type': 'Organization', name: storeSettings.storeName, url: window.location.origin, logo: absoluteImage, areaServed: 'Ghana' },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: storeSettings.storeName, url: window.location.origin, potentialAction: { '@type': 'SearchAction', target: `${window.location.origin}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.url })) },
  ];

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="robots" content={isPrivatePage ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="theme-color" content="#8A3D52" />
      <link rel="canonical" href={pageUrl} />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      <meta property="og:locale" content="en_GH" />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:alt" content={pageTitle} />
      <meta property="og:site_name" content={storeSettings.storeName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:image:alt" content={pageTitle} />

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
};

export const useSEO = (props: SEOProps) => {
  const location = useLocation();
  const { storeSettings } = useStore();

  return {
    title: props.title || storeSettings.heroHeadline || defaultTitle,
    description: props.description || storeSettings.heroSubtitle || defaultDescription,
    image: props.image || props.productImage || storeSettings.storeLogo || defaultImage,
    url: props.url || `${window.location.origin}${location.pathname}`,
  };
};