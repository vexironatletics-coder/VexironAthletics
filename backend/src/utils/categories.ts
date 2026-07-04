import type { ProductCategory } from '../models/Product';

export type ShopCategorySlug = ProductCategory | 'common';

export const COMMON_PRODUCT_CATEGORIES: ProductCategory[] = ['men', 'women'];

export const isShopCategorySlug = (value: string): value is ShopCategorySlug =>
  value === 'men' || value === 'women' || value === 'children' || value === 'common';

/** Map shop slug to MongoDB filter value(s). */
export const categoryFilterForSlug = (
  slug: string
): ProductCategory | { $in: ProductCategory[] } | undefined => {
  if (slug === 'common') return { $in: COMMON_PRODUCT_CATEGORIES };
  if (slug === 'men' || slug === 'women' || slug === 'children') return slug;
  return undefined;
};
