import type { LucideIcon } from 'lucide-react';
import { SlideUp } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

type ThemedSectionVariant = 'soft' | 'gradient' | 'card' | 'band';

interface ThemedSectionProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: ThemedSectionVariant;
  className?: string;
  childrenClassName?: string;
  /** Use inside dashboard panels — compact padding, no outer max-width container */
  embedded?: boolean;
  children?: React.ReactNode;
  delay?: number;
}

const variantStyles: Record<ThemedSectionVariant, string> = {
  soft: 'bg-gradient-to-b from-[var(--secondary)]/60 via-[var(--background)] to-[var(--background)]',
  gradient:
    'theme-gradient text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  card: 'bg-[var(--card)] border-y border-[var(--border)]',
  band: 'relative overflow-hidden bg-gradient-to-b from-[var(--secondary)]/40 to-[var(--background)]',
};

export function ThemedSection({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  action,
  variant = 'soft',
  className,
  childrenClassName,
  embedded = false,
  children,
  delay = 0,
}: ThemedSectionProps) {
  const isGradient = variant === 'gradient';

  return (
    <section
      className={cn(
        'relative',
        embedded ? 'rounded-2xl py-8 shadow-sm ring-1 ring-[var(--border)]' : 'py-14',
        variantStyles[variant],
        className
      )}
    >
      {variant === 'band' && (
        <div className="theme-gradient absolute inset-x-0 top-0 h-1.5 shadow-sm" aria-hidden />
      )}

      <div
        className={cn(
          'relative',
          embedded ? 'px-6' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
        )}
      >
        <SlideUp delay={delay} className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {badge && (
              <div
                className={cn(
                  'mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider',
                  isGradient
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-[var(--accent)]/15 text-[var(--accent)]'
                )}
              >
                {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
                {badge}
              </div>
            )}
            <h2
              className={cn(
                'text-3xl font-bold tracking-tight',
                isGradient ? 'text-white' : 'text-[var(--foreground)]'
              )}
            >
              {title}
            </h2>
            {description && (
              <p
                className={cn(
                  'mt-2 max-w-xl',
                  isGradient ? 'text-white/85' : 'text-[var(--muted)]'
                )}
              >
                {description}
              </p>
            )}
          </div>
          {action}
        </SlideUp>

        {children && <div className={cn('mt-10', childrenClassName)}>{children}</div>}
      </div>
    </section>
  );
}

interface ThemedBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemedBadge({ children, className }: ThemedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs font-medium text-[var(--accent)]',
        className
      )}
    >
      {children}
    </span>
  );
}

export function ThemedCouponChip({ code }: { code: string }) {
  return (
    <span className="rounded-lg border border-dashed border-[var(--accent)]/60 bg-[var(--card)] px-4 py-2 font-mono text-sm font-bold text-[var(--accent)] shadow-sm">
      Code: {code}
    </span>
  );
}

export function ThemedIconCircle({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-2xl theme-gradient text-white shadow-lg transition-transform duration-300 hover:scale-110',
        className
      )}
    >
      <Icon className="h-6 w-6" />
    </div>
  );
}
