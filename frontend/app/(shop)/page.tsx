'use client';

import Link from 'next/link';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Sparkles, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductGrid } from '@/components/product/ProductGrid';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { DiscountDealsSection } from '@/components/home/DiscountDealsSection';
import { TrendingNowSection } from '@/components/home/TrendingNowSection';
import { CustomerLoveSection } from '@/components/home/CustomerLoveSection';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { SlideUp } from '@/components/ui/motion';
import {
  ThemedIconCircle,
  ThemedSection,
} from '@/components/ui/themed-section';
import { useGetProductsQuery } from '@/store/api/productApi';
import Image from 'next/image';

const categories = [
  { slug: 'men', label: 'Men', image: 'https://picsum.photos/seed/men-cat/600/800' },
  { slug: 'women', label: 'Women', image: 'https://picsum.photos/seed/women-cat/600/800' },
  { slug: 'children', label: 'Children', image: 'https://picsum.photos/seed/kids-cat/600/800' },
];

export default function LandingPage() {
  const { data, isLoading } = useGetProductsQuery({ limit: 8, sort: 'newest' });

  return (
    <ErrorBoundary>
      <HeroCarousel />

      <ThemedSection
        variant="band"
        badge="Collections"
        badgeIcon={Sparkles}
        title="Shop by Category"
        description="Explore curated styles for men, women, and children — built for performance and everyday wear."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {categories.map((cat, i) => (
            <SlideUp key={cat.slug} delay={i * 100}>
              <Link
                href={`/category/${cat.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-lg ring-1 ring-[var(--border)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-from)]/90 via-[var(--hero-to)]/40 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <h3 className="text-2xl font-bold text-white">{cat.label}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm text-white/80 group-hover:text-white">
                    Shop Now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </SlideUp>
          ))}
        </div>
      </ThemedSection>

      <DiscountDealsSection />

      <ThemedSection
        variant="card"
        badge="New Arrivals"
        title="Featured Products"
        description="Hand-picked favorites from our latest collection."
        action={
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition hover:gap-2 hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <ProductGrid products={data?.products ?? []} loading={isLoading} />
      </ThemedSection>

      <TrendingNowSection />

      <CustomerLoveSection />

      <RecentlyViewedSection />

      <ThemedSection variant="soft" title="Why Shop With Us" description="Quality, trust, and service you can count on.">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₨5,000' },
            { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <SlideUp key={title} delay={i * 100}>
              <div className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-sm transition hover:shadow-md">
                <ThemedIconCircle icon={Icon} />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{desc}</p>
              </div>
            </SlideUp>
          ))}
        </div>
      </ThemedSection>

      <ThemedSection
        variant="gradient"
        badge="Stay Updated"
        badgeIcon={Mail}
        title="Stay in the Loop"
        description="Subscribe for exclusive offers, new arrivals, and member-only discounts."
      >
        <form
          className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            type="email"
            placeholder="Enter your email"
            className="flex-1 border-white/30 bg-white/15 text-white placeholder:text-white/55 backdrop-blur-sm focus-visible:border-white/50 focus-visible:ring-white/20"
          />
          <Button
            type="submit"
            className="shrink-0 bg-white font-semibold text-zinc-900 shadow-md hover:bg-white/90"
          >
            Subscribe
          </Button>
        </form>
      </ThemedSection>
    </ErrorBoundary>
  );
}
