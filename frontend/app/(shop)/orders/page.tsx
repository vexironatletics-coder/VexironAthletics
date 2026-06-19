'use client';

import { useState } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { OrderList } from '@/components/orders/OrderList';
import { Pagination } from '@/components/ui/pagination';
import { ThemedSection } from '@/components/ui/themed-section';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyOrdersQuery } from '@/store/api/orderApi';
import { Package } from 'lucide-react';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyOrdersQuery({ page, limit: 10 });

  return (
    <ErrorBoundary>
      <ThemedSection
        variant="band"
        badge="Your Purchases"
        badgeIcon={Package}
        title="My Orders"
        description="View product images, payment method, and order status."
      >
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <>
            <OrderList orders={data?.orders ?? []} showViewLink />
            {data?.pagination && data.pagination.pages > 1 && (
              <Pagination pagination={data.pagination} onPageChange={setPage} />
            )}
          </>
        )}
      </ThemedSection>
    </ErrorBoundary>
  );
}
