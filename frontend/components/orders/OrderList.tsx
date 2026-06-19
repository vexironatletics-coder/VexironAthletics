'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, Package } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatPrice } from '@/lib/utils';
import type { OrderStatus } from '@/lib/utils';
import type { Order } from '@/lib/types';

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  card: 'Credit / Debit Card',
  online: 'Online Payment',
};

export function formatPaymentMethod(method: string): string {
  return PAYMENT_LABELS[method] ?? method.replace(/_/g, ' ').toUpperCase();
}

interface OrderListProps {
  orders: Order[];
  showViewLink?: boolean;
}

export function OrderList({ orders, showViewLink = false }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--accent)]/30 bg-[var(--accent)]/5 py-16">
        <Package className="mb-3 h-10 w-10 text-[var(--accent)]" />
        <p className="text-zinc-500">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {orders.map((order) => {
        const previewItems = order.items.slice(0, 3);
        const extraCount = order.items.length - previewItems.length;

        return (
          <article
            key={order._id}
            className="theme-border-accent overflow-hidden rounded-xl border bg-[var(--card)] shadow-sm transition hover:theme-accent-glow"
          >
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 flex-1 gap-4">
                <div className="flex shrink-0 items-center -space-x-2">
                  {previewItems.map((item, index) => (
                    <div
                      key={`${order._id}-${item.product}-${index}`}
                      className="relative h-14 w-14 overflow-hidden rounded-lg border-2 border-[var(--card)] bg-zinc-100 dark:bg-zinc-900"
                      style={{ zIndex: previewItems.length - index }}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                          No img
                        </span>
                      )}
                    </div>
                  ))}
                  {extraCount > 0 && (
                    <div className="relative z-0 flex h-14 w-14 items-center justify-center rounded-lg border-2 border-[var(--card)] bg-zinc-200 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      +{extraCount}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-xs text-zinc-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <StatusBadge status={order.status as OrderStatus} />
                  </div>
                  <p className="mt-1 truncate font-medium">
                    {order.items.map((i) => i.name).join(', ')}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full theme-gradient px-3 py-1 text-xs font-medium text-white shadow-sm">
                  <CreditCard className="h-3.5 w-3.5" />
                  {formatPaymentMethod(order.paymentMethod)}
                </div>
                <p className="text-lg font-bold">{formatPrice(order.total)}</p>
                {showViewLink && (
                  <Link
                    href={`/dashboard/user/orders?orderId=${order._id}`}
                    className="text-sm font-medium text-[var(--accent)] hover:underline"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
