import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { SiteThemeSettings } from '@/lib/themes';

export interface CategoryImage {
  slug: string;
  label: string;
  image: string;
  imagePublicId?: string;
  href: string;
}

export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  image: string;
  imagePublicId?: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

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
  tagTypes: ['Settings', 'HeroSlides', 'CategoryImages'],
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
    getHeroSlides: builder.query<HeroSlide[], void>({
      query: () => '/settings/hero-slides',
      providesTags: ['HeroSlides'],
    }),
    updateHeroSlides: builder.mutation<HeroSlide[], { slides: HeroSlide[] }>({
      query: (body) => ({ url: '/settings/hero-slides', method: 'PUT', body }),
      invalidatesTags: ['HeroSlides'],
    }),
    uploadHeroSlideImage: builder.mutation<{ url: string; publicId: string }, FormData>({
      query: (formData) => ({
        url: '/settings/hero-slides/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),
    getCategoryImages: builder.query<CategoryImage[], void>({
      query: () => '/settings/category-images',
      providesTags: ['CategoryImages'],
    }),
    updateCategoryImages: builder.mutation<CategoryImage[], { categories: CategoryImage[] }>({
      query: (body) => ({ url: '/settings/category-images', method: 'PUT', body }),
      invalidatesTags: ['CategoryImages'],
    }),
    uploadCategoryImage: builder.mutation<{ url: string; publicId: string }, FormData>({
      query: (formData) => ({
        url: '/settings/category-images/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetPublicSettingsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetHeroSlidesQuery,
  useUpdateHeroSlidesMutation,
  useUploadHeroSlideImageMutation,
  useGetCategoryImagesQuery,
  useUpdateCategoryImagesMutation,
  useUploadCategoryImageMutation,
} = settingsApi;
