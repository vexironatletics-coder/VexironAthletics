import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SlideUp } from '@/components/ui/motion';
import { APP_NAME } from '@/lib/constants';

interface InfoPageLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  children: React.ReactNode;
}

export function InfoPageLayout({
  title,
  subtitle,
  breadcrumb,
  children,
}: InfoPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SlideUp>
        <nav className="mb-6 flex items-center gap-1 text-sm text-zinc-500">
          <Link href="/" className="transition hover:text-zinc-900 dark:hover:text-zinc-50">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-zinc-900 dark:text-zinc-50">{breadcrumb ?? title}</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        )}
      </SlideUp>
      <SlideUp delay={80} className="mt-10">
        <div className="space-y-4 text-zinc-600 dark:text-zinc-400 [&_a]:font-medium [&_a]:text-zinc-900 [&_a]:underline-offset-4 hover:[&_a]:underline dark:[&_a]:text-zinc-50 [&_strong]:text-zinc-900 dark:[&_strong]:text-zinc-50">
          {children}
        </div>
      </SlideUp>
      <SlideUp delay={120} className="mt-12 rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Questions? Reach us at{' '}
          <a href="mailto:contact@vexironathletics.com" className="font-medium text-zinc-900 dark:text-zinc-50">
            contact@vexironathletics.com
          </a>
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          © 2026 {APP_NAME}. All rights reserved.
        </p>
      </SlideUp>
    </div>
  );
}

export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 last:mb-0">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <div className="mt-3 space-y-3 text-zinc-600 dark:text-zinc-400">{children}</div>
    </section>
  );
}
