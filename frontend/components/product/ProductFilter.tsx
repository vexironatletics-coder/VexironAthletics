'use client';

import { SIZES, COLORS } from '@/lib/utils';
import type { ProductFilters } from '@/lib/types';

interface ProductFilterProps {
  filters: ProductFilters;
  onFilterChange: (updates: Record<string, string | undefined>) => void;
}

export function ProductFilter({ filters, onFilterChange }: ProductFilterProps) {
  const selectedSizes = filters.size?.split(',') ?? [];
  const selectedColors = filters.color?.split(',') ?? [];

  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    onFilterChange({ size: next.length ? next.join(',') : undefined });
  };

  const toggleColor = (color: string) => {
    const next = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    onFilterChange({ color: next.length ? next.join(',') : undefined });
  };

  return (
    <div className="space-y-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <h3 className="mb-3 font-semibold">Category</h3>
        <div className="space-y-2">
          {(['men', 'women', 'children'] as const).map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm capitalize">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat}
                onChange={() => onFilterChange({ category: cat })}
                className="rounded"
              />
              {cat}
            </label>
          ))}
          <button
            type="button"
            onClick={() => onFilterChange({ category: undefined })}
            className="text-sm text-zinc-500 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={filters.minPrice}
            onBlur={(e) => onFilterChange({ minPrice: e.target.value || undefined })}
            className="w-full rounded-md border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={filters.maxPrice}
            onBlur={(e) => onFilterChange({ maxPrice: e.target.value || undefined })}
            className="w-full rounded-md border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`rounded border px-2 py-1 text-xs ${
                selectedSizes.includes(size)
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                  : 'border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              title={color.name}
              onClick={() => toggleColor(color.name)}
              className={`h-6 w-6 rounded-full border-2 ${
                selectedColors.includes(color.name)
                  ? 'border-zinc-900 dark:border-zinc-50'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => onFilterChange({ minRating: String(rating) })}
              />
              {rating}+ Stars
            </label>
          ))}
          <button
            type="button"
            onClick={() => onFilterChange({ minRating: undefined })}
            className="text-sm text-zinc-500 hover:underline"
          >
            Any rating
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onFilterChange({
            category: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            size: undefined,
            color: undefined,
            minRating: undefined,
          })
        }
        className="w-full rounded-md border border-zinc-200 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Clear All Filters
      </button>
    </div>
  );
}
