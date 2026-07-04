import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ChatConversation, ChatMessage, ChatPresence } from '@/lib/types';

interface ChatUiState {
  widgetOpen: boolean;
  /** Customer's active conversation id */
  activeConversationId: string | null;
  /** Admin selected conversation */
  selectedConversationId: string | null;
  /** Messages keyed by conversationId — normalized to reduce re-renders */
  messagesByConversation: Record<string, ChatMessage[]>;
  /** Latest conversation list (admin + customer updates via socket) */
  conversations: ChatConversation[];
  typing: Record<string, 'customer' | 'admin' | null>;
  presence: Record<string, ChatPresence>;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected';
}

const initialState: ChatUiState = {
  widgetOpen: false,
  activeConversationId: null,
  selectedConversationId: null,
  messagesByConversation: {},
  conversations: [],
  typing: {},
  presence: {},
  connectionStatus: 'idle',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setWidgetOpen(state, action: PayloadAction<boolean>) {
      state.widgetOpen = action.payload;
    },
    setActiveConversationId(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
    setSelectedConversationId(state, action: PayloadAction<string | null>) {
      state.selectedConversationId = action.payload;
    },
    setConnectionStatus(
      state,
      action: PayloadAction<ChatUiState['connectionStatus']>
    ) {
      state.connectionStatus = action.payload;
    },
    setConversations(state, action: PayloadAction<ChatConversation[]>) {
      state.conversations = action.payload;
    },
    upsertConversation(state, action: PayloadAction<ChatConversation>) {
      const idx = state.conversations.findIndex((c) => c._id === action.payload._id);
      if (idx >= 0) state.conversations[idx] = action.payload;
      else state.conversations.unshift(action.payload);
      state.conversations.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    },
    /** Prepend older messages (pagination) */
    prependMessages(
      state,
      action: PayloadAction<{ conversationId: string; messages: ChatMessage[] }>
    ) {
      const { conversationId, messages } = action.payload;
      const existing = state.messagesByConversation[conversationId] ?? [];
      const ids = new Set(existing.map((m) => m.clientMessageId));
      const merged = [...messages.filter((m) => !ids.has(m.clientMessageId)), ...existing];
      merged.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      state.messagesByConversation[conversationId] = merged;
    },
    /** Append a new realtime message (dedupe by clientMessageId) */
    appendMessage(state, action: PayloadAction<ChatMessage>) {
      const msg = action.payload;
      const list = state.messagesByConversation[msg.conversationId] ?? [];
      if (list.some((m) => m.clientMessageId === msg.clientMessageId)) return;
      state.messagesByConversation[msg.conversationId] = [...list, msg];
    },
    setInitialMessages(
      state,
      action: PayloadAction<{ conversationId: string; messages: ChatMessage[] }>
    ) {
      state.messagesByConversation[action.payload.conversationId] = action.payload.messages;
    },
    setTyping(
      state,
      action: PayloadAction<{ conversationId: string; role: 'customer' | 'admin' | null }>
    ) {
      state.typing[action.payload.conversationId] = action.payload.role;
    },
    setPresence(state, action: PayloadAction<ChatPresence>) {
      state.presence[action.payload.conversationId] = action.payload;
    },
    markMessagesRead(
      state,
      action: PayloadAction<{ conversationId: string; reader: 'customer' | 'admin' }>
    ) {
      const { conversationId, reader } = action.payload;
      const list = state.messagesByConversation[conversationId];
      if (!list) return;
      state.messagesByConversation[conversationId] = list.map((m) => ({
        ...m,
        readByCustomer: reader === 'customer' ? true : m.readByCustomer,
        readByAdmin: reader === 'admin' ? true : m.readByAdmin,
      }));
      const conv = state.conversations.find((c) => c._id === conversationId);
      if (conv) {
        if (reader === 'admin') conv.unreadAdmin = 0;
        else conv.unreadCustomer = 0;
      }
    },
  },
});

export const {
  setWidgetOpen,
  setActiveConversationId,
  setSelectedConversationId,
  setConnectionStatus,
  setConversations,
  upsertConversation,
  prependMessages,
  appendMessage,
  setInitialMessages,
  setTyping,
  setPresence,
  markMessagesRead,
} = chatSlice.actions;

export default chatSlice.reducer;
