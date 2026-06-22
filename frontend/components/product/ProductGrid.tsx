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
      <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'space-y-4'}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className={view === 'grid' ? 'aspect-[4/3] w-full rounded-lg' : 'h-32 w-full'} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-zinc-500">
        {error
          ? 'Could not load products. The database may be offline — open /api/health to check connection.'
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
