import mongoose from 'mongoose';
import { ChatConversation, IChatConversation } from '../models/ChatConversation';
import { ChatMessage, IChatMessage } from '../models/ChatMessage';

const DEFAULT_PAGE_SIZE = 30;

export const conversationRoom = (conversationId: string): string => `conv:${conversationId}`;

export const findOrCreateConversation = async (params: {
  userId?: string;
  guestSessionId?: string;
  customerName: string;
  customerEmail?: string;
}): Promise<IChatConversation> => {
  const filter: Record<string, unknown> = { status: 'open' };
  if (params.userId) {
    filter.customerUserId = new mongoose.Types.ObjectId(params.userId);
  } else if (params.guestSessionId) {
    filter.guestSessionId = params.guestSessionId;
  } else {
    throw new Error('userId or guestSessionId required');
  }

  let conversation = await ChatConversation.findOne(filter).sort({ updatedAt: -1 });
  if (conversation) {
    if (params.customerName && conversation.customerName !== params.customerName) {
      conversation.customerName = params.customerName;
    }
    if (params.customerEmail && conversation.customerEmail !== params.customerEmail) {
      conversation.customerEmail = params.customerEmail;
    }
    await conversation.save();
    return conversation;
  }

  conversation = await ChatConversation.create({
    customerUserId: params.userId ? new mongoose.Types.ObjectId(params.userId) : undefined,
    guestSessionId: params.guestSessionId,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    lastMessageAt: new Date(),
  });
  return conversation;
};

export const listAdminConversations = async (limit = 50) =>
  ChatConversation.find({ status: 'open' })
    .sort({ lastMessageAt: -1 })
    .limit(limit)
    .lean();

export const getConversationById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return ChatConversation.findById(id);
};

export const userCanAccessConversation = (
  conversation: IChatConversation,
  opts: { userId?: string; guestSessionId?: string; isAdmin?: boolean }
): boolean => {
  if (opts.isAdmin) return true;
  if (opts.userId && conversation.customerUserId?.toString() === opts.userId) return true;
  if (
    opts.guestSessionId &&
    conversation.guestSessionId &&
    conversation.guestSessionId === opts.guestSessionId
  ) {
    return true;
  }
  return false;
};

export const getMessagesPage = async (
  conversationId: string,
  opts: { before?: string; limit?: number } = {}
) => {
  const limit = Math.min(50, Math.max(1, opts.limit ?? DEFAULT_PAGE_SIZE));
  const filter: Record<string, unknown> = {
    conversationId: new mongoose.Types.ObjectId(conversationId),
  };
  if (opts.before) {
    const beforeDate = new Date(opts.before);
    if (!Number.isNaN(beforeDate.getTime())) {
      filter.createdAt = { $lt: beforeDate };
    }
  }

  const messages = await ChatMessage.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;
  page.reverse();

  return {
    messages: page,
    hasMore,
    nextBefore: page.length > 0 ? page[0].createdAt.toISOString() : undefined,
  };
};

export const saveMessage = async (params: {
  conversationId: string;
  sender: 'customer' | 'admin';
  senderUserId?: string;
  body: string;
  clientMessageId: string;
}): Promise<{ message: IChatMessage; created: boolean }> => {
  const existing = await ChatMessage.findOne({
    conversationId: params.conversationId,
    clientMessageId: params.clientMessageId,
  });
  if (existing) {
    return { message: existing, created: false };
  }

  const message = await ChatMessage.create({
    conversationId: new mongoose.Types.ObjectId(params.conversationId),
    sender: params.sender,
    senderUserId: params.senderUserId
      ? new mongoose.Types.ObjectId(params.senderUserId)
      : undefined,
    body: params.body.trim(),
    clientMessageId: params.clientMessageId,
    readByCustomer: params.sender === 'customer',
    readByAdmin: params.sender === 'admin',
    deliveredAt: new Date(),
  });

  const unreadCustomer = params.sender === 'admin' ? 1 : 0;
  const unreadAdmin = params.sender === 'customer' ? 1 : 0;

  await ChatConversation.findByIdAndUpdate(params.conversationId, {
    lastMessage: params.body.trim().slice(0, 200),
    lastMessageAt: message.createdAt,
    $inc: {
      unreadCustomer,
      unreadAdmin,
    },
  });

  return { message, created: true };
};

export const markConversationRead = async (
  conversationId: string,
  reader: 'customer' | 'admin'
) => {
  const readField = reader === 'admin' ? 'readByAdmin' : 'readByCustomer';
  const unreadField = reader === 'admin' ? 'unreadAdmin' : 'unreadCustomer';

  await ChatMessage.updateMany(
    { conversationId, [readField]: false },
    { $set: { [readField]: true } }
  );

  await ChatConversation.findByIdAndUpdate(conversationId, {
    [unreadField]: 0,
  });
};

export const serializeMessage = (msg: IChatMessage | Record<string, unknown>) => {
  const m = msg as IChatMessage;
  return {
    _id: m._id.toString(),
    conversationId: m.conversationId.toString(),
    sender: m.sender,
    senderUserId: m.senderUserId?.toString(),
    body: m.body,
    clientMessageId: m.clientMessageId,
    readByCustomer: m.readByCustomer,
    readByAdmin: m.readByAdmin,
    deliveredAt: m.deliveredAt?.toISOString(),
    createdAt: m.createdAt.toISOString(),
  };
};

export const serializeConversation = (conv: IChatConversation | Record<string, unknown>) => {
  const c = conv as IChatConversation;
  return {
    _id: c._id.toString(),
    customerUserId: c.customerUserId?.toString(),
    guestSessionId: c.guestSessionId,
    customerName: c.customerName,
    customerEmail: c.customerEmail,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt.toISOString(),
    unreadCustomer: c.unreadCustomer,
    unreadAdmin: c.unreadAdmin,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
};
