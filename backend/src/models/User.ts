import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserProvider = 'local' | 'google' | 'facebook';
export type UserRole = 'user' | 'admin';

export interface IAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  isDefault: boolean;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string | null;
  avatar?: string;
  banner?: string;
  provider: UserProvider;
  clerkId?: string;
  phone?: string;
  role: UserRole;
  addresses: IAddress[];
  isActive: boolean;
  loyaltyPoints: number;
  lifetimePointsEarned: number;
  tier: LoyaltyTier;
  referralCode: string;
  referredBy?: Types.ObjectId;
  resetPasswordToken?: string | null;
  resetPasswordExpire?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    avatar: { type: String },
    banner: { type: String },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
    },
    clerkId: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['user', 'editor',  'manager', 'admin','superadmin'], default: 'user' },
    addresses: [addressSchema],
    isActive: { type: Boolean, default: true },
    loyaltyPoints: { type: Number, default: 0 },
    lifetimePointsEarned: { type: Number, default: 0 },
    tier: { type: String, enum: ['bronze', 'silver', 'gold'], default: 'bronze' },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
