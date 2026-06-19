'use client';

import Image from 'next/image';
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';
import { isLowStock } from '@/lib/constants';
import type { Product } from '@/lib/types';

export type SortField = 'name' | 'category' | 'price' | 'stock';

export function toggleSortValue(current: string, field: SortField): string {
  const asc = `${field}-asc`;
  const desc = `${field}-desc`;
  if (current === asc) return desc;
  return asc;
}

function SortableHeader({
  label,
  field,
  sort,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  sort: string;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = sort === `${field}-asc` || sort === `${field}-desc`;
  const ascending = sort === `${field}-asc`;

  return (
    <th className={cn('px-4 py-3 text-left', className)}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 font-medium transition-colors',
          'hover:text-zinc-900 dark:hover:text-zinc-50',
          isActive && 'text-zinc-900 dark:text-zinc-50'
        )}
        aria-sort={isActive ? (ascending ? 'ascending' : 'descending') : 'none'}
      >
        {label}
        {isActive ? (
          ascending ? (
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden />
        )}
      </button>
    </th>
  );
}

interface AdminProductsTableProps {
  products: Product[];
  sort: string;
  onSort: (field: SortField) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  highlightLowStock?: boolean;
  showActions?: boolean;
  sortable?: boolean;
}

export function AdminProductsTable({
  products,
  sort,
  onSort,
  onEdit,
  onDelete,
  highlightLowStock = true,
  showActions = true,
  sortable = true,
}: AdminProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-3 text-left">Image</th>
            {sortable ? (
              <>
                <SortableHeader label="Name" field="name" sort={sort} onSort={onSort} />
                <SortableHeader label="Category" field="category" sort={sort} onSort={onSort} />
                <SortableHeader label="Price" field="price" sort={sort} onSort={onSort} />
                <SortableHeader label="Stock" field="stock" sort={sort} onSort={onSort} />
              </>
            ) : (
              <>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
              </>
            )}
            {showActions && <th className="px-4 py-3 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const imageUrl = product.images[0]?.url;
            const lowStock = isLowStock(product.stock);

            return (
              <tr
                key={product._id}
                className={cn(
                  'border-t border-zinc-200 dark:border-zinc-800',
                  highlightLowStock &&
                    lowStock &&
                    'bg-amber-50/70 dark:bg-amber-950/20'
                )}
              >
                <td className="px-4 py-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                        No img
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{product.name}</span>
                    {lowStock && (
                      <Badge
                        variant={product.stock === 0 ? 'red' : 'amber'}
                        className="gap-1"
                      >
                        <AlertTriangle className="h-3 w-3" aria-hidden />
                        {product.stock === 0 ? 'Out of stock' : 'Low stock'}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{product.category}</td>
                <td className="px-4 py-3">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'font-medium',
                        product.stock === 0 && 'text-red-600 dark:text-red-400',
                        product.stock > 0 && lowStock && 'text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {product.stock}
                    </span>
                    {lowStock && (
                      <Badge
                        variant={product.stock === 0 ? 'red' : 'amber'}
                        className="gap-1"
                        title={product.stock === 0 ? 'Out of stock' : 'Low stock'}
                      >
                        <AlertTriangle className="h-3 w-3" aria-hidden />
                        {product.stock === 0 ? 'Out of stock' : 'Low stock'}
                      </Badge>
                    )}
                  </div>
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
