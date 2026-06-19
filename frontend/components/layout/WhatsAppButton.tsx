'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Phone, X, MessageCircle, Sparkles, Zap } from 'lucide-react';
import {
  CONTACT_PROMO_MESSAGES,
  PHONE_CALL_URL,
  PHONE_DISPLAY,
  WHATSAPP_INITIAL_DELAY_MS,
  WHATSAPP_MESSAGE_ROTATE_MS,
  WHATSAPP_REOPEN_DELAY_MS,
  WHATSAPP_SCROLL_THRESHOLD_PX,
  WHATSAPP_TEASER_LINES,
  WHATSAPP_TEASER_ROTATE_MS,
  getWhatsAppUrl,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);
  const [messagePhase, setMessagePhase] = useState<'enter' | 'exit'>('enter');
  const reopenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountTimeRef = useRef<number>(0);

  const message = CONTACT_PROMO_MESSAGES[activeIndex];
  const whatsappHref = getWhatsAppUrl(`${message.title} — ${message.text}`);

  const openPopup = useCallback(() => setVisible(true), []);

  const scheduleReopen = useCallback(() => {
    if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current);
    reopenTimerRef.current = setTimeout(() => {
      openPopup();
    }, WHATSAPP_REOPEN_DELAY_MS);
  }, [openPopup]);

  const handleDismiss = () => {
    setVisible(false);
    scheduleReopen();
  };

  useEffect(() => {
    mountTimeRef.current = Date.now();
    setMounted(true);

    const onScroll = () => {
      if (window.scrollY >= WHATSAPP_SCROLL_THRESHOLD_PX) {
        setHasScrolledPastHero(true);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!hasScrolledPastHero) return;

    const elapsed = Date.now() - mountTimeRef.current;
    const delay = Math.max(0, WHATSAPP_INITIAL_DELAY_MS - elapsed);

    initialTimerRef.current = setTimeout(() => {
      openPopup();
    }, delay);

    return () => {
      if (initialTimerRef.current) clearTimeout(initialTimerRef.current);
    };
  }, [hasScrolledPastHero, openPopup]);

  useEffect(() => {
    if (!visible) return;

    const rotateTimer = setInterval(() => {
      setMessagePhase('exit');
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % CONTACT_PROMO_MESSAGES.length);
        setMessagePhase('enter');
      }, 280);
    }, WHATSAPP_MESSAGE_ROTATE_MS);

    return () => clearInterval(rotateTimer);
  }, [visible]);

  useEffect(() => {
    const teaserTimer = setInterval(() => {
      setTeaserIndex((prev) => (prev + 1) % WHATSAPP_TEASER_LINES.length);
    }, WHATSAPP_TEASER_ROTATE_MS);

    return () => clearInterval(teaserTimer);
  }, []);

  useEffect(
    () => () => {
      if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current);
      if (initialTimerRef.current) clearTimeout(initialTimerRef.current);
    },
    []
  );

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {visible && (
        <div
          className="animate-slide-up w-[min(calc(100vw-3rem),340px)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl ring-1 ring-[#25D366]/20 dark:border-zinc-700 dark:bg-zinc-900"
          role="dialog"
          aria-label="WhatsApp support offer"
          aria-live="polite"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E] px-4 py-3">
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] animate-[shimmer_3s_ease-in-out_infinite]" />
            <div className="relative flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
                  VexironAthletics Support
                </p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-80" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                  </span>
                  We&apos;re online
                </span>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div
              className={cn(
                'transition-all duration-300 ease-out',
                messagePhase === 'enter'
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-2 opacity-0'
              )}
            >
              <div className="flex items-start gap-2">
                {message.accent === 'discount' && (
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden />
                )}
                {message.accent === 'online' && (
                  <Zap className="mt-0.5 h-5 w-5 shrink-0 text-[#25D366]" aria-hidden />
                )}
                {message.accent === 'help' && (
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">{message.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {message.text}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:scale-[1.02] hover:bg-[#20bd5a]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {message.cta}
              </a>
              <a
                href={PHONE_CALL_URL}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                aria-label={`Call ${PHONE_DISPLAY}`}
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-3 text-center text-xs text-zinc-500">{PHONE_DISPLAY}</p>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Offers rotate automatically
            </p>
            <div className="flex gap-1.5">
              {CONTACT_PROMO_MESSAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show message ${i + 1}`}
                  onClick={() => {
                    setMessagePhase('exit');
                    setTimeout(() => {
                      setActiveIndex(i);
                      setMessagePhase('enter');
                    }, 200);
                  }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === activeIndex ? 'w-5 bg-[#25D366]' : 'w-1.5 bg-zinc-300 dark:bg-zinc-600'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!visible && (
          <button
            type="button"
            onClick={openPopup}
            className="group relative overflow-hidden rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
          >
            <span
              key={teaserIndex}
              className="animate-slide-up block whitespace-nowrap"
            >
              {WHATSAPP_TEASER_LINES[teaserIndex]}
            </span>
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100 group-hover:animate-[shimmer_1.2s_ease-in-out]" />
          </button>
        )}

        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#20bd5a] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        >
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500" />
          </span>
          <WhatsAppIcon className="h-7 w-7" />
        </a>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
