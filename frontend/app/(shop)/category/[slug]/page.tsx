'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Pagination } from '@/components/ui/pagination';
import { ThemedSection } from '@/components/ui/themed-section';
import { useGetProductsQuery } from '@/store/api/productApi';
import { getCategoryPageMeta, isShopCategorySlug } from '@/lib/categories';

const PAGE_SIZE = 12;

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [page, setPage] = useState(1);
  const validSlug = isShopCategorySlug(slug);

  const { data, isLoading, isError } = useGetProductsQuery(
    validSlug
      ? { category: slug, limit: PAGE_SIZE, page }
      : { category: '__invalid__', limit: PAGE_SIZE, page },
    { skip: !validSlug }
  );

  if (!validSlug) {
    notFound();
  }

  const { title, description } = getCategoryPageMeta(slug);

  return (
    <ErrorBoundary>
      <ThemedSection
        variant="band"
        badge="Collection"
        badgeIcon={Sparkles}
        title={title}
        description={description}
      >
        <ProductGrid products={data?.products ?? []} loading={isLoading} error={isError} />
        {data?.pagination && data.pagination.pages > 1 && (
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        )}
      </ThemedSection>
    </ErrorBoundary>
  );
}
