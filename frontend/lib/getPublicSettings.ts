import type { SiteThemeSettings } from './themes';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function getPublicSettings(): Promise<SiteThemeSettings | null> {
  try {
    const res = await fetch(`${API_URL}/settings/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as SiteThemeSettings;
  } catch {
    return null;
  }
}
