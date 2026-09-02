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

const defaultTitle = 'CR Cosmetics & Essential | Beauty · Care · Essentials';
const defaultDescription = 'CR Cosmetics & Essential: Authentic skincare, makeup, designer fragrances, and everyday essentials.';
const defaultImage = '/assets/logo.jpeg';

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

  const pageTitle = title || storeSettings.heroHeadline || defaultTitle;
  const pageDescription = description || storeSettings.heroSubtitle || defaultDescription;
  const pageImage = image || productImage || storeSettings.storeLogo || defaultImage;
  const pageUrl = url || `${window.location.origin}${location.pathname}`;

  const structuredData = productName && productPrice ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: productDescription,
    image: productImage ? [productImage] : undefined,
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
  } : {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: storeSettings.storeName,
    url: window.location.origin,
  };

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="theme-color" content="#8A3D52" />
      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content={storeSettings.storeName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

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