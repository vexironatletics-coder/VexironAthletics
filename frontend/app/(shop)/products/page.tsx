import { Suspense } from 'react';
import ProductsPageContent from './ProductsPageContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="mb-8 h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
