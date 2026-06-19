'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useClerkSyncMutation } from '@/store/api/userApi';
import { setCredentials } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import { getDashboardPath } from '@/lib/constants';

export function AuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [clerkSync] = useClerkSyncMutation();
  const syncing = useRef(false);

  useEffect(() => {
    if (!isLoaded || syncing.current) return;

    const callbackUrl = searchParams.get('callbackUrl');
    const defaultPath = getDashboardPath(user?.role);

    if (token && user) {
      router.replace(callbackUrl ?? defaultPath);
      return;
    }

    if (isSignedIn && userId) {
      syncing.current = true;
      clerkSync({ clerkUserId: userId })
        .unwrap()
        .then((result) => {
          dispatch(setCredentials(result));
          const dest =
            callbackUrl ?? getDashboardPath(result.user.role);
          router.replace(dest);
        })
        .catch(() => {
          syncing.current = false;
        });
    }
  }, [
    isLoaded,
    isSignedIn,
    userId,
    token,
    user,
    clerkSync,
    dispatch,
    router,
    searchParams,
  ]);

  return null;
}
