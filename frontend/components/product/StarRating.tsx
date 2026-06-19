'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, showValue = true, size = 'sm' }: StarRatingProps) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700'
          )}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-xs text-zinc-500">({rating.toFixed(1)})</span>
      )}
    </div>
  );
}
