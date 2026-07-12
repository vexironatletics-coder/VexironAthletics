'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (mainSwiper && !mainSwiper.destroyed && mainSwiper.activeIndex !== selectedIndex) {
      mainSwiper.slideTo(selectedIndex);
    }
  }, [selectedIndex, mainSwiper]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const goLightbox = useCallback(
    (direction: -1 | 1) => {
      setLightboxIndex((current) => {
        const next = (current + direction + images.length) % images.length;
        mainSwiper?.slideTo(next);
        onIndexChange?.(next);
        return next;
      });
    },
    [images.length, mainSwiper, onIndexChange]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goLightbox(-1);
      if (e.key === 'ArrowRight') goLightbox(1);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen, closeLightbox, goLightbox]);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/5] max-h-[min(72vh,640px)] w-full overflow-hidden rounded-2xl border border-white/20 bg-black/20 sm:aspect-square sm:max-h-none sm:rounded-3xl">
        <div className="flex h-full items-center justify-center text-white/50">No image</div>
      </div>
    );
  }

  const lightboxImage = images[lightboxIndex];

  return (
    <>
      <div className="min-w-0 space-y-3 sm:space-y-4">
        <div className="relative min-w-0">
          <div className="absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-[var(--gradient-start)]/40 to-[var(--gradient-end)]/40 blur-lg sm:rounded-[1.75rem]" />
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/20 shadow-2xl sm:rounded-3xl">
            {/* Fixed-size frame — prevents swiper/img from expanding to intrinsic pixel size */}
            <div className="relative aspect-[4/5] max-h-[min(72vh,640px)] w-full sm:aspect-square sm:max-h-none">
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
                className="product-main-gallery !h-full !w-full"
              >
                {images.map((img, i) => (
                  <SwiperSlide key={img.public_id || img.url} className="!h-full !w-full">
                    <button
                      type="button"
                      aria-label={`View ${productName} image ${i + 1} full size`}
                      onClick={() => openLightbox(i)}
                      className="group relative block h-full w-full cursor-zoom-in overflow-hidden"
                    >
                      <Image
                        src={img.url}
                        alt={`${productName} — image ${i + 1}`}
                        fill
                        draggable={false}
                        className="pointer-events-none object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 90vw, 45vw"
                        priority={i === 0}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                      <span className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 sm:opacity-100">
                        <ZoomIn className="h-4 w-4" aria-hidden />
                      </span>
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>

              {discountPct ? (
                <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full theme-gradient px-2.5 py-0.5 text-[0.65rem] font-bold text-white shadow-lg sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs">
                  -{discountPct}% OFF
                </span>
              ) : null}

              {hasMultiple && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    className="product-gallery-prev absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 sm:left-3 sm:h-10 sm:w-10"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    className="product-gallery-next absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-3 sm:h-10 sm:w-10"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <div className="product-gallery-pagination pointer-events-none absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5 sm:bottom-3 [&_.swiper-pagination-bullet]:pointer-events-auto [&_.swiper-pagination-bullet]:h-1.5 [&_.swiper-pagination-bullet]:w-1.5 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-white/40 [&_.swiper-pagination-bullet-active]:w-5 [&_.swiper-pagination-bullet-active]:bg-white" />
                </>
              )}
            </div>
          </div>
        </div>

        {hasMultiple && (
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            watchSlidesProgress
            slidesPerView="auto"
            spaceBetween={8}
            breakpoints={{ 640: { spaceBetween: 10 } }}
            className="product-thumbs-gallery !overflow-visible px-0.5"
          >
            {images.map((img, i) => (
              <SwiperSlide
                key={`thumb-${img.public_id || img.url}`}
                className="!w-[3.75rem] sm:!w-[4.75rem]"
              >
                <button
                  type="button"
                  onClick={() => {
                    mainSwiper?.slideTo(i);
                    onIndexChange?.(i);
                  }}
                  className={cn(
                    'relative h-[3.75rem] w-[3.75rem] overflow-hidden rounded-lg border-2 transition-all sm:h-[4.75rem] sm:w-[4.75rem] sm:rounded-xl',
                    selectedIndex === i
                      ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/40 scale-105'
                      : 'border-white/20 opacity-75 hover:opacity-100'
                  )}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="76px" draggable={false} />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Responsive full-screen lightbox — image constrained to viewport */}
      {lightboxOpen && lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image preview`}
          onClick={closeLightbox}
        >
          <button
            type="button"
            aria-label="Close image preview"
            onClick={closeLightbox}
            className="absolute right-3 top-3 z-[110] flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition hover:bg-black/70 sm:right-5 sm:top-5"
          >
            <X className="h-5 w-5" />
          </button>

          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  goLightbox(-1);
                }}
                className="absolute left-2 top-1/2 z-[110] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition hover:bg-black/70 sm:left-4 sm:h-11 sm:w-11"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  goLightbox(1);
                }}
                className="absolute right-2 top-1/2 z-[110] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition hover:bg-black/70 sm:right-4 sm:h-11 sm:w-11"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="relative flex max-h-[90dvh] max-w-[min(96vw,960px)] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage.url}
              alt={`${productName} — image ${lightboxIndex + 1}`}
              className="max-h-[85dvh] w-auto max-w-full object-contain"
              draggable={false}
            />
            {hasMultiple && (
              <p className="mt-3 text-center text-xs text-white/70 sm:text-sm">
                {lightboxIndex + 1} / {images.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
