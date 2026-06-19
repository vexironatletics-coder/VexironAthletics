'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ThemedSection } from '@/components/ui/themed-section';
import { useGetProductsQuery } from '@/store/api/productApi';

export function TrendingNowSection() {
  const { data, isLoading } = useGetProductsQuery({ limit: 4, sort: 'rating', minRating: 1 });

  return (
    <ThemedSection
      variant="band"
      badge="Trending"
      badgeIcon={TrendingUp}
      title="Trending Now"
      description="Top-rated picks loved by our community — performance gear that delivers."
      action={
        <Link
          href="/products?sort=rating"
          className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition hover:gap-2 hover:underline"
        >
          View trending <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <ProductGrid products={data?.products ?? []} loading={isLoading} />
    </ThemedSection>
  );
}
