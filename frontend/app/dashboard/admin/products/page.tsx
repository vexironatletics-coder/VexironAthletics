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
import { useGetAnalyticsQuery } from '@/store/api/orderApi';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

const ProductForm = dynamic(
  () => import('@/components/admin/ProductForm').then((m) => m.ProductForm),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
    ssr: false,
  }
);

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isFetching } = useGetProductsQuery({ search, limit: 12, page, sort });
  const { data: analytics } = useGetAnalyticsQuery();
  const { data: lowStockPreview } = useGetProductsQuery(
    { maxStock: LOW_STOCK_THRESHOLD, limit: 5, sort: 'stock-asc', page: 1 },
    { skip: (analytics?.lowStockCount ?? 0) === 0 }
  );
  const [deleteProduct] = useDeleteProductMutation();

  const lowStockCount = analytics?.lowStockCount ?? lowStockPreview?.pagination.total ?? 0;

  const handleSort = (field: SortField) => {
    setSort((prev) => toggleSortValue(prev, field));
    setPage(1);
  };

  const handleEdit = (product: Product) => {
    setShowForm(false);
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? 'Hide Form' : 'Add Product'}
        </Button>
      </div>

      {showForm && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">New Product</h2>
          <ProductForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingProduct && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Edit Product</h2>
          <p className="mb-3 text-sm text-zinc-500">Editing: {editingProduct.name}</p>
          <ProductForm
            product={editingProduct}
            onSuccess={() => setEditingProduct(null)}
            onCancel={() => setEditingProduct(null)}
          />
        </div>
      )}

      {lowStockCount > 0 && lowStockPreview?.products && (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
                Low Stock Alert
              </h2>
              <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-300/80">
                {lowStockCount} product{lowStockCount === 1 ? '' : 's'} at or below{' '}
                {LOW_STOCK_THRESHOLD} units
              </p>
            </div>
            <Link href="/dashboard/admin/low-stock">
              <Button
                size="sm"
                variant="outline"
                className="border-amber-400 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
              >
                View all low stock
              </Button>
            </Link>
          </div>
          <AdminProductsTable
            products={lowStockPreview.products}
            sort="stock-asc"
            onSort={() => {}}
            onEdit={handleEdit}
            onDelete={(product) =>
              setDeleteTarget({ id: product._id, name: product.name })
            }
            highlightLowStock
            sortable={false}
          />
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">All Products</h2>
        <Input
          className="max-w-sm"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <Skeleton className="mt-4 h-64 w-full rounded-xl" />
      ) : (
        <div className={cn('mt-4 transition-opacity', isFetching && 'opacity-70')}>
          <AdminProductsTable
            products={data?.products ?? []}
            sort={sort}
            onSort={handleSort}
            onEdit={handleEdit}
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
