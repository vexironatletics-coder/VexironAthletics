/**
 * Socket.IO live chat server.
 *
 * PLUG-IN POINTS:
 * - Auth: uses the same JWT_SECRET as REST (`middleware/auth.ts`).
 *   Customers pass `auth.token` (logged in) OR `auth.guestSessionId` (guest).
 *   Admins must pass a valid JWT with role === 'admin'.
 * - DB: all messages persist via `services/chatService.ts` (MongoDB/Mongoose).
 * - Attach: call `initSocketServer(httpServer)` from index.ts / server.js.
 */
import type { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import { JwtPayload } from '../types';
import {
  conversationRoom,
  getConversationById,
  markConversationRead,
  saveMessage,
  serializeConversation,
  serializeMessage,
  userCanAccessConversation,
} from '../services/chatService';

const ADMIN_ROOM = 'admin';

type SocketRole = 'admin' | 'customer';

interface SocketAuthData {
  role: SocketRole;
  user?: JwtPayload;
  guestSessionId?: string;
}

interface TypingState {
  timeout: ReturnType<typeof setTimeout>;
}

/** In-memory presence per conversation (not source of truth — DB holds messages) */
const presenceByConversation = new Map<
  string,
  { customerOnline: boolean; adminOnline: boolean }
>();

const typingBySocket = new Map<string, TypingState>();

let io: Server | null = null;

const getPresence = (conversationId: string) =>
  presenceByConversation.get(conversationId) ?? {
    customerOnline: false,
    adminOnline: false,
  };

const emitPresence = (conversationId: string) => {
  if (!io) return;
  io.to(conversationRoom(conversationId)).emit('presence', {
    conversationId,
    ...getPresence(conversationId),
  });
};

const setPresence = (
  conversationId: string,
  role: SocketRole,
  online: boolean
) => {
  const current = getPresence(conversationId);
  if (role === 'admin') current.adminOnline = online;
  else current.customerOnline = online;
  presenceByConversation.set(conversationId, current);
  emitPresence(conversationId);
};

/** Verify JWT or guest session from handshake — mirrors REST auth */
const authenticateSocket = (socket: Socket): SocketAuthData | null => {
  const token = socket.handshake.auth?.token as string | undefined;
  const guestSessionId = socket.handshake.auth?.guestSessionId as string | undefined;
  const secret = process.env.JWT_SECRET;

  if (token && secret) {
    try {
      const user = jwt.verify(token, secret) as JwtPayload;
      return {
        role: user.role === 'admin' ? 'admin' : 'customer',
        user,
      };
    } catch {
      return null;
    }
  }

  if (guestSessionId && typeof guestSessionId === 'string' && guestSessionId.length >= 8) {
    return { role: 'customer', guestSessionId };
  }

  return null;
};

const canAccess = (
  auth: SocketAuthData,
  conversation: Awaited<ReturnType<typeof getConversationById>>
) => {
  if (!conversation) return false;
  return userCanAccessConversation(conversation, {
    userId: auth.user?.id,
    guestSessionId: auth.guestSessionId,
    isAdmin: auth.role === 'admin',
  });
};

const registerHandlers = (socket: Socket, auth: SocketAuthData) => {
  const joinedConversations = new Set<string>();

  /** Join admin broadcast room to receive new-conversation alerts */
  if (auth.role === 'admin') {
    socket.join(ADMIN_ROOM);
    socket.emit('connected', { role: 'admin' });
  } else {
    socket.emit('connected', { role: 'customer' });
  }

  /** Join a conversation room (one room per customer↔admin thread) */
  socket.on('join_conversation', async (payload: { conversationId: string }, ack?) => {
    try {
      const conversation = await getConversationById(payload?.conversationId);
      if (!canAccess(auth, conversation)) {
        ack?.({ ok: false, error: 'Access denied' });
        return;
      }

      const room = conversationRoom(payload.conversationId);
      await socket.join(room);
      joinedConversations.add(payload.conversationId);
      setPresence(payload.conversationId, auth.role, true);

      ack?.({
        ok: true,
        conversation: serializeConversation(conversation!),
        presence: getPresence(payload.conversationId),
      });
    } catch (err) {
      ack?.({ ok: false, error: (err as Error).message });
    }
  });

  /** Send message with delivery acknowledgment */
  socket.on(
    'send_message',
    async (
      payload: { conversationId: string; body: string; clientMessageId: string },
      ack?: (result: unknown) => void
    ) => {
      try {
        const { conversationId, body, clientMessageId } = payload ?? {};
        if (!conversationId || !body?.trim() || !clientMessageId) {
          ack?.({ ok: false, error: 'Invalid payload' });
          return;
        }

        const conversation = await getConversationById(conversationId);
        if (!canAccess(auth, conversation)) {
          ack?.({ ok: false, error: 'Access denied' });
          return;
        }

        const sender = auth.role === 'admin' ? 'admin' : 'customer';
        const { message, created } = await saveMessage({
          conversationId,
          sender,
          senderUserId: auth.user?.id,
          body,
          clientMessageId,
        });

        const serialized = serializeMessage(message);
        const room = conversationRoom(conversationId);

        if (created) {
          io?.to(room).emit('message', serialized);
          io?.to(ADMIN_ROOM).emit('conversation_updated', {
            conversation: serializeConversation(
              (await getConversationById(conversationId))!
            ),
          });
        }

        ack?.({ ok: true, message: serialized, deduplicated: !created });
      } catch (err) {
        ack?.({ ok: false, error: (err as Error).message });
      }
    }
  );

  /** Typing indicator — client should debounce (~300ms) before emitting */
  socket.on('typing', (payload: { conversationId: string }) => {
    if (!payload?.conversationId || !joinedConversations.has(payload.conversationId)) return;
    const room = conversationRoom(payload.conversationId);
    socket.to(room).emit('typing', {
      conversationId: payload.conversationId,
      role: auth.role,
    });

    const key = `${socket.id}:${payload.conversationId}`;
    const existing = typingBySocket.get(key);
    if (existing) clearTimeout(existing.timeout);
    typingBySocket.set(key, {
      timeout: setTimeout(() => {
        socket.to(room).emit('stop_typing', {
          conversationId: payload.conversationId,
          role: auth.role,
        });
        typingBySocket.delete(key);
      }, 3000),
    });
  });

  socket.on('stop_typing', (payload: { conversationId: string }) => {
    if (!payload?.conversationId) return;
    socket.to(conversationRoom(payload.conversationId)).emit('stop_typing', {
      conversationId: payload.conversationId,
      role: auth.role,
    });
  });

  /** Mark all messages in thread as read */
  socket.on('mark_read', async (payload: { conversationId: string }, ack?) => {
    try {
      const conversation = await getConversationById(payload?.conversationId);
      if (!canAccess(auth, conversation)) {
        ack?.({ ok: false });
        return;
      }
      const reader = auth.role === 'admin' ? 'admin' : 'customer';
      await markConversationRead(payload.conversationId, reader);
      io?.to(conversationRoom(payload.conversationId)).emit('messages_read', {
        conversationId: payload.conversationId,
        reader,
      });
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false });
    }
  });

  /** Cleanup on disconnect — prevent memory leaks */
  socket.on('disconnect', () => {
    for (const conversationId of joinedConversations) {
      setPresence(conversationId, auth.role, false);
    }
    for (const key of typingBySocket.keys()) {
      if (key.startsWith(`${socket.id}:`)) {
        clearTimeout(typingBySocket.get(key)!.timeout);
        typingBySocket.delete(key);
      }
    }
    joinedConversations.clear();
  });
};

export const initSocketServer = (httpServer: HttpServer): Server => {
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';

  io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const auth = authenticateSocket(socket);
    if (!auth) {
      next(new Error('Unauthorized'));
      return;
    }
    socket.data.auth = auth;
    next();
  });

  io.on('connection', (socket) => {
    const auth = socket.data.auth as SocketAuthData;
    logger.info({ socketId: socket.id, role: auth.role }, 'Chat socket connected');
    registerHandlers(socket, auth);
  });

  logger.info('Socket.IO chat server initialized');
  return io;
};

export const getIo = (): Server | null => io;
