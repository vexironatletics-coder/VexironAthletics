'use client';

import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: boolean;
  view?: 'grid' | 'list';
}

export function ProductGrid({ products, loading, error, view = 'grid' }: ProductGridProps) {
  if (loading) {
    return (
      <div className={view === 'grid' ? 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4' : 'space-y-4'}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={view === 'grid' ? 'aspect-[3/4] w-full' : 'h-32 w-full'} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-zinc-500">
        {error
          ? 'Could not load products. Check that the API is running and NEXT_PUBLIC_API_URL is set correctly.'
          : 'No products found. Try adjusting your filters.'}
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} view="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
