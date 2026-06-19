import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotion extends Document {
  title: string;
  message: string;
  couponCode?: string;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    couponCode: { type: String, uppercase: true, trim: true },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Promotion = mongoose.model<IPromotion>('Promotion', promotionSchema);
