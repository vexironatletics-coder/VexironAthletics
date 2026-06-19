import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, CartState } from '@/lib/types';
import { MAX_QTY_PER_LINE } from '@/lib/constants';
import { calculateShipping } from '@/lib/utils';

export const GUEST_CART_KEY = 'guest_cart';

const calcTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.price * item.qty, 0);

const capQty = (qty: number, maxStock?: number): number => {
  const stockCap = maxStock ?? MAX_QTY_PER_LINE;
  return Math.max(1, Math.min(qty, stockCap, MAX_QTY_PER_LINE));
};

const loadGuestCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items: CartItem[]): void => {
  if (typeof window !== 'undefined') {
    if (items.length === 0) {
      localStorage.removeItem(GUEST_CART_KEY);
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }
  }
};

const clearLegacyCart = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart');
  }
};

const initialState: CartState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload.map((item) => ({
        ...item,
        qty: capQty(item.qty, item.maxStock),
      }));
      state.total = calcTotal(state.items);
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      const maxStock = action.payload.maxStock;
      const existing = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );

      if (existing) {
        existing.maxStock = maxStock ?? existing.maxStock;
        existing.qty = capQty(existing.qty + action.payload.qty, existing.maxStock);
        existing.price = action.payload.price;
      } else {
        state.items.push({
          ...action.payload,
          qty: capQty(action.payload.qty, maxStock),
        });
      }

      state.total = calcTotal(state.items);
    },
    removeItem: (
      state,
      action: PayloadAction<{ productId: string; size: string; color: string }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.size === action.payload.size &&
            item.color === action.payload.color
          )
      );
      state.total = calcTotal(state.items);
    },
    updateQty: (
      state,
      action: PayloadAction<{
        productId: string;
        size: string;
        color: string;
        qty: number;
      }>
    ) => {
      const item = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.size === action.payload.size &&
          i.color === action.payload.color
      );
      if (item) {
        item.qty = capQty(action.payload.qty, item.maxStock);
      }
      state.total = calcTotal(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    hydrateGuestCart: (state) => {
      clearLegacyCart();
      const items = loadGuestCart();
      state.items = items;
      state.total = calcTotal(items);
    },
    persistGuestCart: (state) => {
      saveGuestCart(state.items);
    },
    clearGuestCartStorage: () => {
      saveGuestCart([]);
    },
  },
});

export const {
  setCart,
  addItem,
  removeItem,
  updateQty,
  clearCart,
  hydrateGuestCart,
  persistGuestCart,
  clearGuestCartStorage,
} = cartSlice.actions;

export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.qty, 0);

export const selectCartSubtotal = (state: { cart: CartState }) => state.cart.total;

export const selectShippingFee = (state: { cart: CartState }) =>
  calculateShipping(state.cart.total);

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.total + calculateShipping(state.cart.total);

export default cartSlice.reducer;
