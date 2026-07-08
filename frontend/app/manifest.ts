import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VexironAthletics',
    short_name: 'VexironAthletics',
    description: 'Premium athletic clothing for men, women, and children',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#18181b',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    categories: ['shopping', 'fashion', 'lifestyle'],
    lang: 'en-PK',
    dir: 'ltr',
  };
}
