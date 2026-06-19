'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationMeta {
  page: number;
  pages: number;
  total?: number;
  limit?: number;
}

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
  scrollToTop?: boolean;
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('ellipsis');

  pages.push(total);
  return pages;
}

export function Pagination({
  pagination,
  onPageChange,
  className,
  scrollToTop = true,
}: PaginationProps) {
  const { page, pages, total, limit } = pagination;

  if (pages <= 1) return null;

  const visible = getVisiblePages(page, pages);

  const goTo = (next: number) => {
    if (next < 1 || next > pages || next === page) return;
    onPageChange(next);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const start = total && limit ? (page - 1) * limit + 1 : null;
  const end = total && limit ? Math.min(page * limit, total) : null;

  return (
    <div className={cn('mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between', className)}>
      {total !== undefined && start !== null && end !== null && (
        <p className="text-sm text-[var(--muted)]">
          Showing {start}–{end} of {total} results
        </p>
      )}

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          className="border-[var(--border)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {visible.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-[var(--muted)]">
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === page ? 'default' : 'outline'}
              size="icon"
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => goTo(item)}
              className={cn(
                'min-w-10',
                item !== page && 'border-[var(--border)]'
              )}
            >
              {item}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => goTo(page + 1)}
          className="border-[var(--border)]"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}
