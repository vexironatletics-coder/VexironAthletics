import Image from 'next/image';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { FadeIn, SlideUp } from '@/components/ui/motion';

import { authSideShirtImage } from '@/lib/shirtImages';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className=" rounded-lg site-auth-bg min-h-[calc(100vh-4rem)]">
      <div className="mt-10 mb-10 p-3 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:block">
          <Image
            src={authSideShirtImage}
            alt="Shirt collection"
            fill
            className="object-cover animate-ken-burns"
            priority
            sizes="50vw"
          />
          <div className="theme-hero-bg absolute inset-0 opacity-80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-from)]/90 via-transparent to-transparent" />
          <FadeIn className="absolute bottom-0 p-10 text-white" delay={200}>
            <Link href="/" className="text-sm font-medium uppercase tracking-[0.2em] text-white/80 transition hover:text-white">
              {APP_NAME}
            </Link>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              Curated fashion for every moment
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/80">
              Premium men, women, and children collections with free delivery above ₨5,000.
            </p>
          </FadeIn>
        </div>

        <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <SlideUp className="mb-8 lg:hidden">
              <Link href="/" className="text-xl font-bold tracking-tight text-[var(--accent)] transition hover:opacity-80">
                {APP_NAME}
              </Link>
            </SlideUp>
            <SlideUp className="mb-8" delay={50}>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
            </SlideUp>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
