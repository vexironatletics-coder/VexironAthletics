'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { cn } from '@/lib/utils';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductImage {
  url: string;
  public_id: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  discountPct?: number | false;
  selectedIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function ProductImageGallery({
  images,
  productName,
  discountPct,
  selectedIndex = 0,
  onIndexChange,
}: ProductImageGalleryProps) {
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (mainSwiper && !mainSwiper.destroyed && mainSwiper.activeIndex !== selectedIndex) {
      mainSwiper.slideTo(selectedIndex);
    }
  }, [selectedIndex, mainSwiper]);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/20 bg-black/20">
        <div className="flex h-full items-center justify-center text-white/50">No image</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-[var(--gradient-start)]/40 to-[var(--gradient-end)]/40 blur-lg" />
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-black/20 shadow-2xl">
          <Swiper
            modules={[Navigation, Pagination, Thumbs]}
            onSwiper={setMainSwiper}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            onSlideChange={(s) => onIndexChange?.(s.activeIndex)}
            navigation={
              hasMultiple
                ? {
                    prevEl: '.product-gallery-prev',
                    nextEl: '.product-gallery-next',
                  }
                : false
            }
            pagination={
              hasMultiple
                ? { clickable: true, el: '.product-gallery-pagination' }
                : false
            }
            loop={false}
            speed={450}
            className="product-main-gallery aspect-square w-full"
          >
            {images.map((img, i) => (
              <SwiperSlide key={img.public_id || img.url}>
                <div className="relative aspect-square w-full">
                  <Image
                    src={img.url}
                    alt={`${productName} — image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 45vw"
                    priority={i === 0}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {discountPct ? (
            <span className="absolute left-4 top-4 z-10 rounded-full theme-gradient px-3 py-1 text-xs font-bold text-white shadow-lg">
              -{discountPct}% OFF
            </span>
          ) : null}

          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                className="product-gallery-prev absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                className="product-gallery-next absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="product-gallery-pagination absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5 [&_.swiper-pagination-bullet]:h-1.5 [&_.swiper-pagination-bullet]:w-1.5 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-white/40 [&_.swiper-pagination-bullet-active]:w-5 [&_.swiper-pagination-bullet-active]:bg-white" />
            </>
          )}
        </div>
      </div>

      {hasMultiple && (
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          watchSlidesProgress
          slidesPerView="auto"
          spaceBetween={10}
          className="product-thumbs-gallery !overflow-visible px-0.5"
        >
          {images.map((img, i) => (
            <SwiperSlide
              key={`thumb-${img.public_id || img.url}`}
              className="!w-[4.75rem] cursor-pointer"
            >
              <button
                type="button"
                onClick={() => {
                  mainSwiper?.slideTo(i);
                  onIndexChange?.(i);
                }}
                className={cn(
                  'relative h-[4.75rem] w-[4.75rem] overflow-hidden rounded-xl border-2 transition-all',
                  selectedIndex === i
                    ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/40 scale-105'
                    : 'border-white/20 opacity-75 hover:opacity-100'
                )}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="76px" />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
