import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { SiteThemeSettings } from '@/lib/themes';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
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
  tagTypes: ['Settings'],
  endpoints: (builder) => ({
    getPublicSettings: builder.query<SiteThemeSettings, void>({
      query: () => '/settings/public',
      providesTags: ['Settings'],
    }),
    getSettings: builder.query<SiteThemeSettings & { _id?: string; updatedAt?: string }, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<SiteThemeSettings, Partial<SiteThemeSettings>>({
      query: (body) => ({ url: '/settings', method: 'PUT', body }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetPublicSettingsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApi;
