import { cn } from '@/lib/utils';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 500,
}: FadeInProps) {
  return (
    <div
      className={cn('animate-fade-in opacity-0', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </div>
  );
}

interface SlideUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
  return (
    <div
      className={cn('animate-slide-up opacity-0', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </div>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
}

export function Stagger({ children, className, staggerMs = 80 }: StaggerProps) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <SlideUp key={i} delay={i * staggerMs}>
              {child}
            </SlideUp>
          ))
        : children}
    </div>
  );
}

export function AuthCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SlideUp>
      <div
        className={cn(
          'rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-xl shadow-zinc-900/5 backdrop-blur-xl transition-shadow duration-300 hover:shadow-2xl hover:shadow-zinc-900/10 dark:border-zinc-800/80 dark:bg-zinc-950/90 dark:shadow-black/20 dark:hover:shadow-black/30 sm:p-8',
          className
        )}
      >
        {children}
      </div>
    </SlideUp>
  );
}
