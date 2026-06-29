import mongoose, { Document, Schema, Types } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'bank';

export interface IBankPaymentProof {
  url: string;
  public_id?: string;
}

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  clothQuality?: string;
  qty: number;
}

export interface IShippingAddress {
  name: string;
  phones: string[];
  /** @deprecated use phones[0] — kept for older orders */
  phone?: string;
  landmark: string;
  street: string;
  city: string;
  state: string;
  postal: string;
  country: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  bankPaymentProof?: IBankPaymentProof;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  couponCode?: string;
  couponDiscount?: number;
  loyaltyPointsRedeemed?: number;
  loyaltyPointsEarned?: number;
  loyaltyAwarded?: boolean;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    clothQuality: { type: String, enum: ['normal', 'medium', 'premium'], default: 'normal' },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    name: { type: String, required: true },
    phones: { type: [String], default: [] },
    phone: { type: String },
    landmark: { type: String, default: '' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ['cod', 'bank'], default: 'cod' },
    bankPaymentProof: {
      url: { type: String },
      public_id: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    loyaltyPointsRedeemed: { type: Number, default: 0 },
    loyaltyPointsEarned: { type: Number, default: 0 },
    loyaltyAwarded: { type: Boolean, default: false },
    total: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
