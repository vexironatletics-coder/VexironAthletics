'use client';

import { use, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Pagination } from '@/components/ui/pagination';
import { ThemedSection } from '@/components/ui/themed-section';
import { useGetProductsQuery } from '@/store/api/productApi';

const PAGE_SIZE = 12;

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const category = slug as 'men' | 'women' | 'children';
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetProductsQuery({
    category,
    limit: PAGE_SIZE,
    page,
  });

  return (
    <ErrorBoundary>
      <ThemedSection
        variant="band"
        badge="Collection"
        badgeIcon={Sparkles}
        title={`${slug.charAt(0).toUpperCase() + slug.slice(1)}'s Collection`}
        description={`Browse our latest ${slug}'s athletic wear — performance-ready styles for every day.`}
      >
        <ProductGrid products={data?.products ?? []} loading={isLoading} />
        {data?.pagination && data.pagination.pages > 1 && (
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        )}
      </ThemedSection>
    </ErrorBoundary>
  );
}
