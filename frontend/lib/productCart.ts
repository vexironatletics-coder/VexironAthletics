import type { Product } from '@/lib/types';
import {
  DEFAULT_CLOTH_QUALITY,
  getProductQualityPrice,
  type ClothQuality,
} from '@/lib/clothQuality';

export interface ProductCartPayload {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  clothQuality: ClothQuality;
  qty: number;
  maxStock?: number;
}

export const buildCartItemFromProduct = (
  product: Product,
  options?: { size?: string; color?: string; clothQuality?: ClothQuality; qty?: number }
): ProductCartPayload => {
  const clothQuality = options?.clothQuality ?? DEFAULT_CLOTH_QUALITY;
  return {
    productId: product._id,
    name: product.name,
    price: getProductQualityPrice(product, clothQuality),
    image: product.images[0]?.url ?? '',
    size: options?.size ?? product.sizes[0] ?? 'M',
    color: options?.color ?? product.colors[0] ?? 'Black',
    clothQuality,
    qty: options?.qty ?? 1,
    maxStock: product.stock,
  };
};

export const getCheckoutRedirectUrl = (isLoggedIn: boolean): string =>
  isLoggedIn ? '/checkout' : '/login?callbackUrl=/checkout';
