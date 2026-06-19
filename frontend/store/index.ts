import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import themePreviewReducer from './slices/themePreviewSlice';
import { productApi } from './api/productApi';
import { orderApi } from './api/orderApi';
import { userApi } from './api/userApi';
import { cartApi } from './api/cartApi';
import { searchApi } from './api/searchApi';
import { couponApi } from './api/couponApi';
import { promotionApi } from './api/promotionApi';
import { settingsApi } from './api/settingsApi';
import { loyaltyApi } from './api/loyaltyApi';
import { analyticsApi } from './api/analyticsApi';

const apiReducers = [
  productApi,
  orderApi,
  userApi,
  cartApi,
  searchApi,
  couponApi,
  promotionApi,
  settingsApi,
  loyaltyApi,
  analyticsApi,
] as const;

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
      themePreview: themePreviewReducer,
      [productApi.reducerPath]: productApi.reducer,
      [orderApi.reducerPath]: orderApi.reducer,
      [userApi.reducerPath]: userApi.reducer,
      [cartApi.reducerPath]: cartApi.reducer,
      [searchApi.reducerPath]: searchApi.reducer,
      [couponApi.reducerPath]: couponApi.reducer,
      [promotionApi.reducerPath]: promotionApi.reducer,
      [settingsApi.reducerPath]: settingsApi.reducer,
      [loyaltyApi.reducerPath]: loyaltyApi.reducer,
      [analyticsApi.reducerPath]: analyticsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // RTK Query may store FormData (uploads) and Blob (PDF exports) in actions/cache
          ignoredActionPaths: ['meta.arg', 'meta.baseQueryMeta', 'payload'],
          ignoredPaths: apiReducers.flatMap((api) => [
            `${api.reducerPath}.queries`,
            `${api.reducerPath}.mutations`,
          ]).concat(['orderApi.queries']),
        },
      }).concat(
        productApi.middleware,
        orderApi.middleware,
        userApi.middleware,
        cartApi.middleware,
        searchApi.middleware,
        couponApi.middleware,
        promotionApi.middleware,
        settingsApi.middleware,
        loyaltyApi.middleware,
        analyticsApi.middleware
      ),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
