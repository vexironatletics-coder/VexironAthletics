'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTrackVisitMutation } from '@/store/api/analyticsApi';

const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('audience_session');
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem('audience_session', id);
  }
  return id;
};

export function AudienceTracker() {
  const pathname = usePathname();
  const [trackVisit] = useTrackVisitMutation();
  const lastTracked = useRef<string>('');

  useEffect(() => {
    if (!pathname || pathname.startsWith('/dashboard/admin')) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    trackVisit({
      path: pathname,
      referrer: document.referrer,
      sessionId: getSessionId(),
    }).catch(() => undefined);
  }, [pathname, trackVisit]);

  return null;
}
