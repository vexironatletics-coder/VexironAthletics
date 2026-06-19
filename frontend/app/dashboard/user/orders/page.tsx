'use client';

import { useState } from 'react';
import { OrderList } from '@/components/orders/OrderList';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Pagination } from '@/components/ui/pagination';
import { ThemedSection } from '@/components/ui/themed-section';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyOrdersQuery } from '@/store/api/orderApi';
import { Package } from 'lucide-react';

export default function UserOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyOrdersQuery({ page, limit: 10 });

  return (
    <ErrorBoundary>
      
          <ThemedSection
            embedded
            variant="soft"
            badge="Order History"
            badgeIcon={Package}
            title="My Orders"
            description="Track your purchases, payment method, and delivery status."
            childrenClassName="mt-6"
          >
            {isLoading ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : (
              <>
                <OrderList orders={data?.orders ?? []} />
                {data?.pagination && data.pagination.pages > 1 && (
                  <Pagination pagination={data.pagination} onPageChange={setPage} />
                )}
              </>
            )}
          </ThemedSection>
    </ErrorBoundary>
  );
}
