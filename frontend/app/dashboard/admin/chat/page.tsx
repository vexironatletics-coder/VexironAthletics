'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare, RefreshCw } from 'lucide-react';
import type { RootState, AppDispatch } from '@/store';
import {
  useGetConversationsQuery,
  useLazyGetMessagesQuery,
  useMarkConversationReadMutation,
} from '@/store/api/chatApi';
import {
  prependMessages,
  setConversations,
  setInitialMessages,
  setSelectedConversationId,
} from '@/store/slices/chatSlice';
import { useChatSocket } from '@/hooks/useChatSocket';
import { newClientMessageId } from '@/lib/chatSession';
import { ChatComposer, ChatMessageList, OnlineDot } from '@/components/chat/ChatMessageList';
import { cn } from '@/lib/utils';

export default function AdminChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const {
    selectedConversationId,
    conversations,
    messagesByConversation,
    typing,
    presence,
    connectionStatus,
  } = useSelector((state: RootState) => state.chat);

  const [draft, setDraft] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [nextBefore, setNextBefore] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, refetch } = useGetConversationsQuery(undefined, {
    pollingInterval: 30000,
  });
  const [fetchMessages] = useLazyGetMessagesQuery();
  const [markRead] = useMarkConversationReadMutation();

  const { joinConversation, sendMessage, emitTyping, emitStopTyping, emitMarkRead } =
    useChatSocket({
      token,
      role: 'admin',
      enabled: true,
    });

  const selected = conversations.find((c) => c._id === selectedConversationId);
  const messages = selectedConversationId
    ? messagesByConversation[selectedConversationId] ?? []
    : [];
  const customerTyping =
    selectedConversationId ? typing[selectedConversationId] === 'customer' : false;
  const customerOnline = selectedConversationId
    ? presence[selectedConversationId]?.customerOnline ?? false
    : false;

  useEffect(() => {
    if (data?.conversations) {
      dispatch(setConversations(data.conversations));
    }
  }, [data, dispatch]);

  const loadMessages = useCallback(
    async (conversationId: string, before?: string) => {
      setLoadingMore(true);
      try {
        const result = await fetchMessages({ conversationId, before, limit: 30 }).unwrap();
        if (before) {
          dispatch(prependMessages({ conversationId, messages: result.messages }));
        } else {
          dispatch(setInitialMessages({ conversationId, messages: result.messages }));
        }
        setHasMore(result.hasMore);
        setNextBefore(result.nextBefore);
      } finally {
        setLoadingMore(false);
      }
    },
    [dispatch, fetchMessages]
  );

  const selectConversation = async (id: string) => {
    dispatch(setSelectedConversationId(id));
    await joinConversation(id);
    await loadMessages(id);
    markRead(id);
    emitMarkRead(id);
  };

  useEffect(() => {
    if (!selectedConversationId) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, selectedConversationId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedConversationId) return;
    setDraft('');
    emitStopTyping(selectedConversationId);
    await sendMessage(selectedConversationId, text, newClientMessageId());
    refetch();
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!selectedConversationId) return;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      if (value.trim()) emitTyping(selectedConversationId);
      else emitStopTyping(selectedConversationId);
    }, 300);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Chat</h1>
          <p className="text-sm text-[var(--muted)]">
            Real-time support — {connectionStatus === 'connected' ? 'connected' : 'reconnecting…'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--secondary)]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid min-h-[520px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] lg:grid-cols-[280px_1fr]">
        {/* Conversation list */}
        <aside className="border-b border-[var(--border)] lg:border-b-0 lg:border-r">
          <div className="border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Active chats ({conversations.length})
          </div>
          <div className="max-h-[480px] overflow-y-auto">
            {isLoading && (
              <p className="p-4 text-sm text-[var(--muted)]">Loading conversations…</p>
            )}
            {!isLoading && conversations.length === 0 && (
              <p className="p-6 text-center text-sm text-[var(--muted)]">
                No active chats yet. Customers will appear here when they message you.
              </p>
            )}
            {conversations.map((conv) => (
              <button
                key={conv._id}
                type="button"
                onClick={() => selectConversation(conv._id)}
                className={cn(
                  'flex w-full flex-col gap-0.5 border-b border-[var(--border)] px-4 py-3 text-left transition hover:bg-[var(--secondary)]',
                  selectedConversationId === conv._id && 'bg-[var(--secondary)]'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-[var(--foreground)]">
                    {conv.customerName}
                  </span>
                  {conv.unreadAdmin > 0 && (
                    <span className="shrink-0 rounded-full bg-[#8B5E3C] px-2 py-0.5 text-[10px] font-bold text-white">
                      {conv.unreadAdmin}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-[var(--muted)]">
                  {conv.lastMessage ?? 'New conversation'}
                </p>
                <p className="text-[10px] text-[var(--muted)]">
                  {new Date(conv.lastMessageAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </aside>

        {/* Active chat */}
        <section className="flex min-h-[400px] flex-col">
          {!selectedConversationId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-[var(--muted)]">
              <MessageSquare className="h-12 w-12 opacity-30" />
              <p>Select a conversation to start replying</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                <OnlineDot online={customerOnline} />
                <div>
                  <p className="font-semibold">{selected?.customerName}</p>
                  {selected?.customerEmail && (
                    <p className="text-xs text-[var(--muted)]">{selected.customerEmail}</p>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <ChatMessageList
                  messages={messages}
                  viewerRole="admin"
                  listRef={listRef}
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  onLoadMore={() =>
                    selectedConversationId &&
                    nextBefore &&
                    loadMessages(selectedConversationId, nextBefore)
                  }
                />
                {customerTyping && (
                  <p className="px-4 pb-2 text-xs italic text-[var(--muted)]">
                    Customer is typing…
                  </p>
                )}
              </div>

              <ChatComposer
                value={draft}
                onChange={handleDraftChange}
                onSend={handleSend}
                disabled={connectionStatus !== 'connected'}
                placeholder="Reply to customer…"
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
