import { RECENTLY_VIEWED_KEY, RECENTLY_VIEWED_MAX } from './constants';

export const getRecentlyViewedIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const addRecentlyViewed = (productId: string): void => {
  if (typeof window === 'undefined' || !productId) return;
  const current = getRecentlyViewedIds().filter((id) => id !== productId);
  const next = [productId, ...current].slice(0, RECENTLY_VIEWED_MAX);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
};
