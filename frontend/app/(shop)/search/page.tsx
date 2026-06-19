'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Pagination } from '@/components/ui/pagination';
import { ThemedBadge, ThemedSection } from '@/components/ui/themed-section';
import { useAdvancedSearchQuery } from '@/store/api/searchApi';
import type { Product } from '@/lib/types';

const PAGE_SIZE = 12;

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const isVisual = searchParams.get('visual') === '1';
  const [visualProducts, setVisualProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isVisual) {
      const stored = sessionStorage.getItem('visualSearchResults');
      if (stored) setVisualProducts(JSON.parse(stored) as Product[]);
    }
  }, [isVisual]);

  const { data, isLoading } = useAdvancedSearchQuery(
    { q: query, limit: PAGE_SIZE, page },
    { skip: !query || isVisual }
  );

  const products = isVisual ? visualProducts : (data?.products ?? []);
  const loading = !isVisual && isLoading;

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));
    router.push(`/search?${params.toString()}`);
  };

  return (
    <ErrorBoundary>
      <ThemedSection
        variant="soft"
        badge="Search"
        badgeIcon={SearchIcon}
        title={
          isVisual
            ? 'Visual Search Results'
            : query
              ? `Results for "${query}"`
              : 'Search Products'
        }
        description={
          isVisual
            ? 'Products matched from your uploaded image.'
            : 'Find exactly what you need across our full catalog.'
        }
      >
        {data?.engine && !isVisual && (
          <ThemedBadge className="mb-6">
            {data.engine === 'meilisearch' ? 'MeiliSearch' : 'Smart search'}
          </ThemedBadge>
        )}

        {data?.facets?.category && !isVisual && (
          <div className="mb-6 flex flex-wrap gap-2">
            {Object.entries(data.facets.category).map(([cat, count]) => (
              <ThemedBadge key={cat} className="capitalize">
                {cat} ({count as number})
              </ThemedBadge>
            ))}
          </div>
        )}

        <ProductGrid products={products} loading={loading} />

        {!isVisual && data?.pagination && data.pagination.pages > 1 && (
          <Pagination pagination={data.pagination} onPageChange={goToPage} />
        )}
      </ThemedSection>
    </ErrorBoundary>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
