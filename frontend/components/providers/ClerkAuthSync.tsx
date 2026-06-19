'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useDispatch, useSelector } from 'react-redux';
import { useClerkSyncMutation } from '@/store/api/userApi';
import { setCredentials } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

/** Keeps Redux/API JWT in sync when the user is signed in via Clerk. */
export function ClerkAuthSync() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [clerkSync] = useClerkSyncMutation();
  const syncing = useRef(false);
  const lastSyncedClerkId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      syncing.current = false;
      lastSyncedClerkId.current = null;
      return;
    }

    if (token && user) {
      lastSyncedClerkId.current = userId;
      return;
    }

    if (syncing.current || lastSyncedClerkId.current === userId) return;

    syncing.current = true;
    clerkSync({ clerkUserId: userId })
      .unwrap()
      .then((result) => {
        dispatch(setCredentials(result));
        lastSyncedClerkId.current = userId;
      })
      .catch(() => {
        lastSyncedClerkId.current = null;
      })
      .finally(() => {
        syncing.current = false;
      });
  }, [isLoaded, isSignedIn, userId, token, user, clerkSync, dispatch]);

  return null;
}
