import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface LoyaltyProfile {
  points: number;
  lifetimePointsEarned: number;
  tier: 'bronze' | 'silver' | 'gold';
  referralCode: string;
  referrals: number;
  tiers: Record<string, { min: number; benefits: string }>;
}

export const loyaltyApi = createApi({
  reducerPath: 'loyaltyApi',
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
  tagTypes: ['Loyalty'],
  endpoints: (builder) => ({
    getLoyaltyProfile: builder.query<LoyaltyProfile, void>({
      query: () => '/loyalty/profile',
      providesTags: ['Loyalty'],
    }),
    applyReferral: builder.mutation<{ message: string }, { referralCode: string }>({
      query: (body) => ({ url: '/loyalty/referral', method: 'POST', body }),
      invalidatesTags: ['Loyalty'],
    }),
    getReferralStats: builder.query<
      { referralCode: string; referredUsers: { name: string; email: string }[]; total: number },
      void
    >({
      query: () => '/loyalty/referrals',
    }),
  }),
});

export const {
  useGetLoyaltyProfileQuery,
  useApplyReferralMutation,
  useGetReferralStatsQuery,
} = loyaltyApi;
