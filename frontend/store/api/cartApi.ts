import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { CartItem } from '@/lib/types';

interface CartResponse {
  items: CartItem[];
}

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    saveCart: builder.mutation<CartResponse, { items: CartItem[] }>({
      query: (body) => ({ url: '/cart', method: 'PUT', body }),
      invalidatesTags: ['Cart'],
    }),
    clearUserCart: builder.mutation<CartResponse, void>({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useLazyGetCartQuery,
  useSaveCartMutation,
  useClearUserCartMutation,
} = cartApi;
