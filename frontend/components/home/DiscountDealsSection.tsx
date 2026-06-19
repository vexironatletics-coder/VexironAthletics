'use client';

import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { DiscountMarquee } from '@/components/home/DiscountMarquee';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { ThemedCouponChip, ThemedSection } from '@/components/ui/themed-section';
import { SlideUp } from '@/components/ui/motion';
import { useGetProductsQuery } from '@/store/api/productApi';
import { useGetActivePromotionsQuery } from '@/store/api/promotionApi';
import type { Product } from '@/lib/types';

function getDiscountPercent(product: Product): number {
  if (!product.discountPrice || product.discountPrice >= product.price) return 0;
  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
}

export function DiscountDealsSection() {
  const { data, isLoading } = useGetProductsQuery({ limit: 50, sort: 'newest' });
  const { data: promotions = [] } = useGetActivePromotionsQuery();

  const saleProducts =
    data?.products
      .filter((p) => p.discountPrice && p.discountPrice < p.price)
      .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a))
      .slice(0, 8) ?? [];

  const couponCodes = promotions
    .filter((p) => p.couponCode)
    .map((p) => p.couponCode as string);

  if (!isLoading && saleProducts.length === 0 && promotions.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden">
      <DiscountMarquee />

      <ThemedSection
        variant="soft"
        badge="Limited Time"
        badgeIcon={Flame}
        title="Amazing Discounts"
        description="Grab the hottest deals before they're gone — premium athletic wear at unbeatable prices."
        className="py-14"
        action={
          <Button
            asChild
            variant="outline"
            className="gap-2 border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/10"
          >
            <Link href="/products">
              View All Deals <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      >
        {couponCodes.length > 0 && (
          <SlideUp delay={100} className="mb-8 flex flex-wrap gap-2">
            {couponCodes.map((code) => (
              <ThemedCouponChip key={code} code={code} />
            ))}
          </SlideUp>
        )}
        <ProductGrid products={saleProducts} loading={isLoading} />
      </ThemedSection>
    </section>
  );
}
