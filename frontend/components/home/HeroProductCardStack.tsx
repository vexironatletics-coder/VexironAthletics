'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { useGetProductsQuery } from '@/store/api/productApi';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';

const CARD_COUNT = 5;
const ROTATE_MS = 3500;

import { heroStackShirtImages } from '@/lib/shirtImages';

const fallbackProducts: Pick<Product, '_id' | 'name' | 'price' | 'discountPrice' | 'images'>[] = [
  {
    _id: 'hero-fallback-1',
    name: 'Classic Oxford Shirt',
    price: 2499,
    discountPrice: 1999,
    images: [{ url: heroStackShirtImages[0], public_id: '' }],
  },
  {
    _id: 'hero-fallback-2',
    name: 'Striped Cotton Shirt',
    price: 3299,
    images: [{ url: heroStackShirtImages[1], public_id: '' }],
  },
  {
    _id: 'hero-fallback-3',
    name: 'Premium Dress Shirt',
    price: 4499,
    discountPrice: 3799,
    images: [{ url: heroStackShirtImages[2], public_id: '' }],
  },
  {
    _id: 'hero-fallback-4',
    name: 'Casual Linen Shirt',
    price: 1899,
    images: [{ url: heroStackShirtImages[3], public_id: '' }],
  },
  {
    _id: 'hero-fallback-5',
    name: 'Everyday Tee',
    price: 5499,
    images: [{ url: heroStackShirtImages[4], public_id: '' }],
  },
];

type StackCard = Pick<Product, '_id' | 'name' | 'price' | 'discountPrice' | 'images'>;

/** Visual slot for each card in the 5-card fan stack (index 0 = front) */
const stackSlotsFull = [
  { rotate: 0, x: 0, y: 0, scale: 1, z: 50, opacity: 1 },
  { rotate: -10, x: -32, y: 14, scale: 0.9, z: 40, opacity: 0.92 },
  { rotate: -16, x: -58, y: 26, scale: 0.84, z: 30, opacity: 0.78 },
  { rotate: 10, x: 32, y: 14, scale: 0.9, z: 35, opacity: 0.88 },
  { rotate: 16, x: 58, y: 26, scale: 0.84, z: 25, opacity: 0.72 },
];

const stackSlotsCompact = [
  { rotate: 0, x: 0, y: 0, scale: 1, z: 50, opacity: 1 },
  { rotate: -10, x: -28, y: 12, scale: 0.88, z: 40, opacity: 0.9 },
  { rotate: -18, x: -52, y: 22, scale: 0.8, z: 30, opacity: 0.75 },
  { rotate: 10, x: 28, y: 12, scale: 0.88, z: 35, opacity: 0.85 },
  { rotate: 18, x: 52, y: 22, scale: 0.8, z: 25, opacity: 0.7 },
];

function getRelativeIndex(cardIndex: number, frontIndex: number, total: number): number {
  return (cardIndex - frontIndex + total) % total;
}

interface HeroProductCardStackProps {
  visible?: boolean;
  compact?: boolean;
  className?: string;
}

export function HeroProductCardStack({
  visible = true,
  compact = false,
  className,
}: HeroProductCardStackProps) {
  const { data } = useGetProductsQuery({ limit: CARD_COUNT, sort: 'rating', minRating: 1 });
  const [frontIndex, setFrontIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const cards: StackCard[] = useMemo(() => {
    const fromApi = data?.products?.slice(0, CARD_COUNT) ?? [];
    return fromApi.length >= 3 ? fromApi : fallbackProducts;
  }, [data?.products]);

  const total = cards.length;
  const stackSlots = compact ? stackSlotsCompact : stackSlotsFull;

  useEffect(() => {
    if (!visible || paused || total < 2) return;
    const timer = setInterval(() => {
      setFrontIndex((i) => (i + 1) % total);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [visible, paused, total]);

  const frontCard = cards[frontIndex];

  return (
    <div
      className={cn(
        'relative mx-auto w-full pointer-events-auto',
        compact ? 'max-w-xs' : 'max-w-md',
        className
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Glow behind stack */}
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]/25 blur-3xl',
          compact ? 'h-48 w-48' : 'h-72 w-72'
        )}
        aria-hidden
      />

      <div
        className={cn(
          'relative flex items-center justify-center [perspective:1400px]',
          compact ? 'h-[300px]' : 'h-[420px]'
        )}
      >
        {cards.map((product, cardIndex) => {
          const rel = getRelativeIndex(cardIndex, frontIndex, total);
          const slot = stackSlots[rel] ?? stackSlots[stackSlots.length - 1];
          const imageUrl = product.images[0]?.url ?? '/placeholder.png';
          const salePrice = product.discountPrice ?? product.price;
          const isFront = rel === 0;

          return (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              onClick={(e) => {
                if (!isFront) {
                  e.preventDefault();
                  setFrontIndex(cardIndex);
                }
              }}
              className={cn(
                'absolute left-1/2 top-1/2 origin-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                compact ? 'w-[160px]' : 'w-[200px] sm:w-[220px]',
                isFront ? 'cursor-pointer' : 'cursor-pointer hover:opacity-100'
              )}
              style={{
                zIndex: slot.z,
                opacity: slot.opacity,
                transform: `translate(-50%, -50%) translateX(${slot.x}px) translateY(${slot.y}px) rotate(${slot.rotate}deg) scale(${slot.scale})`,
              }}
              aria-label={isFront ? `View ${product.name}` : `Show ${product.name}`}
            >
              <article
                className={cn(
                  'overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md transition-shadow duration-500',
                  isFront
                    ? 'border-white/35 bg-white/15 shadow-black/40 ring-2 ring-[var(--accent)]/40'
                    : 'border-white/20 bg-white/10 shadow-black/25'
                )}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className={cn(
                      'object-cover transition-transform duration-700',
                      isFront && 'scale-105'
                    )}
                    sizes="220px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {isFront && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                      <Sparkles className="h-3 w-3 text-[var(--accent)]" />
                      Featured
                    </span>
                  )}
                </div>
                <div className="border-t border-white/15 bg-black/30 px-3 py-2.5 backdrop-blur-sm">
                  <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--accent)]">
                    {formatPrice(salePrice)}
                  </p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="mt-4 flex justify-center gap-1.5">
        {cards.map((card, i) => (
          <button
            key={card._id}
            type="button"
            aria-label={`Show product ${i + 1}`}
            onClick={() => setFrontIndex(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              frontIndex === i ? 'w-6 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/55'
            )}
          />
        ))}
      </div>
    </div>
  );
}
