import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from '@/lib/types';

interface UsersResponse {
  users: User[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: 'men' | 'women' | 'children';
  image?: string;
  active: boolean;
}

export const userApi = createApi({
  reducerPath: 'userApi',
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
  tagTypes: ['User', 'Category'],
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateMe: builder.mutation<User, Partial<User>>({
      query: (body) => ({ url: '/users/me', method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: '/users/me/password', method: 'PUT', body }),
    }),
    getAllUsers: builder.query<UsersResponse, { page?: number } | void>({
      query: (params = {}) => `/users?page=${params?.page ?? 1}`,
      providesTags: ['User'],
    }),
    updateUserRole: builder.mutation<User, { id: string; role: 'user' | 'admin' }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
    updateUserStatus: builder.mutation<User, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),
    login: builder.mutation<
      { token: string; user: User },
      { email: string; password: string }
    >({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<
      { token: string; user: User },
      { name: string; email: string; password: string }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    clerkSync: builder.mutation<
      { token: string; user: User },
      { clerkUserId: string }
    >({
      query: (body) => ({ url: '/auth/clerk-sync', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<
      { message: string; resetUrl?: string },
      { email: string }
    >({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<
      { message: string },
      { token: string; password: string }
    >({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<
      Category,
      { name: string; parent: 'men' | 'women' | 'children' }
    >({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<
      Category,
      { id: string; data: Partial<Category> }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useLoginMutation,
  useRegisterMutation,
  useClerkSyncMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = userApi;
