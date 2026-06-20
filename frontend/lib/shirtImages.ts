/** Curated Unsplash clothing photography for catalog, hero, and banners. */
const unsplash = (photoId: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/** Product images in catalogSeed order (15 items). */
export const catalogProductImages = [
  // Men (5)
  unsplash('1602810318383-e386cc2a3ccf', 600, 800), // dress shirt on hanger
  unsplash('1521572163474-6864f9cf17ab', 600, 800), // white tee
  unsplash('1489987707849-d955c6a53e7e', 600, 800), // shirts on rack
  unsplash('1542291026-7eec264c27ff', 600, 800),   // red casual shirt
  unsplash('1503342564765-7df573e8f429', 600, 800), // colorful clothing
  // Women (5)
  unsplash('1515886657613-9f3515b0c78f', 600, 800), // women's fashion
  unsplash('1558618666-fcd25c85cd64', 600, 800),   // women's blouse
  unsplash('1539109136881-3be0616acf4b', 600, 800), // women's outfit
  unsplash('1483985988355-763728e1f99c', 600, 800), // fashion shopping
  unsplash('1490481651871-ab68de25d43d', 600, 800), // women's top
  // Children (5)
  unsplash('1503341504253-dff481548365', 600, 800), // kids clothing
  unsplash('1519236081223-abe9f490a59b', 600, 800), // kids polo
  unsplash('1503606770372-2ebb58dd75f0', 600, 800), // kids tee
  unsplash('1472099645785-5658abf4ff4e', 600, 800), // casual kids
  unsplash('1559163499-413811b65002', 600, 800),   // kids outfit
] as const;

export const heroBannerImages = {
  elevate: unsplash('1489987707849-d955c6a53e7e', 1920, 1080),
  summer:  unsplash('1483985988355-763728e1f99c', 1920, 1080),
  kids:    unsplash('1503341504253-dff481548365', 1920, 1080),
  delivery: unsplash('1556906781-9a412961c28a', 1920, 1080),
} as const;

export const categoryShirtImages = {
  men:      unsplash('1602810318383-e386cc2a3ccf', 600, 800),
  women:    unsplash('1558618666-fcd25c85cd64',   600, 800),
  children: unsplash('1503341504253-dff481548365', 600, 800),
} as const;

export const heroStackShirtImages = [
  unsplash('1521572163474-6864f9cf17ab', 400, 520),
  unsplash('1602810318383-e386cc2a3ccf', 400, 520),
  unsplash('1515886657613-9f3515b0c78f', 400, 520),
  unsplash('1558618666-fcd25c85cd64',   400, 520),
  unsplash('1489987707849-d955c6a53e7e', 400, 520),
] as const;

export const authSideShirtImage = unsplash('1489987707849-d955c6a53e7e', 1200, 1600);
