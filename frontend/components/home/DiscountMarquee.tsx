'use client';

import { Sparkles, Tag } from 'lucide-react';
import { useGetActivePromotionsQuery } from '@/store/api/promotionApi';

type MarqueeItem = {
  title: string;
  message: string;
  couponCode?: string;
};

const fallbackItems: MarqueeItem[] = [
  { title: '🔥 AMAZING DEAL', message: 'Up to 40% off on selected styles — Shop now!' },
  { title: '✨ NEW ARRIVALS', message: 'Fresh drops every week at VexironAthletics' },
  { title: '🎁 USE CODE WELCOME10', message: 'Get 10% off your first order today!' },
];

export function DiscountMarquee() {
  const { data: promotions = [] } = useGetActivePromotionsQuery();

  const items =
    promotions.length > 0
      ? promotions.map((p) => ({
          title: p.title,
          message: p.message,
          couponCode: p.couponCode,
        }))
      : fallbackItems;

  const track = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-[var(--accent)]/30 theme-gradient py-3 text-white shadow-lg">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--gradient-start)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--gradient-end)] to-transparent" />

      <div className="flex animate-marquee-rtl whitespace-nowrap">
        {track.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="mx-8 inline-flex items-center gap-3 text-sm font-medium sm:text-base"
          >
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-amber-200" />
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm sm:text-sm">
              {item.title}
            </span>
            <span className="text-white/95">{item.message}</span>
            {item.couponCode && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold text-[var(--gradient-start)]">
                <Tag className="h-3 w-3" />
                {item.couponCode}
              </span>
            )}
            <span className="mx-4 text-white/40">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
