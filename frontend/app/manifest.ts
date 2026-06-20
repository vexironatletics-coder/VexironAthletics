import type { MetadataRoute } from 'next';
import { APP_NAME } from '@/lib/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: 'Premium athletic clothing for men, women, and children',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#18181b',
    scope: '/',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    categories: ['shopping', 'fashion', 'lifestyle'],
    lang: 'en-PK',
    dir: 'ltr',
  };
}
