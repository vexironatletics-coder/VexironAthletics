'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-background/95 p-4 shadow-xl backdrop-blur-md sm:left-auto sm:right-6"
    >
      <div className="flex gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
        <div className="flex-1 space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            We use cookies and local storage for your cart, preferences, and site analytics.
            By continuing, you agree to our use of these technologies.{' '}
            <Link href="/privacy" className="font-medium text-foreground underline-offset-2 hover:underline">
              Learn more
            </Link>
          </p>
          <Button size="sm" variant="accent" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
