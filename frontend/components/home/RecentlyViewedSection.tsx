'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ThemedSection } from '@/components/ui/themed-section';
import { useGetProductsQuery } from '@/store/api/productApi';
import { getRecentlyViewedIds } from '@/lib/recentlyViewed';
import { Skeleton } from '@/components/ui/skeleton';

export function RecentlyViewedSection() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getRecentlyViewedIds());
  }, []);

  const { data, isLoading } = useGetProductsQuery(
    { ids: ids.join(','), limit: ids.length || 1 },
    { skip: ids.length === 0 }
  );

  if (ids.length === 0) return null;

  const products =
    data?.products
      ?.filter((p) => ids.includes(p._id))
      .sort((a, b) => ids.indexOf(a._id) - ids.indexOf(b._id)) ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <ThemedSection
      variant="default"
      badge="For you"
      badgeIcon={Clock}
      title="Recently Viewed"
      description="Pick up where you left off."
      action={
        <Link
          href="/products"
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          View all
        </Link>
      }
    >
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ids.slice(0, 4).map((id) => (
            <Skeleton key={id} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </ThemedSection>
  );
}
