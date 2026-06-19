import { APP_NAME } from './constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const getSiteUrl = () => SITE_URL;

export const productJsonLd = (product: {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: { url: string }[];
  ratings: number;
  numReviews: number;
  category: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.images.map((i) => i.url),
  sku: product._id,
  brand: { '@type': 'Brand', name: APP_NAME },
  category: product.category,
  offers: {
    '@type': 'Offer',
    url: `${SITE_URL}/products/${product._id}`,
    priceCurrency: 'PKR',
    price: product.discountPrice ?? product.price,
    availability: 'https://schema.org/InStock',
  },
  aggregateRating:
    product.numReviews > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.ratings,
          reviewCount: product.numReviews,
        }
      : undefined,
});

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: APP_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
});

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: APP_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});
