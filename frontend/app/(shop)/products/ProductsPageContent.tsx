'use client';

import { useCallback, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid3X3, List, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilter } from '@/components/product/ProductFilter';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ThemedSection } from '@/components/ui/themed-section';
import { useGetProductsQuery } from '@/store/api/productApi';
import { Pagination } from '@/components/ui/pagination';
import { debounce } from '@/lib/utils';
import type { ProductFilters } from '@/lib/types';

export default function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  const filters: ProductFilters = {
    category: searchParams.get('category') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    size: searchParams.get('size') ?? undefined,
    color: searchParams.get('color') ?? undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    sort: searchParams.get('sort') ?? 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 12,
    search: searchParams.get('search') ?? undefined,
  };

  const { data, isLoading, isFetching, isError } = useGetProductsQuery(filters);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!updates.page && updates.page !== '1') params.delete('page');
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateParams({ search: value || undefined });
    }, 400),
    [updateParams]
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSearch(value);
  };

  const goToPage = (page: number) => {
    updateParams({ page: String(page) });
  };

  return (
    <ErrorBoundary>
      <ThemedSection
        variant="band"
        badge="Shop All"
        badgeIcon={Sparkles}
        title="All Products"
        description="Browse our full collection — filter by category, size, color, and price."
        childrenClassName="mt-8"
      >
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-64">
            <ProductFilter filters={filters} onFilterChange={updateParams} />
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <Input
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search products..."
                  className="theme-border-accent pl-9"
                />
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={filters.sort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="theme-border-accent rounded-md border bg-[var(--card)] px-3 py-2 text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
                <span className="text-sm text-[var(--muted)]">
                  {data?.pagination.total ?? 0} results
                </span>
                <div className="flex gap-1">
                  <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}>
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ProductGrid products={data?.products ?? []} loading={isLoading || isFetching} error={isError} view={view} />

            {data?.pagination && data.pagination.pages > 1 && (
              <Pagination pagination={data.pagination} onPageChange={goToPage} />
            )}
          </div>
        </div>
      </ThemedSection>
    </ErrorBoundary>
  );
}
