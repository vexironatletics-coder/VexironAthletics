'use client';

import { useEffect, useState } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useClerkSyncMutation } from '@/store/api/userApi';
import { setCredentials } from '@/store/slices/authSlice';
import { getDashboardPath } from '@/lib/constants';

export default function SSOCallbackContent() {
  const { isLoaded, userId } = useAuth();
  const clerk = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [clerkSync] = useClerkSyncMutation();
  const [status, setStatus] = useState('Finishing sign in...');
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    if (handled) return;

    const completeAuth = async () => {
      const hasOAuthParams =
        searchParams.has('code') ||
        searchParams.has('__clerk_status') ||
        searchParams.has('rotating_token_nonce');

      if (hasOAuthParams && clerk.loaded) {
        setStatus('Verifying with Google...');
        try {
          await clerk.handleRedirectCallback({
            signInFallbackRedirectUrl: getDashboardPath(),
          });
        } catch {
          // Callback may already be processed
        }
      }

      if (!isLoaded) return;

      if (!userId) {
        setStatus('Sign in could not be completed.');
        setTimeout(() => router.replace('/login'), 2000);
        setHandled(true);
        return;
      }

      try {
        setStatus('Setting up your profile...');
        const result = await clerkSync({ clerkUserId: userId }).unwrap();
        dispatch(setCredentials(result));
        setStatus('Welcome! Redirecting to your profile...');
        toast.success(`Welcome, ${result.user.name}!`);
        setHandled(true);
        router.replace(getDashboardPath(result.user.role));
      } catch {
        toast.error('Could not complete sign in.');
        setHandled(true);
        router.replace('/login');
      }
    };

    completeAuth();
  }, [
    handled,
    isLoaded,
    userId,
    clerk,
    clerkSync,
    dispatch,
    router,
    searchParams,
  ]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        {handled && status.includes('Welcome') ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        ) : (
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-zinc-400" />
        )}
        <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">{status}</p>
      </div>
    </div>
  );
}
