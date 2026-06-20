/** Curated Unsplash shirt / top photography — keep in sync with frontend/lib/shirtImages.ts */
const unsplash = (photoId: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const catalogProductImages = [
  unsplash('1596755094514-f87e34085b2c', 600, 800),
  unsplash('1598030757619-396e40a767e2', 600, 800),
  unsplash('1602810318383-e386cc2a3ccf', 600, 800),
  unsplash('1521572163474-6864f9cf17ab', 600, 800),
  unsplash('1576562750291-f971b5358b21', 600, 800),
  unsplash('1564257631407-4deb1f97bcc9', 600, 800),
  unsplash('1434389677669-e08b4cac3105', 600, 800),
  unsplash('1485230627593-5b8906c5c18f', 600, 800),
  unsplash('1583743814966-8936f5b7be1a', 600, 800),
  unsplash('1551488831-6ae45de3532a', 600, 800),
  unsplash('1503341504253-dff481548365', 600, 800),
  unsplash('1519236081223-abe9f490a59b', 600, 800),
  unsplash('1503606770372-2ebb58dd75f0', 600, 800),
  unsplash('1622292945095-cc7094e1f162', 600, 800),
  unsplash('1541099640106-71124b63c149', 600, 800),
];
