import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Product,
  ProductFilters,
  ProductReview,
  ProductsResponse,
} from '@/lib/types';

export const productApi = createApi({
  reducerPath: 'productApi',
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
  tagTypes: ['Product', 'Analytics'],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        const f = filters ?? {};
        Object.entries(f).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.set(key, String(value));
          }
        });
        return `/products?${params.toString()}`;
      },
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query<
      { product: Product; reviews: ProductReview[] },
      string
    >({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    searchProducts: builder.query<ProductsResponse, string>({
      query: (search) => `/products?search=${encodeURIComponent(search)}`,
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    createProduct: builder.mutation<Product, FormData>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Analytics'],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Analytics'],
    }),
    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Analytics'],
    }),
    createReview: builder.mutation<
      unknown,
      { id: string; rating: number; title: string; comment: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/products/${id}/review`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Product', id }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useSearchProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
} = productApi;
