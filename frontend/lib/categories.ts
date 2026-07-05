/** Product categories stored on each product. */
export type ProductCategory = 'men' | 'women' | 'children';

/** Shop browse slugs — includes virtual "common" (men + women). */
export type ShopCategorySlug = ProductCategory | 'common';

export const PRODUCT_CATEGORIES: ProductCategory[] = ['men', 'women', 'children'];

export const SHOP_CATEGORY_SLUGS: ShopCategorySlug[] = [
  'men',
  'women',
  'common',
  'children',
];

export const COMMON_PRODUCT_CATEGORIES: ProductCategory[] = ['men', 'women'];

export const SHOP_CATEGORY_LABELS: Record<ShopCategorySlug, string> = {
  men: 'Men',
  women: 'Women',
  common: 'Common',
  children: 'Children',
};

export const SHOP_CATEGORY_NAV_LINKS = SHOP_CATEGORY_SLUGS.map((slug) => ({
  slug,
  href: `/category/${slug}`,
  label: SHOP_CATEGORY_LABELS[slug],
}));

export function isShopCategorySlug(slug: string): slug is ShopCategorySlug {
  return (SHOP_CATEGORY_SLUGS as string[]).includes(slug);
}

export function getCategoryLinkHref(cat: { slug: string; href?: string }): string {
  const slug = cat.slug?.trim().toLowerCase();
  if (isShopCategorySlug(slug)) {
    return `/category/${slug}`;
  }
  const href = cat.href?.trim();
  if (href && href.startsWith('/')) return href;
  return `/category/${slug}`;
}

export function getCategoryPageMeta(slug: ShopCategorySlug): {
  title: string;
  description: string;
} {
  switch (slug) {
    case 'men':
      return {
        title: "Men's Collection",
        description:
          "Browse our latest men's athletic wear — performance-ready styles for every day.",
      };
    case 'women':
      return {
        title: "Women's Collection",
        description:
          "Browse our latest women's athletic wear — performance-ready styles for every day.",
      };
    case 'common':
      return {
        title: 'Common Collection',
        description:
          'Unisex and shared styles for men and women — everyday essentials everyone can wear.',
      };
    case 'children':
      return {
        title: "Children's Collection",
        description:
          "Browse our latest children's athletic wear — performance-ready styles for every day.",
      };
  }
}
