import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/products', '/category', '/login', '/register', '/forgot-password', '/reset-password', '/search', '/cart', '/contact', '/shipping', '/returns', '/faq', '/about', '/careers', '/privacy', '/terms'];
const userPaths = ['/checkout', '/orders', '/dashboard/user'];
const adminPaths = ['/dashboard/admin'];

const isPublicPath = (pathname: string) =>
  publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const isUserPath = (pathname: string) =>
  userPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const isAdminPath = (pathname: string) =>
  adminPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const getSignedInRedirect = (role?: string) =>
  role === 'admin' ? '/dashboard/admin' : '/dashboard/user/profile';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password') {
    if (token) {
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
      const destination = callbackUrl ?? getSignedInRedirect(role);
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  if (isAdminPath(pathname)) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  if (isUserPath(pathname)) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sso-callback).*)'],
};
