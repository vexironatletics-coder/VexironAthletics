import { APP_NAME, SITE_LOGO_PATH } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SiteLogoProps {
  className?: string;
  priority?: boolean;
}

/** Transparent SVG brand mark — use <img> so background stays clear on the header. */
export function SiteLogo({ className, priority }: SiteLogoProps) {
  return (
    <img
      src={SITE_LOGO_PATH}
      alt={APP_NAME}
      width={200}
      height={48}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={cn('h-10 sm:h-11 w-auto max-w-[min(52vw,220px)] object-contain object-left', className)}
    />
  );
}
