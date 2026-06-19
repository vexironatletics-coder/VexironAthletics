import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Promotion {
  _id: string;
  title: string;
  message: string;
  couponCode?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const promotionApi = createApi({
  reducerPath: 'promotionApi',
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
  tagTypes: ['Promotion'],
  endpoints: (builder) => ({
    getActivePromotions: builder.query<Promotion[], void>({
      query: () => '/promotions/active',
      providesTags: ['Promotion'],
    }),
    getPromotions: builder.query<Promotion[], void>({
      query: () => '/promotions',
      providesTags: ['Promotion'],
    }),
    createPromotion: builder.mutation<
      Promotion,
      { title: string; message: string; couponCode?: string; sortOrder?: number }
    >({
      query: (body) => ({ url: '/promotions', method: 'POST', body }),
      invalidatesTags: ['Promotion'],
    }),
    updatePromotion: builder.mutation<Promotion, { id: string; data: Partial<Promotion> }>({
      query: ({ id, data }) => ({ url: `/promotions/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Promotion'],
    }),
    deletePromotion: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/promotions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Promotion'],
    }),
  }),
});

export const {
  useGetActivePromotionsQuery,
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} = promotionApi;
