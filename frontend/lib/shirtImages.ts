/** Curated Unsplash shirt / top photography for catalog, hero, and banners. */
const unsplash = (photoId: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/** Product images in catalogSeed order (15 items). */
export const catalogProductImages = [
  unsplash('1596755094514-f87e34085b2c', 600, 800), // men's oxford shirt
  unsplash('1598030757619-396e40a767e2', 600, 800), // men's blue shirt
  unsplash('1602810318383-e386cc2a3ccf', 600, 800), // dress shirt on hanger
  unsplash('1521572163474-6864f9cf17ab', 600, 800), // white tee
  unsplash('1576562750291-f971b5358b21', 600, 800), // striped shirt
  unsplash('1564257631407-4deb1f97bcc9', 600, 800), // women's blouse
  unsplash('1434389677669-e08b4cac3105', 600, 800), // women's shirt
  unsplash('1485230627593-5b8906c5c18f', 600, 800), // silk-style top
  unsplash('1583743814966-8936f5b7be1a', 600, 800), // women's casual shirt
  unsplash('1551488831-6ae45de3532a', 600, 800), // women's shirt flat lay
  unsplash('1503341504253-dff481548365', 600, 800), // kids shirts
  unsplash('1519236081223-abe9f490a59b', 600, 800), // kids polo
  unsplash('1503606770372-2ebb58dd75f0', 600, 800), // kids tee
  unsplash('1622292945095-cc7094e1f162', 600, 800), // kids shirt stack
  unsplash('1541099640106-71124b63c149', 600, 800), // youth shirt
] as const;

export const heroBannerImages = {
  elevate: unsplash('1489987707025-afc232f7ea0f', 1920, 1080),
  summer: unsplash('1441984904996-e0b6a68756d2', 1920, 1080),
  kids: unsplash('1622445275463-44baedd2cbc0', 1920, 1080),
  delivery: unsplash('1556906781-9a412961c28a', 1920, 1080),
} as const;

export const categoryShirtImages = {
  men: unsplash('1622445275463-44baedd2cbc0', 600, 800),
  women: unsplash('1564257631407-4deb1f97bcc9', 600, 800),
  children: unsplash('1503341504253-dff481548365', 600, 800),
} as const;

export const heroStackShirtImages = [
  unsplash('1521572163474-6864f9cf17ab', 400, 520),
  unsplash('1596755094514-f87e34085b2c', 400, 520),
  unsplash('1576562750291-f971b5358b21', 400, 520),
  unsplash('1594938298605-cd88d826e511', 400, 520),
  unsplash('1602810318383-e386cc2a3ccf', 400, 520),
] as const;

export const authSideShirtImage = unsplash('1489987707025-afc232f7ea0f', 1200, 1600);
