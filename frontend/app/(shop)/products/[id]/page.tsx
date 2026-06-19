import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';
import { productJsonLd, getSiteUrl } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { ProductDetailClient } from './ProductDetailClient';

export const revalidate = 3600;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getProduct(id);
  const product = data?.product;

  if (!product) {
    return { title: `Product — ${APP_NAME}` };
  }

  const price = product.discountPrice ?? product.price;
  const image = product.images?.[0]?.url;

  return {
    title: `${product.name} — ${APP_NAME}`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      type: 'website',
      url: `${getSiteUrl()}/products/${id}`,
      images: image ? [{ url: image, width: 600, height: 800, alt: product.name }] : [],
      siteName: APP_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.slice(0, 160),
      images: image ? [image] : [],
    },
    alternates: { canonical: `${getSiteUrl()}/products/${id}` },
    other: { 'product:price:amount': String(price), 'product:price:currency': 'PKR' },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProduct(id);

  return (
    <>
      {data?.product && <JsonLd data={productJsonLd(data.product)} />}
      <ProductDetailClient id={id} />
    </>
  );
}
