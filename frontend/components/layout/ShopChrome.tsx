'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { ApiConnectionBanner } from '@/components/layout/ApiConnectionBanner';
import { ChatWidget } from '@/components/chat/ChatWidget';

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

export function ShopWhatsApp() {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard/admin')) return null;
  return <WhatsAppButton />;
}

export function ShopChatWidget() {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard')) return null;
  return <ChatWidget />;
}
