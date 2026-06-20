import type { SiteThemeSettings } from './themes';
import { normalizeThemeSettings } from './themes';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function getPublicSettings(): Promise<SiteThemeSettings> {
  try {
    const res = await fetch(`${API_URL}/settings/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return normalizeThemeSettings(null);
    const data = (await res.json()) as Partial<SiteThemeSettings>;
    return normalizeThemeSettings(data);
  } catch {
    return normalizeThemeSettings(null);
  }
}
