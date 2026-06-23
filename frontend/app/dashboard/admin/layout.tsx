'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { AdminDashboardShell } from '@/components/layout/AdminDashboardShell';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Wait a tick for StoreHydrator to restore from localStorage before redirecting.
  // If after hydration the user is not an admin, redirect them out.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!token || !user) {
        router.replace('/login?callbackUrl=/dashboard/admin');
        return;
      }
      if (user.role !== 'admin') {
        router.replace('/');
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [token, user, router]);

  // While hydrating (user not yet loaded), show a centered spinner.
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
