'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  useGetOrCreateConversationMutation,
  useLazyGetMessagesQuery,
  useMarkConversationReadMutation,
} from '@/store/api/chatApi';
import {
  setActiveConversationId,
  setInitialMessages,
  prependMessages,
  setWidgetOpen,
} from '@/store/slices/chatSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { useChatSocket } from '@/hooks/useChatSocket';
import { getGuestSessionId, newClientMessageId } from '@/lib/chatSession';
import { ChatComposer, ChatMessageList, OnlineDot } from '@/components/chat/ChatMessageList';

/** Floating live-chat widget for customers (logged in or guest) */
export function ChatWidget({ inline = false }: { inline?: boolean }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const {
    widgetOpen,
    activeConversationId,
    messagesByConversation,
    typing,
    presence,
    connectionStatus,
  } = useSelector((state: RootState) => state.chat);

  const [draft, setDraft] = useState('');
  const [guestName, setGuestName] = useState('');
  const [needsName, setNeedsName] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextBefore, setNextBefore] = useState<string | undefined>();
  const listRef = useRef<HTMLDivElement>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const guestSessionId = getGuestSessionId();
  const [createConversation, { isLoading: starting }] = useGetOrCreateConversationMutation();
  const [fetchMessages] = useLazyGetMessagesQuery();
  const [markRead] = useMarkConversationReadMutation();

  const { joinConversation, sendMessage, emitTyping, emitStopTyping, emitMarkRead } =
    useChatSocket({
      token,
      guestSessionId: user ? undefined : guestSessionId,
      role: 'customer',
      enabled: widgetOpen,
    });

  const messages = activeConversationId
    ? messagesByConversation[activeConversationId] ?? []
    : [];
  const typingAdmin = activeConversationId ? typing[activeConversationId] === 'admin' : false;
  const adminOnline = activeConversationId
    ? presence[activeConversationId]?.adminOnline ?? false
    : false;

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const loadHistory = useCallback(
    async (conversationId: string, before?: string) => {
      setLoadingHistory(true);
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
        setLoadingHistory(false);
      }
    },
    [dispatch, fetchMessages]
  );

  const openChat = async () => {
    dispatch(setWidgetOpen(true));
    if (activeConversationId) {
      await joinConversation(activeConversationId);
      return;
    }
    if (!user && !guestName.trim()) {
      setNeedsName(true);
      return;
    }
    await startConversation();
  };

  const startConversation = async () => {
    try {
      const { conversation } = await createConversation({
        guestName: user?.name ?? (guestName.trim() || 'Guest'),
      }).unwrap();
      dispatch(setActiveConversationId(conversation._id));
      setNeedsName(false);
      await loadHistory(conversation._id);
      const joined = await joinConversation(conversation._id);
      if (!joined.ok) console.warn('Chat join failed:', joined.error);
    } catch (err) {
      console.error('Failed to start chat', err);
    }
  };

  useEffect(() => {
    if (!widgetOpen || activeConversationId || starting) return;
    if (user) {
      void startConversation();
    } else if (!needsName) {
      setNeedsName(true);
    }
  }, [widgetOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!widgetOpen || !activeConversationId) return;
    joinConversation(activeConversationId);
    loadHistory(activeConversationId);
  }, [widgetOpen, activeConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (!widgetOpen || !activeConversationId) return;
    markRead(activeConversationId);
    emitMarkRead(activeConversationId);
  }, [widgetOpen, activeConversationId, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeConversationId) return;
    setDraft('');
    emitStopTyping(activeConversationId);
    const clientMessageId = newClientMessageId();
    await sendMessage(activeConversationId, text, clientMessageId);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!activeConversationId) return;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      if (value.trim()) emitTyping(activeConversationId);
      else emitStopTyping(activeConversationId);
    }, 300);
  };

  const btnClass =
    'flex h-14 w-14 items-center justify-center rounded-full bg-[#0A2947] text-[#F3E4C9] shadow-xl transition hover:scale-105 hover:shadow-2xl';

  if (!widgetOpen) {
    return (
      <button
        type="button"
        onClick={openChat}
        className={inline ? btnClass : `fixed bottom-24 right-6 z-50 ${btnClass}`}
        aria-label="Open live chat"
        title="Live Chat"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Live Chat</span>
      </button>
    );
  }

  const panelClass = inline
    ? 'absolute bottom-full right-0 mb-3 flex w-[min(calc(100vw-3rem),380px)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl'
    : 'fixed bottom-24 right-6 z-50 flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl';

  return (
    <div className={inline ? 'relative min-h-14 w-14' : undefined}>
    <div className={panelClass}>
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0A2947] px-4 py-3 text-[#F3E4C9]">
        <div className="flex items-center gap-2">
          <OnlineDot online={adminOnline} />
          <div>
            <p className="text-sm font-semibold">Live Support</p>
            <p className="text-[10px] opacity-70">
              {connectionStatus === 'connected'
                ? adminOnline
                  ? 'Admin online'
                  : 'We typically reply within minutes'
                : 'Reconnecting…'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => dispatch(setWidgetOpen(false))}
            className="rounded-lg p-1.5 hover:bg-white/10"
            aria-label="Minimize chat"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => dispatch(setWidgetOpen(false))}
            className="rounded-lg p-1.5 hover:bg-white/10"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Guest name prompt */}
      {needsName && !activeConversationId && (
        <div className="space-y-3 p-4">
          <p className="text-sm text-[var(--muted)]">Enter your name to start chatting:</p>
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={!guestName.trim() || starting}
            onClick={startConversation}
            className="w-full rounded-xl bg-[#0A2947] py-2 text-sm font-medium text-[#F3E4C9] disabled:opacity-50"
          >
            {starting ? 'Starting…' : 'Start Chat'}
          </button>
        </div>
      )}

      {/* Messages */}
      {activeConversationId && (
        <>
          <div className="flex max-h-80 min-h-64 flex-col">
            <ChatMessageList
              messages={messages}
              viewerRole="customer"
              listRef={listRef}
              hasMore={hasMore}
              loadingMore={loadingHistory}
              onLoadMore={() =>
                nextBefore && loadHistory(activeConversationId, nextBefore)
              }
            />
            {typingAdmin && (
              <p className="px-4 pb-2 text-xs italic text-[var(--muted)]">Admin is typing…</p>
            )}
          </div>
          <ChatComposer
            value={draft}
            onChange={handleDraftChange}
            onSend={handleSend}
            disabled={connectionStatus !== 'connected'}
          />
        </>
      )}

      {!needsName && !activeConversationId && starting && (
        <p className="p-6 text-center text-sm text-[var(--muted)]">Connecting…</p>
      )}
    </div>
    </div>
  );
}
