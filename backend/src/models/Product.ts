import mongoose, { Document, Schema } from 'mongoose';

export type ProductCategory = 'men' | 'women' | 'children';

export interface IProductImage {
  url: string;
  public_id: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: ProductCategory;
  images: IProductImage[];
  sizes: string[];
  colors: string[];
  stock: number;
  sold: number;
  ratings: number;
  numReviews: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    category: {
      type: String,
      enum: ['men', 'women', 'children'],
      required: true,
    },
    images: [productImageSchema],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0, min: 0 },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, active: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
