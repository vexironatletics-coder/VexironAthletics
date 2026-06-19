'use client';

import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useGetMyOrdersQuery } from '@/store/api/orderApi';
import type { RootState } from '@/store';

export default function UserDashboardPage() {
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);
  const { data } = useGetMyOrdersQuery();

  const orders = data?.orders ?? [];
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    wishlist: wishlistCount,
  };

  return (
    <ErrorBoundary>
      
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Orders', value: stats.total },
              { label: 'Pending', value: stats.pending },
              { label: 'Delivered', value: stats.delivered },
              { label: 'Wishlist Items', value: stats.wishlist },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
    </ErrorBoundary>
  );
}
