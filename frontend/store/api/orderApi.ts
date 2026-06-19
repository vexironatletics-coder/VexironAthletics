import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Order } from '@/lib/types';

interface OrdersResponse {
  orders: Order[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

import type { ShippingAddress } from '@/lib/types';

interface CreateOrderPayload {
  items: { productId: string; size: string; color: string; qty: number }[];
  shippingAddress: ShippingAddress;
  notes?: string;
  couponCode?: string;
  pointsToRedeem?: number;
}

interface LowStockProduct {
  _id: string;
  name: string;
  stock: number;
  category: string;
  price: number;
}

interface AnalyticsResponse {
  revenue: number;
  orders: number;
  products: number;
  users: number;
  recentOrders: Order[];
  dailySales: { _id: string; sales: number; orders: number }[];
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
}

export const orderApi = createApi({
  reducerPath: 'orderApi',
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
  tagTypes: ['Order', 'Analytics'],
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order'],
    }),
    getMyOrders: builder.query<
      OrdersResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', String(params.page));
        if (params?.limit) search.set('limit', String(params.limit));
        return `/orders/my?${search.toString()}`;
      },
      providesTags: ['Order'],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    getAllOrders: builder.query<
      OrdersResponse,
      { status?: string; page?: number; limit?: number } | void
    >({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params?.status) search.set('status', params.status);
        if (params?.page) search.set('page', String(params.page));
        if (params?.limit) search.set('limit', String(params.limit));
        return `/orders?${search.toString()}`;
      },
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation<
      Order,
      { id: string; status: Order['status'] }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),
    getAnalytics: builder.query<AnalyticsResponse, void>({
      query: () => '/orders/analytics',
      providesTags: ['Analytics'],
    }),
    downloadInvoice: builder.query<Blob, string>({
      query: (id) => ({
        url: `/orders/${id}/invoice`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    downloadDispatchReceipt: builder.query<Blob, string>({
      query: (id) => ({
        url: `/orders/${id}/dispatch-receipt`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    exportOrdersReport: builder.query<Blob, { startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: `/orders/export/pdf?${new URLSearchParams(params as Record<string, string>).toString()}`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetAnalyticsQuery,
  useLazyDownloadInvoiceQuery,
  useLazyDownloadDispatchReceiptQuery,
  useLazyExportOrdersReportQuery,
} = orderApi;
