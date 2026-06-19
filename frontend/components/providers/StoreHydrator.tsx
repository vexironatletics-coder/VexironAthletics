'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateAuth } from '@/store/slices/authSlice';
import { hydrateWishlist } from '@/store/slices/wishlistSlice';

export function StoreHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
    dispatch(hydrateWishlist());
  }, [dispatch]);

  return null;
}
