'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ThemedSection } from '@/components/ui/themed-section';
import { cn } from '@/lib/utils';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const testimonials = [
  {
    name: 'Ahmed Khan',
    role: 'Marathon Runner, Lahore',
    avatar: 'https://picsum.photos/seed/review-ahmed/120/120',
    rating: 5,
    quote:
      'The quality blew me away. I ordered running tees and joggers — perfect fit, fast delivery, and the fabric feels premium even after multiple washes.',
  },
  {
    name: 'Sara Malik',
    role: 'Fitness Coach, Karachi',
    avatar: 'https://picsum.photos/seed/review-sara/120/120',
    rating: 5,
    quote:
      'VexironAthletics is my go-to for client recommendations. Great sizing options, stylish designs, and COD made checkout super easy.',
  },
  {
    name: 'Usman Ali',
    role: 'Parent & Gym Enthusiast',
    avatar: 'https://picsum.photos/seed/review-usman/120/120',
    rating: 5,
    quote:
      'Bought matching outfits for my kids and myself. Prices are fair, returns were hassle-free, and customer support replied on WhatsApp within minutes.',
  },
  {
    name: 'Fatima Noor',
    role: 'Yoga Instructor, Islamabad',
    avatar: 'https://picsum.photos/seed/review-fatima/120/120',
    rating: 5,
    quote:
      'Soft, breathable fabrics that move with you. The women\'s collection has become my everyday uniform — elegant enough for studio, tough enough for training.',
  },
  {
    name: 'Bilal Hussain',
    role: 'Cricket Coach, Multan',
    avatar: 'https://picsum.photos/seed/review-bilal/120/120',
    rating: 5,
    quote:
      'Ordered team kits for our academy. Bulk pricing was fair, embroidery looked sharp, and delivery arrived ahead of schedule. Highly recommend.',
  },
];

const AUTOPLAY_MS = 5000;

function TestimonialCard({
  item,
  isActive,
}: {
  item: (typeof testimonials)[0];
  isActive?: boolean;
}) {
  return (
    <article
      className={cn(
        'relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg transition-all duration-500',
        isActive
          ? 'scale-100 shadow-xl ring-2 ring-[var(--accent)]/25'
          : 'scale-[0.94] opacity-85'
      )}
    >
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[var(--accent)]/10 blur-2xl"
        aria-hidden
      />
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 transition-transform duration-500',
          isActive && 'animate-[pulse-soft_2s_ease-in-out_infinite]'
        )}
      >
        <Quote className="h-5 w-5 text-[var(--accent)]" aria-hidden />
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
        &ldquo;{item.quote}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: item.rating }).map((_, j) => (
          <Star
            key={j}
            className={cn(
              'h-3.5 w-3.5 fill-current transition-transform duration-300',
              isActive && 'animate-[star-pop_0.4s_ease-out_both]'
            )}
            style={isActive ? { animationDelay: `${j * 60}ms` } : undefined}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-[var(--border)] pt-4">
        <div
          className={cn(
            'relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-[var(--accent)]/30 transition-transform duration-500',
            isActive && 'scale-105 ring-[var(--accent)]/50'
          )}
        >
          <Image src={item.avatar} alt="" fill className="object-cover" sizes="44px" />
        </div>
        <div>
          <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
          <p className="text-xs text-[var(--muted)]">{item.role}</p>
        </div>
      </div>
    </article>
  );
}

export function CustomerLoveSection() {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  return (
    <ThemedSection
      variant="soft"
      badge="Real Reviews"
      title="Loved by Athletes"
      description="Thousands of happy customers across Pakistan trust us for quality sportswear and reliable service."
      className="overflow-x-hidden"
    >
      {/* Ambient background — clipped, no horizontal drift */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-0 top-1/4 h-64 w-64 animate-[float-y_8s_ease-in-out_infinite] rounded-full bg-[var(--accent)]/8 blur-3xl" />
        <div className="absolute right-0 bottom-1/4 h-56 w-56 animate-[float-y_10s_ease-in-out_infinite_1s] rounded-full bg-[var(--accent)]/6 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl overflow-hidden px-2 sm:px-4">
        {/* Progress bar + counter */}
        <div className="mb-6 flex items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Testimonial
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums text-[var(--foreground)]">
              {(activeIndex % testimonials.length) + 1}
              <span className="text-[var(--muted)]"> / {testimonials.length}</span>
            </span>
          </div>
          <div className="hidden h-1 flex-1 max-w-xs overflow-hidden rounded-full bg-[var(--border)] sm:block">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => swiper?.slidePrev()}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => swiper?.slideNext()}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden pb-12">
          <Swiper
            onSwiper={setSwiper}
            onSlideChange={(s) => {
              setActiveIndex(s.realIndex);
              setProgress(0);
            }}
            onAutoplayTimeLeft={(_s, _time, progressFraction) => {
              setProgress((1 - progressFraction) * 100);
            }}
            modules={[EffectCoverflow, Autoplay, Pagination]}
            effect="coverflow"
            grabCursor
            centeredSlides
            loop
            speed={650}
            slidesPerView={1}
            spaceBetween={20}
            autoplay={{
              delay: AUTOPLAY_MS,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            coverflowEffect={{
              rotate: 6,
              stretch: 0,
              depth: 80,
              modifier: 1,
              slideShadows: false,
            }}
            pagination={{
              clickable: true,
              el: '.testimonials-pagination',
            }}
            breakpoints={{
              640: {
                slidesPerView: 1.2,
                spaceBetween: 20,
                coverflowEffect: { rotate: 8, depth: 90, modifier: 1.05 },
              },
              768: {
                slidesPerView: 1.5,
                spaceBetween: 24,
                coverflowEffect: { rotate: 10, depth: 100, modifier: 1.1 },
              },
              1024: {
                slidesPerView: 1.8,
                spaceBetween: 28,
                coverflowEffect: { rotate: 12, depth: 110, modifier: 1.15 },
              },
            }}
            className="testimonials-carousel w-full"
          >
            {testimonials.map((item, index) => (
              <SwiperSlide key={item.name} className="!h-auto py-2">
                <TestimonialCard
                  item={item}
                  isActive={index === activeIndex % testimonials.length}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="testimonials-pagination flex justify-center gap-2" />
      </div>

      <style jsx global>{`
        @keyframes float-y {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        @keyframes pulse-soft {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.85;
          }
        }
        @keyframes star-pop {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .testimonials-carousel {
          overflow: hidden !important;
        }
        .testimonials-carousel .swiper-wrapper {
          align-items: stretch;
        }
        .testimonials-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: var(--muted);
          opacity: 0.45;
          transition: all 0.3s ease;
          border-radius: 9999px;
        }
        .testimonials-pagination .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: var(--accent);
          opacity: 1;
        }
      `}</style>
    </ThemedSection>
  );
}
