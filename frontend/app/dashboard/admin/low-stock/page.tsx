'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  AdminProductsTable,
  toggleSortValue,
  type SortField,
} from '@/components/admin/AdminProductsTable';
import { useGetProductsQuery, useDeleteProductMutation } from '@/store/api/productApi';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import type { Product } from '@/lib/types';

const ProductForm = dynamic(
  () => import('@/components/admin/ProductForm').then((m) => m.ProductForm),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
    ssr: false,
  }
);

export default function AdminLowStockPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('stock-asc');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useGetProductsQuery({
    search,
    limit: 12,
    page,
    sort,
    maxStock: LOW_STOCK_THRESHOLD,
  });
  const [deleteProduct] = useDeleteProductMutation();

  const handleSort = (field: SortField) => {
    setSort((prev) => toggleSortValue(prev, field));
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id).unwrap();
      toast.success(`"${deleteTarget.name}" has been removed`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <AlertTriangle className="h-6 w-6 text-amber-500" aria-hidden />
                Low Stock Products
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Products with {LOW_STOCK_THRESHOLD} or fewer units in stock
              </p>
            </div>
            <Link href="/dashboard/admin/products">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>

          {editingProduct && (
            <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <h2 className="mb-3 text-lg font-semibold">Edit Product</h2>
              <ProductForm
                product={editingProduct}
                onSuccess={() => setEditingProduct(null)}
                onCancel={() => setEditingProduct(null)}
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Input
              className="max-w-sm"
              placeholder="Search low stock products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {!isLoading && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {data?.pagination.total ?? 0} product{(data?.pagination.total ?? 0) === 1 ? '' : 's'} need attention
              </span>
            )}
          </div>

          {isLoading ? (
            <p className="mt-4">Loading...</p>
          ) : data?.products.length === 0 ? (
            <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
              <p className="text-[var(--muted)]">No low stock products right now.</p>
              <Link href="/dashboard/admin/products" className="mt-2 inline-block text-sm font-medium hover:underline">
                Back to all products
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <AdminProductsTable
                products={data?.products ?? []}
                sort={sort}
                onSort={handleSort}
                onEdit={(product) => {
                  setEditingProduct(product);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={(product) =>
                  setDeleteTarget({ id: product._id, name: product.name })
                }
                highlightLowStock
              />
            </div>
          )}

          {data?.pagination && data.pagination.pages > 1 && (
            <Pagination pagination={data.pagination} onPageChange={setPage} scrollToTop={false} />
          )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete product?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This product will be deactivated and hidden from the store.`
            : ''
        }
        confirmLabel="Yes, delete"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </ErrorBoundary>
  );
}
