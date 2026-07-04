import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ChatConversation, ChatMessage } from '@/lib/types';
import { getGuestSessionId } from '@/lib/chatSession';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  prepareHeaders: (headers) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('X-Guest-Session', getGuestSessionId());
    }
    return headers;
  },
});

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery,
  tagTypes: ['ChatConversation', 'ChatMessages'],
  endpoints: (builder) => ({
    getOrCreateConversation: builder.mutation<
      { conversation: ChatConversation },
      { guestName?: string }
    >({
      query: (body) => ({
        url: '/chat/conversation',
        method: 'POST',
        body: { guestSessionId: getGuestSessionId(), ...body },
      }),
      invalidatesTags: ['ChatConversation'],
    }),
    getConversations: builder.query<{ conversations: ChatConversation[] }, void>({
      query: () => '/chat/conversations',
      providesTags: ['ChatConversation'],
    }),
    getMessages: builder.query<
      { messages: ChatMessage[]; hasMore: boolean; nextBefore?: string },
      { conversationId: string; before?: string; limit?: number }
    >({
      query: ({ conversationId, before, limit }) => {
        const params = new URLSearchParams();
        if (before) params.set('before', before);
        if (limit) params.set('limit', String(limit));
        const qs = params.toString();
        return `/chat/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`;
      },
      providesTags: (_r, _e, arg) => [{ type: 'ChatMessages', id: arg.conversationId }],
    }),
    markConversationRead: builder.mutation<{ ok: boolean }, string>({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['ChatConversation'],
    }),
  }),
});

export const {
  useGetOrCreateConversationMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useMarkConversationReadMutation,
} = chatApi;
