import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AudienceVisit {
  _id: string;
  userIp: string;
  deviceIp: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  path: string;
  referrer: string;
  referrerHost: string;
  user?: { name: string; email: string };
  sessionId?: string;
  visitedAt: string;
}

export interface AudienceAnalytics {
  summary: {
    totalVisits: number;
    uniqueSessions: number;
    uniqueIps: number;
    days: number;
  };
  byCountry: { country: string; count: number; cityCount: number }[];
  byCity: {
    country: string;
    city: string;
    count: number;
    latitude?: number;
    longitude?: number;
  }[];
  byReferrer: { source: string; count: number }[];
  byDevice: { _id: string; count: number }[];
  byBrowser: { _id: string; count: number }[];
  dailyVisits: { _id: string; visits: number }[];
  recentVisits: AudienceVisit[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: 60,
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
  tagTypes: ['Audience'],
  endpoints: (builder) => ({
    trackVisit: builder.mutation<{ ok: boolean }, { path: string; referrer: string; sessionId: string }>({
      query: (body) => ({ url: '/analytics/track', method: 'POST', body }),
    }),
    getAudienceAnalytics: builder.query<AudienceAnalytics, { days?: number; page?: number } | void>({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params?.days) search.set('days', String(params.days));
        if (params?.page) search.set('page', String(params.page));
        return `/analytics/audience?${search.toString()}`;
      },
      providesTags: ['Audience'],
    }),
  }),
});

export const { useTrackVisitMutation, useGetAudienceAnalyticsQuery } = analyticsApi;
