import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Product, ProductsResponse } from '@/lib/types';

interface SearchSuggestion {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  image: string;
}

interface SearchResponse extends ProductsResponse {
  facets?: Record<string, Record<string, number>>;
  engine?: 'meilisearch' | 'mongodb';
}

export const searchApi = createApi({
  reducerPath: 'searchApi',
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
  endpoints: (builder) => ({
    advancedSearch: builder.query<
      SearchResponse,
      {
        q?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        size?: string;
        color?: string;
        minRating?: number;
        sort?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: '/search',
        params,
      }),
    }),
    searchSuggest: builder.query<{ suggestions: SearchSuggestion[] }, string>({
      query: (q) => `/search/suggest?q=${encodeURIComponent(q)}`,
    }),
    visualSearch: builder.mutation<{ products: Product[]; detectedColors: string[] }, FormData>({
      query: (body) => ({ url: '/search/visual', method: 'POST', body }),
    }),
    getSearchAnalytics: builder.query<
      { topQueries: { _id: string; count: number }[]; totalSearches: number },
      number | void
    >({
      query: (days = 30) => `/search/analytics?days=${days}`,
    }),
  }),
});

export const {
  useAdvancedSearchQuery,
  useLazySearchSuggestQuery,
  useVisualSearchMutation,
  useGetSearchAnalyticsQuery,
} = searchApi;
