'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Button } from '@/components/ui/button';
import { HeroProductCardStack } from '@/components/home/HeroProductCardStack';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { heroBannerImages } from '@/lib/shirtImages';

const heroSlides = [
  {
    id: 'elevate',
    tag: 'Premium Collection',
    title: 'Elevate Your',
    titleAccent: 'Style',
    subtitle:
      'Discover premium clothing for men, women, and children. Quality fashion crafted for athletes and everyday champions.',
    image: heroBannerImages.elevate,
    cta: { label: 'Shop Men', href: '/category/men' },
    secondary: { label: 'Shop Women', href: '/category/women' },
  },
  {
    id: 'summer',
    tag: 'Season 2026',
    title: 'Summer',
    titleAccent: 'Collection',
    subtitle: 'Light fabrics, bold colors, and effortless fits designed for heat, movement, and confidence.',
    image: heroBannerImages.summer,
    cta: { label: 'Explore Collection', href: '/products' },
    secondary: { label: 'View Sale', href: '/products?sort=price-desc' },
  },
  {
    id: 'kids',
    tag: 'Kids & Teens',
    title: 'Playful Styles for',
    titleAccent: 'Kids',
    subtitle: 'Durable, comfortable pieces built for school days, sports, and weekend adventures.',
    image: heroBannerImages.kids,
    cta: { label: 'Shop Children', href: '/category/children' },
    secondary: { label: 'All Products', href: '/products' },
  },
  {
    id: 'delivery',
    tag: 'Shop with Confidence',
    title: 'Free Delivery Above',
    titleAccent: '₨5,000',
    subtitle: 'Nationwide shipping with cash on delivery, secure checkout, and easy 30-day returns.',
    image: heroBannerImages.delivery,
    cta: { label: 'Start Shopping', href: '/products' },
    secondary: { label: 'Shipping Info', href: '/shipping' },
  },
];

const trustBadges = [
  { icon: Truck, label: 'Free delivery ₨5k+' },
  { icon: ShieldCheck, label: 'Secure checkout' },
  { icon: RotateCcw, label: '30-day returns' },
];

const AUTOPLAY_MS = 6000;

export function HeroCarousel() {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    setProgressKey((k) => k + 1);
  }, [activeIndex]);

  return (
    <section className="relative h-[82vh] overflow-hidden bg-[var(--hero-from)] lg:h-[90vh]">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        loop
        autoplay={{ delay: AUTOPLAY_MS, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, el: '.hero-pagination' }}
        onSwiper={setSwiper}
        onSlideChange={(s) => setActiveIndex(s.realIndex)}
        className="h-full w-full"
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative flex h-[82vh] items-center lg:h-[90vh]">
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover transition-transform duration-[8000ms] ease-out"
                  style={{
                    transform: activeIndex === index ? 'scale(1.08)' : 'scale(1)',
                  }}
                  priority={index === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--hero-from)]/95 via-[var(--hero-to)]/75 to-[var(--hero-from)]/40" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent_45%)]" />
              </div>

              <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                <div
                  className={cn(
                    'max-w-2xl transition-all duration-700 ease-out lg:max-w-[52%]',
                    activeIndex === index
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-6 opacity-0'
                  )}
                >
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
                    {slide.tag}
                  </div>

                  <p className="mb-2 text-sm font-medium tracking-[0.25em] text-white/60 uppercase">
                    {APP_NAME}
                  </p>

                  <h1 className="text-4xl leading-[1.08] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                    {slide.title}{' '}
                    <span className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-end)] to-[var(--accent)] bg-clip-text text-transparent">
                      {slide.titleAccent}
                    </span>
                  </h1>

                  <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                    {slide.subtitle}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                    <Button
                      asChild
                      size="lg"
                      variant="accent"
                      className="group h-12 px-7 text-base shadow-lg shadow-black/20 transition hover:scale-[1.03] hover:shadow-xl"
                    >
                      <Link href={slide.cta.href}>
                        {slide.cta.label}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-12 border-white/40 bg-white/5 px-7 text-base text-white backdrop-blur-sm transition hover:scale-[1.03] hover:border-white/60 hover:bg-white/15"
                    >
                      <Link href={slide.secondary.href}>{slide.secondary.label}</Link>
                    </Button>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
                    {trustBadges.map(({ icon: Icon, label }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm"
                      >
                        <Icon className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Rotating product cards — right side on desktop */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] hidden w-[44%] items-center overflow-hidden lg:flex">
        <div className="pointer-events-auto w-full pr-6 xl:pr-12">
          <HeroProductCardStack />
        </div>
      </div>

      {/* Compact stack on mobile — bottom of hero */}
      <div className="pointer-events-none absolute inset-x-0 bottom-14 z-[5] overflow-hidden px-4 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-xs">
          <HeroProductCardStack compact />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto flex max-w-7xl items-start justify-between px-4 pt-6 sm:px-6 lg:px-8">
        <div className="pointer-events-auto flex gap-1.5">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => swiper?.slideToLoop(i)}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                activeIndex === i ? 'w-8 bg-white' : 'w-3 bg-white/35 hover:bg-white/55'
              )}
            />
          ))}
        </div>
        <div className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
          {String(activeIndex + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => swiper?.slidePrev()}
        className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/25 bg-black/30 p-3 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-black/50 sm:flex lg:left-8"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => swiper?.slideNext()}
        className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/25 bg-black/30 p-3 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-black/50 sm:flex lg:right-8"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 h-1 bg-white/10">
        <div
          key={progressKey}
          className="h-full origin-left bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)]"
          style={{ animation: `hero-progress ${AUTOPLAY_MS}ms linear forwards` }}
        />
      </div>

      <div className="hero-pagination absolute bottom-10 left-0 right-0 z-10 flex justify-center gap-2 lg:hidden [&_.swiper-pagination-bullet]:h-2 [&_.swiper-pagination-bullet]:w-2 [&_.swiper-pagination-bullet]:bg-white/40 [&_.swiper-pagination-bullet-active]:w-7 [&_.swiper-pagination-bullet-active]:rounded-full [&_.swiper-pagination-bullet-active]:bg-white [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:transition-all" />
    </section>
  );
}
