import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { MAX_ORDER_LINE_ITEMS, MAX_QTY_PER_LINE } from '../utils/constants';

export interface CartItemInput {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  qty: number;
}

export interface ValidatedCartItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  qty: number;
}

export const validateAndNormalizeCartItems = async (
  items: CartItemInput[]
): Promise<ValidatedCartItem[]> => {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  if (items.length > MAX_ORDER_LINE_ITEMS) {
    throw new Error(`Cart cannot exceed ${MAX_ORDER_LINE_ITEMS} line items`);
  }

  const normalized: ValidatedCartItem[] = [];

  for (const item of items) {
    if (!item?.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
      throw new Error('Invalid product in cart');
    }

    const qty = Number(item.qty);
    if (!Number.isFinite(qty) || qty < 1) {
      throw new Error('Invalid quantity in cart');
    }

    if (qty > MAX_QTY_PER_LINE) {
      throw new Error(`Maximum ${MAX_QTY_PER_LINE} units per item`);
    }

    const product = await Product.findById(item.productId);
    if (!product || !product.active) {
      throw new Error(`Product unavailable: ${item.name || item.productId}`);
    }

    if (!product.sizes.includes(item.size)) {
      throw new Error(`Size ${item.size} not available for ${product.name}`);
    }

    if (!product.colors.includes(item.color)) {
      throw new Error(`Color ${item.color} not available for ${product.name}`);
    }

    const safeQty = Math.min(qty, product.stock, MAX_QTY_PER_LINE);
    if (safeQty < 1) {
      throw new Error(`${product.name} is out of stock`);
    }

    const price = product.discountPrice ?? product.price;
    const image = product.images[0]?.url ?? '';

    normalized.push({
      productId: product._id,
      name: product.name,
      price,
      image,
      size: item.size,
      color: item.color,
      qty: safeQty,
    });
  }

  return normalized;
};
