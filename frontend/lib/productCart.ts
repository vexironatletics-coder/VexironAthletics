import type { Product } from '@/lib/types';

export interface ProductCartPayload {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  qty: number;
  maxStock?: number;
}

export const buildCartItemFromProduct = (
  product: Product,
  options?: { size?: string; color?: string; qty?: number }
): ProductCartPayload => {
  const salePrice = product.discountPrice ?? product.price;
  return {
    productId: product._id,
    name: product.name,
    price: salePrice,
    image: product.images[0]?.url ?? '',
    size: options?.size ?? product.sizes[0] ?? 'M',
    color: options?.color ?? product.colors[0] ?? 'Black',
    qty: options?.qty ?? 1,
    maxStock: product.stock,
  };
};

export const getCheckoutRedirectUrl = (isLoggedIn: boolean): string =>
  isLoggedIn ? '/checkout' : '/login?callbackUrl=/checkout';
