'use client';

import Link from 'next/link';
import { Shield, Copy, Check, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ADMIN_DEMO_CREDENTIALS } from '@/lib/constants';

interface AdminAccessCardProps {
  onUseCredentials?: () => void;
}

export function AdminAccessCard({ onUseCredentials }: AdminAccessCardProps) {
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const copy = async (value: string, field: 'email' | 'password') => {
    await navigator.clipboard.writeText(value);
    setCopied(field);
    toast.success(`${field === 'email' ? 'Email' : 'Password'} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
          <Shield className="h-4 w-4 text-amber-700 dark:text-amber-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Admin demo access</p>
          <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
            Sign in with these credentials to open the admin dashboard.
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm dark:bg-zinc-900/80">
              <div className="min-w-0">
                <span className="text-xs text-zinc-500">Email</span>
                <p className="truncate font-mono text-zinc-900 dark:text-zinc-50">
                  {ADMIN_DEMO_CREDENTIALS.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(ADMIN_DEMO_CREDENTIALS.email, 'email')}
                className="shrink-0 rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label="Copy admin email"
              >
                {copied === 'email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm dark:bg-zinc-900/80">
              <div>
                <span className="text-xs text-zinc-500">Password</span>
                <p className="font-mono text-zinc-900 dark:text-zinc-50">
                  {ADMIN_DEMO_CREDENTIALS.password}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(ADMIN_DEMO_CREDENTIALS.password, 'password')}
                className="shrink-0 rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label="Copy admin password"
              >
                {copied === 'password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {onUseCredentials && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-2 border-amber-300 bg-white/80 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-zinc-900/80 dark:text-amber-100 dark:hover:bg-amber-950/50"
              onClick={onUseCredentials}
            >
              <LogIn className="h-4 w-4" />
              Fill credentials & sign in
            </Button>
          )}
          <Link
            href="/dashboard/admin"
            className="mt-3 inline-block text-xs font-medium text-amber-900 underline-offset-4 hover:underline dark:text-amber-200"
          >
            Go to admin dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
