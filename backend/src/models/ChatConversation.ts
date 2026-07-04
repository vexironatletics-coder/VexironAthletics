import mongoose, { Document, Schema, Types } from 'mongoose';

export type ChatConversationStatus = 'open' | 'closed';

export interface IChatConversation extends Document {
  /** Logged-in customer (optional — guests use guestSessionId instead) */
  customerUserId?: Types.ObjectId;
  /** Stable browser session id for guests (localStorage) */
  guestSessionId?: string;
  customerName: string;
  customerEmail?: string;
  lastMessage?: string;
  lastMessageAt: Date;
  /** Unread count from the customer's perspective */
  unreadCustomer: number;
  /** Unread count from the admin's perspective */
  unreadAdmin: number;
  status: ChatConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const chatConversationSchema = new Schema<IChatConversation>(
  {
    customerUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    guestSessionId: { type: String, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    lastMessage: { type: String },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    unreadCustomer: { type: Number, default: 0, min: 0 },
    unreadAdmin: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  },
  { timestamps: true }
);

chatConversationSchema.index(
  { guestSessionId: 1, status: 1 },
  { partialFilterExpression: { guestSessionId: { $exists: true, $type: 'string' } } }
);

export const ChatConversation = mongoose.model<IChatConversation>(
  'ChatConversation',
  chatConversationSchema
);
