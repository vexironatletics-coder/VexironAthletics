import mongoose, { Document, Schema, Types } from 'mongoose';

export type ChatSender = 'customer' | 'admin';

export interface IChatMessage extends Document {
  conversationId: Types.ObjectId;
  sender: ChatSender;
  /** User id of sender (admin or logged-in customer) */
  senderUserId?: Types.ObjectId;
  body: string;
  /** Client-generated id — used to dedupe on reconnect / retry */
  clientMessageId: string;
  readByCustomer: boolean;
  readByAdmin: boolean;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatConversation',
      required: true,
      index: true,
    },
    sender: { type: String, enum: ['customer', 'admin'], required: true },
    senderUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    clientMessageId: { type: String, required: true },
    readByCustomer: { type: Boolean, default: false },
    readByAdmin: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

chatMessageSchema.index({ conversationId: 1, createdAt: -1 });
chatMessageSchema.index({ conversationId: 1, clientMessageId: 1 }, { unique: true });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
