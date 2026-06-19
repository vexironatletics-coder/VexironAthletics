'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCart,
  clearCart,
  hydrateGuestCart,
  persistGuestCart,
  clearGuestCartStorage,
  GUEST_CART_KEY,
} from '@/store/slices/cartSlice';
import {
  useLazyGetCartQuery,
  useSaveCartMutation,
} from '@/store/api/cartApi';
import type { RootState } from '@/store';
import type { CartItem } from '@/lib/types';

const loadGuestCartSnapshot = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export function CartSync() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [fetchCart] = useLazyGetCartQuery();
  const [saveCart] = useSaveCartMutation();

  const loadedForUser = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/admin')) return;
    if (token && user) return;

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    loadedForUser.current = null;
    dispatch(clearCart());
    dispatch(hydrateGuestCart());
  }, [token, user, dispatch, pathname]);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/admin')) return;
    if (!token || !user) return;
    if (loadedForUser.current === user.id) return;

    let cancelled = false;

    const loadUserCart = async () => {
      const guestItems = loadGuestCartSnapshot();

      try {
        const serverCart = await fetchCart().unwrap();
        let items = serverCart.items;

        if (items.length === 0 && guestItems.length > 0) {
          const saved = await saveCart({ items: guestItems }).unwrap();
          items = saved.items;
        }

        if (!cancelled) {
          skipNextSave.current = true;
          dispatch(setCart(items));
          loadedForUser.current = user.id;
          dispatch(clearGuestCartStorage());
        }
      } catch {
        if (!cancelled && guestItems.length > 0) {
          skipNextSave.current = true;
          dispatch(setCart(guestItems));
          loadedForUser.current = user.id;
        }
      }
    };

    loadUserCart();

    return () => {
      cancelled = true;
    };
  }, [token, user, fetchCart, saveCart, dispatch, pathname]);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/admin')) return;
    if (!token) {
      dispatch(persistGuestCart());
      return;
    }

    if (!user || loadedForUser.current !== user.id) return;

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      saveCart({ items: cartItems }).catch(() => undefined);
    }, 400);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [cartItems, token, user, saveCart, dispatch, pathname]);

  return null;
}
