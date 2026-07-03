export type ClothQuality = 'normal' | 'medium' | 'premium';

export const CLOTH_QUALITIES: { value: ClothQuality; label: string; multiplier: number }[] = [
  { value: 'normal', label: 'Normal', multiplier: 1 },
  { value: 'medium', label: 'Medium', multiplier: 1.15 },
  { value: 'premium', label: 'Premium', multiplier: 1.3 },
];

export const DEFAULT_CLOTH_QUALITY: ClothQuality = 'normal';

export const normalizeClothQuality = (value: unknown): ClothQuality => {
  if (value === 'medium' || value === 'premium') return value;
  return 'normal';
};

export const getClothQualityMultiplier = (quality: ClothQuality): number =>
  CLOTH_QUALITIES.find((q) => q.value === quality)?.multiplier ?? 1;

export const getClothQualityPrice = (basePrice: number, quality: ClothQuality): number =>
  Math.round(basePrice * getClothQualityMultiplier(quality));

type ProductQualitySource = {
  price: number;
  discountPrice?: number | null;
  mediumPrice?: number | null;
  premiumPrice?: number | null;
};

/** Resolve sale price for a product + quality tier (admin-set or auto multiplier). */
export const getProductQualityPriceForProduct = (
  product: ProductQualitySource,
  quality: ClothQuality
): number => {
  const normalBase = product.discountPrice ?? product.price;
  if (quality === 'normal') return normalBase;
  if (quality === 'medium' && product.mediumPrice != null && product.mediumPrice > 0) {
    return product.mediumPrice;
  }
  if (quality === 'premium' && product.premiumPrice != null && product.premiumPrice > 0) {
    return product.premiumPrice;
  }
  return getClothQualityPrice(normalBase, quality);
};
