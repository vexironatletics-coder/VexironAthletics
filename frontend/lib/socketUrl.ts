/**
 * Socket.IO base URL (no /api suffix).
 * Production: same origin as the storefront (server.js single port).
 * Dev: backend on :5000, frontend on :3000.
 */
export function getSocketBaseUrl(): string {
  if (typeof window === 'undefined') return '';

  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/$/, '');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && !siteUrl.includes('localhost')) {
    return siteUrl.replace(/\/$/, '');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  try {
    const parsed = new URL(apiUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return window.location.origin;
  }
}
