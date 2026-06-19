import mongoose, { Document, Schema } from 'mongoose';

export type CategoryParent = 'men' | 'women' | 'children';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent: CategoryParent;
  image?: string;
  active: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    parent: {
      type: String,
      enum: ['men', 'women', 'children'],
      required: true,
    },
    image: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', categorySchema);
