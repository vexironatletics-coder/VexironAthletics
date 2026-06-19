import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Coupon {
  _id: string;
  code: string;
  type: 'percent' | 'fixed' | 'free_shipping';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
}

export const couponApi = createApi({
  reducerPath: 'couponApi',
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
  tagTypes: ['Coupon'],
  endpoints: (builder) => ({
    validateCoupon: builder.mutation<
      { code: string; type: string; discount: number; freeShipping: boolean },
      { code: string; subtotal: number }
    >({
      query: (body) => ({ url: '/coupons/validate', method: 'POST', body }),
    }),
    getCoupons: builder.query<Coupon[], void>({
      query: () => '/coupons',
      providesTags: ['Coupon'],
    }),
    createCoupon: builder.mutation<Coupon, Partial<Coupon>>({
      query: (body) => ({ url: '/coupons', method: 'POST', body }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Coupon'],
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
