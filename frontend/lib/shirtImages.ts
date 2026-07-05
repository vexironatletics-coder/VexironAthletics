/** Curated Unsplash clothing photography for catalog, hero, and banners. */
const unsplash = (photoId: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/** Local fallback when remote image URL is missing or fails to load */
export const IMAGE_PLACEHOLDER = '/placeholder.svg';

export function resolveImageSrc(src?: string | null, fallback?: string): string {
  const trimmed = src?.trim();
  if (trimmed) return trimmed;
  return fallback ?? IMAGE_PLACEHOLDER;
}

/** Product images in catalogSeed order (15 items). */
export const catalogProductImages = [
  unsplash('1602810318383-e386cc2a3ccf', 600, 800),
  unsplash('1521572163474-6864f9cf17ab', 600, 800),
  unsplash('1515886657613-9f3515b0c78f', 600, 800),
  unsplash('1542291026-7eec264c27ff', 600, 800),
  unsplash('1503342564765-7df573e8f429', 600, 800),
  unsplash('1515886657613-9f3515b0c78f', 600, 800),
  unsplash('1558618666-fcd25c85cd64', 600, 800),
  unsplash('1539109136881-3be0616acf4b', 600, 800),
  unsplash('1483985988355-763728e1f99c', 600, 800),
  unsplash('1490481651871-ab68de25d43d', 600, 800),
  unsplash('1519236081223-abe9f490a59b', 600, 800),
  unsplash('1519236081223-abe9f490a59b', 600, 800),
  unsplash('1503606770372-2ebb58dd75f0', 600, 800),
  unsplash('1472099645785-5658abf4ff4e', 600, 800),
  unsplash('1559163499-413811b65002', 600, 800),
] as const;

export const heroBannerImages = {
  elevate: unsplash('1602810318383-e386cc2a3ccf', 1920, 1080),
  summer: unsplash('1483985988355-763728e1f99c', 1920, 1080),
  kids: unsplash('1519236081223-abe9f490a59b', 1920, 1080),
  delivery: unsplash('1556906781-9a412961c28a', 1920, 1080),
} as const;

export const categoryShirtImages = {
  men: unsplash('1602810318383-e386cc2a3ccf', 600, 800),
  women: unsplash('1558618666-fcd25c85cd64', 600, 800),
  common: unsplash('1515886657613-9f3515b0c78f', 600, 800),
  children: unsplash('1519236081223-abe9f490a59b', 600, 800),
} as const;

export const heroStackShirtImages = [
  unsplash('1521572163474-6864f9cf17ab', 400, 520),
  unsplash('1602810318383-e386cc2a3ccf', 400, 520),
  unsplash('1515886657613-9f3515b0c78f', 400, 520),
  unsplash('1558618666-fcd25c85cd64', 400, 520),
  unsplash('1483985988355-763728e1f99c', 400, 520),
] as const;

export const authSideShirtImage = unsplash('1602810318383-e386cc2a3ccf', 1200, 1600);
