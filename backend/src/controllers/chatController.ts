import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  findOrCreateConversation,
  getConversationById,
  getMessagesPage,
  listAdminConversations,
  markConversationRead,
  serializeConversation,
  serializeMessage,
  userCanAccessConversation,
} from '../services/chatService';

/** POST /api/chat/conversation — get or create the customer's open conversation */
export const getOrCreateConversation = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }

  const { guestSessionId, guestName } = req.body as {
    guestSessionId?: string;
    guestName?: string;
  };

  const userId = req.user?.id;
  const customerName = guestName?.trim() ?? req.user?.email?.split('@')[0] ?? 'Guest';
  const customerEmail = req.user?.email;

  if (!userId && !guestSessionId) {
    res.status(400).json({ message: 'Login or provide guestSessionId' });
    return;
  }

  try {
    const conversation = await findOrCreateConversation({
      userId,
      guestSessionId: userId ? undefined : guestSessionId,
      customerName,
      customerEmail,
    });
    res.json({ conversation: serializeConversation(conversation) });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message ?? 'Failed to start chat' });
  }
};

/** GET /api/chat/conversations — admin: list active chats */
export const getConversations = async (_req: Request, res: Response): Promise<void> => {
  const conversations = await listAdminConversations();
  res.json({ conversations: conversations.map(serializeConversation) });
};

/** GET /api/chat/conversations/:id/messages — paginated history */
export const getConversationMessages = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const before = req.query.before as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const conversation = await getConversationById(id);
  if (!conversation) {
    res.status(404).json({ message: 'Conversation not found' });
    return;
  }

  const guestSessionId = req.headers['x-guest-session'] as string | undefined;
  const allowed = userCanAccessConversation(conversation, {
    userId: req.user?.id,
    guestSessionId,
    isAdmin: req.user?.role === 'admin',
  });

  if (!allowed) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  const result = await getMessagesPage(id, { before, limit });
  res.json({
    messages: result.messages.map(serializeMessage),
    hasMore: result.hasMore,
    nextBefore: result.nextBefore,
  });
};

/** PATCH /api/chat/conversations/:id/read — mark messages read */
export const markRead = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const reader = req.user?.role === 'admin' ? 'admin' : 'customer';

  const conversation = await getConversationById(id);
  if (!conversation) {
    res.status(404).json({ message: 'Conversation not found' });
    return;
  }

  const guestSessionId = req.headers['x-guest-session'] as string | undefined;
  const allowed = userCanAccessConversation(conversation, {
    userId: req.user?.id,
    guestSessionId,
    isAdmin: req.user?.role === 'admin',
  });

  if (!allowed) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  await markConversationRead(id, reader);
  res.json({ ok: true });
};
