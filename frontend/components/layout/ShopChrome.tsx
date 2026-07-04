'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ApiConnectionBanner } from '@/components/layout/ApiConnectionBanner';
import { FloatingSupportButtons } from '@/components/layout/FloatingSupportButtons';

export function ShopNavbar() {
  return (
    <>
      <ApiConnectionBanner />
      <Navbar />
    </>
  );
}

export function ShopFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard/admin')) return null;
  return <Footer />;
}

export function ShopFloatingSupport() {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard')) return null;
  return <FloatingSupportButtons />;
}
