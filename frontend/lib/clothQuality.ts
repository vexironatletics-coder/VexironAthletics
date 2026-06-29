import type { Product } from '@/lib/types';

export type ClothQuality = 'normal' | 'medium' | 'premium';

export const CLOTH_QUALITIES: { value: ClothQuality; label: string; multiplier: number }[] = [
  { value: 'normal', label: 'Normal', multiplier: 1 },
  { value: 'medium', label: 'Medium', multiplier: 1.15 },
  { value: 'premium', label: 'Premium', multiplier: 1.3 },
];

export const DEFAULT_CLOTH_QUALITY: ClothQuality = 'normal';

export const getClothQualityMultiplier = (quality: ClothQuality): number =>
  CLOTH_QUALITIES.find((q) => q.value === quality)?.multiplier ?? 1;

export const getClothQualityLabel = (quality: ClothQuality): string =>
  CLOTH_QUALITIES.find((q) => q.value === quality)?.label ?? 'Normal';

/** Sale price for a product at the selected cloth quality tier. */
export const getProductQualityPrice = (product: Product, quality: ClothQuality = DEFAULT_CLOTH_QUALITY): number => {
  const base = product.discountPrice ?? product.price;
  return Math.round(base * getClothQualityMultiplier(quality));
};

/** Original list price at quality tier (for strikethrough when discounted). */
export const getProductQualityListPrice = (product: Product, quality: ClothQuality = DEFAULT_CLOTH_QUALITY): number =>
  Math.round(product.price * getClothQualityMultiplier(quality));

export const cartLineKey = (item: {
  productId: string;
  size: string;
  color: string;
  clothQuality?: ClothQuality;
}): string =>
  `${item.productId}|${item.size}|${item.color}|${item.clothQuality ?? DEFAULT_CLOTH_QUALITY}`;

export const sameCartLine = (
  a: { productId: string; size: string; color: string; clothQuality?: ClothQuality },
  b: { productId: string; size: string; color: string; clothQuality?: ClothQuality }
): boolean => cartLineKey(a) === cartLineKey(b);
