import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { WishlistState } from '@/lib/types';

const WISHLIST_KEY = 'wishlist';

const loadWishlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (items: string[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }
};

const initialState: WishlistState = {
  items: loadWishlist(),
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const index = state.items.indexOf(action.payload);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
      saveWishlist(state.items);
    },
    hydrateWishlist: (state) => {
      state.items = loadWishlist();
    },
  },
});

export const { toggleWishlist, hydrateWishlist } = wishlistSlice.actions;

export const selectIsInWishlist = (productId: string) => (state: { wishlist: WishlistState }) =>
  state.wishlist.items.includes(productId);

export default wishlistSlice.reducer;
