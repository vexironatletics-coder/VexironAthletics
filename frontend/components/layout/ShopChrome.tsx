'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';

function useIsAdminDashboard() {
  const pathname = usePathname();
  return pathname.startsWith('/dashboard/admin');
}

export function ShopNavbar() {
  if (useIsAdminDashboard()) return null;
  return <Navbar />;
}

export function ShopFooter() {
  if (useIsAdminDashboard()) return null;
  return <Footer />;
}

export function ShopWhatsApp() {
  if (useIsAdminDashboard()) return null;
  return <WhatsAppButton />;
}
