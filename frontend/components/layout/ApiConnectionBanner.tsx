'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Health = {
  db?: string;
  mongodbConfigured?: boolean;
  message?: string;
};

export function ApiConnectionBanner() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    fetch(`${apiBase}/health`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Health | null) => setHealth(data))
      .catch(() => setHealth({ db: 'unreachable', mongodbConfigured: false }));
  }, []);

  if (!health || health.db === 'connected') return null;

  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div
      role="alert"
      className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <p className="font-semibold">Store catalog unavailable — database not connected</p>
      <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
        {health.mongodbConfigured === false
          ? 'MONGODB_URI is missing on the server. Add it in Hostinger Environment variables (copy from backend/.env).'
          : (health.message ??
            'MongoDB Atlas may be blocking the server IP — allow 0.0.0.0/0 in Atlas Network Access.')}
      </p>
      {isLocal ? (
        <p className="mt-2">
          Local fix: run{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900">npm run dev</code>{' '}
          from the project root (starts API on port 5000 and frontend on 3000).
        </p>
      ) : (
        <p className="mt-2">
          Check{' '}
          <Link href="/api/health" className="font-medium underline">
            /api/health
          </Link>{' '}
          after redeploy. See <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">docs/HOSTINGER_ENV.example</code>.
        </p>
      )}
    </div>
  );
}
