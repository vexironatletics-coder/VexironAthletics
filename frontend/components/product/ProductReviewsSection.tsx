'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { MessageSquare, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemedSection } from '@/components/ui/themed-section';
import { useCreateReviewMutation } from '@/store/api/productApi';
import { reviewSchema, type ReviewFormData } from '@/lib/validators';
import type { ProductReview } from '@/lib/types';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';

function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md';
}) {
  const [hover, setHover] = useState(0);
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= (hover || value);
        return (
          <button
            key={i}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => onChange && setHover(starValue)}
            onMouseLeave={() => onChange && setHover(0)}
            className={cn(
              'transition-transform',
              onChange && 'hover:scale-110',
              !onChange && 'cursor-default'
            )}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                iconClass,
                filled ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

interface ProductReviewsSectionProps {
  productId: string;
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
}

export function ProductReviewsSection({
  productId,
  reviews,
  averageRating,
  totalReviews,
}: ProductReviewsSectionProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const [formRating, setFormRating] = useState(5);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: '', comment: '' },
  });

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await createReview({
        id: productId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      }).unwrap();
      toast.success('Thank you! Your review has been posted.');
      form.reset({ rating: 5, title: '', comment: '' });
      setFormRating(5);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? 'Could not submit review. Please try again.');
    }
  };

  return (
    <ThemedSection
      variant="card"
      badge="Customer Feedback"
      badgeIcon={MessageSquare}
      title="Reviews"
      description={
        totalReviews > 0
          ? `${averageRating.toFixed(1)} out of 5 · ${totalReviews} review${totalReviews === 1 ? '' : 's'}`
          : 'See what customers are saying — or share your own experience.'
      }
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--secondary)] ring-2 ring-[var(--border)]">
                    {review.user?.avatar ? (
                      <Image
                        src={review.user.avatar}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    ) : (
                      <User className="h-5 w-5 text-[var(--muted)]" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-[var(--foreground)]">
                        {review.user?.name ?? 'Customer'}
                      </p>
                      <time
                        className="text-xs text-[var(--muted)]"
                        dateTime={review.createdAt}
                      >
                        {formatReviewDate(review.createdAt)}
                      </time>
                    </div>
                    <StarRating value={review.rating} size="sm" />
                    <p className="mt-2 font-medium">{review.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--secondary)]">
                <Star className="h-7 w-7 text-[var(--muted)]/60" aria-hidden />
              </div>
              <p className="mt-4 text-lg font-semibold">No reviews yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                Be the first to share your experience with this product.
              </p>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
              <div className="text-center">
                <p className="text-3xl font-bold leading-none">{averageRating.toFixed(1)}</p>
                <StarRating value={Math.round(averageRating)} size="sm" />
              </div>
              <div>
                <p className="font-semibold">Overall rating</p>
                <p className="text-sm text-[var(--muted)]">
                  Based on {totalReviews} review{totalReviews === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {user ? (
              <form
                className="mt-4 space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <p className="font-semibold">Write a review</p>
                <div>
                  <Label className="mb-2 block text-sm">Your rating</Label>
                  <StarRating
                    value={formRating}
                    onChange={(rating) => {
                      setFormRating(rating);
                      form.setValue('rating', rating, { shouldValidate: true });
                    }}
                  />
                  {form.formState.errors.rating && (
                    <p className="mt-1 text-xs text-red-500">
                      {form.formState.errors.rating.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="review-title">Title</Label>
                  <Input
                    id="review-title"
                    placeholder="Summarize your experience"
                    className="mt-1.5"
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="mt-1 text-xs text-red-500">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="review-comment">Review</Label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    placeholder="Tell others about fit, quality, and delivery..."
                    className="mt-1.5 w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm outline-none ring-[var(--ring)] focus-visible:ring-2"
                    {...form.register('comment')}
                  />
                  {form.formState.errors.comment && (
                    <p className="mt-1 text-xs text-red-500">
                      {form.formState.errors.comment.message}
                    </p>
                  )}
                </div>
                <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Submitting…' : 'Submit Review'}
                </Button>
              </form>
            ) : (
              <div className="mt-4 rounded-xl bg-[var(--secondary)]/60 p-4 text-center">
                <p className="text-sm font-medium">Want to leave a review?</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Sign in to share your experience with this product.
                </p>
                <Button asChild variant="accent" size="sm" className="mt-3">
                  <Link href={`/login?callbackUrl=/products/${productId}`}>Sign in to review</Link>
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </ThemedSection>
  );
}
