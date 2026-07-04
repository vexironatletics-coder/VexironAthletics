'use client';

/**
 * useChatSocket — manages Socket.IO connection lifecycle for live chat.
 *
 * AUTH PLUG-IN: pass `token` from Redux authSlice (same JWT as REST API).
 * Guests: pass `guestSessionId` from lib/chatSession.ts.
 *
 * Reconnect: socket.io-client auto-reconnects; messages dedupe via clientMessageId on server.
 */
import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import {
  appendMessage,
  markMessagesRead,
  setConnectionStatus,
  setPresence,
  setTyping,
  upsertConversation,
} from '@/store/slices/chatSlice';
import type { ChatMessage } from '@/lib/types';
import { getSocketBaseUrl } from '@/lib/socketUrl';

type ChatSocketRole = 'admin' | 'customer';

interface UseChatSocketOptions {
  token?: string | null;
  guestSessionId?: string;
  role: ChatSocketRole;
  enabled?: boolean;
}

let sharedSocket: Socket | null = null;
let sharedKey = '';

export function useChatSocket({
  token,
  guestSessionId,
  role,
  enabled = true,
}: UseChatSocketOptions) {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectKey = `${role}:${token ?? ''}:${guestSessionId ?? ''}`;

  useEffect(() => {
    if (!enabled) return;
    if (!token && !guestSessionId) return;

    if (sharedSocket && sharedKey === connectKey) {
      socketRef.current = sharedSocket;
      dispatch(setConnectionStatus(sharedSocket.connected ? 'connected' : 'connecting'));
      return;
    }

    if (sharedSocket) {
      sharedSocket.removeAllListeners();
      sharedSocket.disconnect();
      sharedSocket = null;
    }

    dispatch(setConnectionStatus('connecting'));

    const socket = io(getSocketBaseUrl(), {
      path: '/socket.io',
      auth: {
        token: token ?? undefined,
        guestSessionId: guestSessionId ?? undefined,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    sharedSocket = socket;
    sharedKey = connectKey;
    socketRef.current = socket;

    socket.on('connect', () => dispatch(setConnectionStatus('connected')));
    socket.on('disconnect', () => dispatch(setConnectionStatus('disconnected')));
    socket.on('connect_error', () => dispatch(setConnectionStatus('disconnected')));

    socket.on('message', (msg: ChatMessage) => {
      dispatch(appendMessage(msg));
    });

    socket.on('conversation_updated', (payload: { conversation: import('@/lib/types').ChatConversation }) => {
      dispatch(upsertConversation(payload.conversation));
    });

    socket.on('typing', (payload: { conversationId: string; role: 'customer' | 'admin' }) => {
      dispatch(setTyping({ conversationId: payload.conversationId, role: payload.role }));
    });

    socket.on('stop_typing', (payload: { conversationId: string }) => {
      dispatch(setTyping({ conversationId: payload.conversationId, role: null }));
    });

    socket.on('presence', (payload: { conversationId: string; customerOnline: boolean; adminOnline: boolean }) => {
      dispatch(setPresence(payload));
    });

    socket.on('messages_read', (payload: { conversationId: string; reader: 'customer' | 'admin' }) => {
      dispatch(markMessagesRead(payload));
    });

    return () => {
      // Keep shared socket alive while chat is mounted elsewhere
    };
  }, [connectKey, dispatch, enabled, guestSessionId, token]);

  const joinConversation = useCallback(
    (conversationId: string): Promise<{ ok: boolean; error?: string }> =>
      new Promise((resolve) => {
        const socket = socketRef.current ?? sharedSocket;
        if (!socket?.connected) {
          resolve({ ok: false, error: 'Not connected' });
          return;
        }
        socket.emit('join_conversation', { conversationId }, (res: { ok: boolean; error?: string }) => {
          resolve(res ?? { ok: false });
        });
      }),
    []
  );

  const sendMessage = useCallback(
    (conversationId: string, body: string, clientMessageId: string): Promise<{ ok: boolean; message?: ChatMessage; error?: string }> =>
      new Promise((resolve) => {
        const socket = socketRef.current ?? sharedSocket;
        if (!socket?.connected) {
          resolve({ ok: false, error: 'Not connected' });
          return;
        }
        socket.emit(
          'send_message',
          { conversationId, body, clientMessageId },
          (res: { ok: boolean; message?: ChatMessage; error?: string }) => {
            if (res?.ok && res.message) {
              dispatch(appendMessage(res.message));
            }
            resolve(res ?? { ok: false });
          }
        );
      }),
    [dispatch]
  );

  /** Debounced typing — call on input change */
  const emitTyping = useCallback((conversationId: string) => {
    const socket = socketRef.current ?? sharedSocket;
    if (!socket?.connected) return;
    socket.emit('typing', { conversationId });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId });
    }, 2000);
  }, []);

  const emitStopTyping = useCallback((conversationId: string) => {
    const socket = socketRef.current ?? sharedSocket;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    socket?.emit('stop_typing', { conversationId });
  }, []);

  const emitMarkRead = useCallback((conversationId: string) => {
    const socket = socketRef.current ?? sharedSocket;
    socket?.emit('mark_read', { conversationId });
  }, []);

  return {
    joinConversation,
    sendMessage,
    emitTyping,
    emitStopTyping,
    emitMarkRead,
    socket: socketRef.current ?? sharedSocket,
  };
}

export function disconnectChatSocket() {
  if (sharedSocket) {
    sharedSocket.removeAllListeners();
    sharedSocket.disconnect();
    sharedSocket = null;
    sharedKey = '';
  }
}
