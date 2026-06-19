'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAnalyticsQuery } from '@/store/api/orderApi';
import { formatPrice } from '@/lib/utils';
import type { OrderStatus } from '@/lib/utils';
import { isLowStock } from '@/lib/constants';

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAnalyticsQuery();

  return (
    <ErrorBoundary>
          <h1 className="text-2xl font-bold">Admin Overview</h1>
          {isLoading ? (
            <Skeleton className="mt-6 h-48 w-full" />
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: 'Revenue', value: formatPrice(data?.revenue ?? 0) },
                  { label: 'Orders', value: data?.orders ?? 0 },
                  { label: 'Products', value: data?.products ?? 0 },
                  { label: 'Users', value: data?.users ?? 0 },
                  {
                    label: 'Low Stock',
                    value: data?.lowStockCount ?? 0,
                    alert: (data?.lowStockCount ?? 0) > 0,
                  },
                ].map((stat) => (
                  <Card key={stat.label} className={stat.alert ? 'border-amber-300 dark:border-amber-800' : undefined}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                        {stat.alert && <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />}
                        {stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold ${stat.alert ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                        {stat.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(data?.lowStockCount ?? 0) > 0 && (
                <Card className="mt-8 border-amber-300 dark:border-amber-800">
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
                      Low Stock Products
                    </CardTitle>
                    <Link
                      href="/dashboard/admin/low-stock"
                      className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
                    >
                      View all low stock
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Product</th>
                            <th className="py-2 text-left">Category</th>
                            <th className="py-2 text-left">Stock</th>
                            <th className="py-2 text-left">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.lowStockProducts.map((product) => (
                            <tr key={product._id} className="border-b border-zinc-100 dark:border-zinc-800">
                              <td className="py-2">{product.name}</td>
                              <td className="py-2 capitalize">{product.category}</td>
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  <span>{product.stock}</span>
                                  {isLowStock(product.stock) && (
                                    <Badge variant={product.stock === 0 ? 'red' : 'amber'} className="gap-1">
                                      <AlertTriangle className="h-3 w-3" aria-hidden />
                                      {product.stock === 0 ? 'Out of stock' : 'Low stock'}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="py-2">{formatPrice(product.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="mt-8">
                <CardHeader><CardTitle>7-Day Sales</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex h-32 items-end gap-2">
                    {data?.dailySales.map((day) => (
                      <div key={day._id} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-zinc-900 dark:bg-zinc-50"
                          style={{
                            height: `${Math.max(10, (day.sales / (data.revenue || 1)) * 100)}%`,
                          }}
                        />
                        <span className="text-[10px] text-zinc-500">{day._id.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-8">
                <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">ID</th>
                          <th className="py-2 text-left">Date</th>
                          <th className="py-2 text-left">Status</th>
                          <th className="py-2 text-left">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.recentOrders.map((order) => (
                          <tr key={order._id} className="border-b border-zinc-100 dark:border-zinc-800">
                            <td className="py-2 font-mono text-xs">{order._id.slice(-8)}</td>
                            <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="py-2">
                              <StatusBadge status={order.status as OrderStatus} />
                            </td>
                            <td className="py-2">{formatPrice(order.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
    </ErrorBoundary>
  );
}
