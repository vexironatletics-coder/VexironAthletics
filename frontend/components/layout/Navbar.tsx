'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';
import { selectCartCount } from '@/store/slices/cartSlice';
import { clearCart, clearGuestCartStorage } from '@/store/slices/cartSlice';
import { logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home', match: 'home' as const },
  { href: '/category/men', label: 'Men' },
  { href: '/category/women', label: 'Women' },
  { href: '/category/children', label: 'Children' },
  { href: '/products?sort=price-desc&minPrice=0&maxPrice=5000', label: 'Sale' },
];

const iconBtn =
  'flex h-9 w-9 items-center justify-center rounded-full text-[#F3E4C9] transition hover:bg-white/10 active:scale-95';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const cartCount = useSelector(selectCartCount);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { signOut } = useClerk();
  const accountRef = useRef<HTMLDivElement>(null);

  /* Close account panel when clicking outside */
  useEffect(() => {
    if (!accountOpen) return;
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [accountOpen]);

  /* Close menus on route change */
  useEffect(() => {
    setAccountOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    dispatch(logout());
    dispatch(clearGuestCartStorage());
    dispatch(clearCart());
    try { await signOut(); } catch { /* already cleared */ }
    router.push('/');
  };

  const navLinkClass =
    'text-sm font-medium text-[#F3E4C9] opacity-75 transition-all duration-200 hover:opacity-100 rounded-md px-3 py-2';

  const isNavActive = (href: string, match?: 'home') => {
    if (match === 'home') return pathname === '/';
    if (href.startsWith('/category/')) return pathname === href;
    if (href.startsWith('/products')) return pathname === '/products';
    return pathname === href;
  };

  return (
    <>
      <header className="site-header sticky top-0 z-50 border-b border-white/10 shadow-lg">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">

          {/* Left: hamburger + logo + nav */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              className={cn(iconBtn, 'lg:hidden')}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" aria-label={APP_NAME} className="flex shrink-0 items-center">
              <Image
                src="/logo.png"
                alt={APP_NAME}
                width={140}
                height={40}
                className="h-8 sm:h-9 w-auto object-contain"
                priority
              />
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex">
              {navLinks.map((link) => {
                const active = isNavActive(link.href, 'match' in link ? link.match : undefined);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      navLinkClass,
                      active && 'bg-white/10 opacity-100 font-semibold'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {user?.role === 'admin' && (
                <Link
                  href="/dashboard/admin"
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200',
                    pathname.startsWith('/dashboard/admin')
                      ? 'bg-[#F3E4C9] text-[#0A2947]'
                      : 'bg-[#F3E4C9]/15 text-[#F3E4C9] hover:bg-[#F3E4C9]/25'
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          {/* Right: search + icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:block">
              <SearchAutocomplete />
            </div>

            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex md:hidden">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-40 border-white/20 bg-white/10 text-[#F3E4C9] placeholder:text-[#F3E4C9]/50"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
              </form>
            ) : (
              <button
                type="button"
                className={cn(iconBtn, 'md:hidden')}
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            <Link href="/dashboard/user/wishlist" aria-label="Wishlist" className={iconBtn}>
              <Heart className="h-5 w-5" />
            </Link>

            <Link href="/cart" aria-label="Cart" className={cn(iconBtn, 'relative')}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B5E3C] text-[9px] font-bold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Account button */}
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                className={cn(
                  iconBtn,
                  accountOpen && 'bg-[#F3E4C9]/20 ring-1 ring-[#F3E4C9]/40'
                )}
                onClick={() => setAccountOpen((v) => !v)}
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </button>

              {accountOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" />

                  {/* Dropdown panel */}
                  <div className="animate-scale-in absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-[#D3D4C0]/30 bg-[#0A2947] shadow-2xl">
                    {user ? (
                      <>
                        {/* User header */}
                        <div className="border-b border-white/10 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#F3E4C9]/60">
                            Signed in as
                          </p>
                          <p className="mt-0.5 truncate font-bold text-[#F3E4C9]">{user.name}</p>
                          {user.role === 'admin' && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#F3E4C9]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#F3E4C9]">
                              <ShieldCheck className="h-3 w-3" /> Admin
                            </span>
                          )}
                        </div>

                        {/* Menu items */}
                        <nav className="py-1">
                          {[
                            { href: '/dashboard/user/profile', icon: User, label: 'Profile' },
                            { href: '/orders', icon: Package, label: 'My Orders' },
                            {
                              href: user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user',
                              icon: LayoutDashboard,
                              label: 'Dashboard',
                            },
                          ].map(({ href, icon: Icon, label }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setAccountOpen(false)}
                              className="flex items-center justify-between px-4 py-2.5 text-sm text-[#F3E4C9] transition hover:bg-white/10"
                            >
                              <span className="flex items-center gap-2.5">
                                <Icon className="h-4 w-4 text-[#F3E4C9]/60" />
                                {label}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 text-[#F3E4C9]/40" />
                            </Link>
                          ))}
                        </nav>

                        <div className="border-t border-white/10 py-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-300 transition hover:bg-white/10"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-1">
                        <Link
                          href="/login"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-[#F3E4C9] transition hover:bg-white/10"
                        >
                          Login <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-[#F3E4C9] transition hover:bg-white/10"
                        >
                          Register <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              className={iconBtn}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition dark:rotate-0 dark:scale-100" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="animate-slide-down border-t border-white/10 bg-[#0A2947] px-4 py-4 lg:hidden">
            <form onSubmit={handleSearch} className="mb-4 sm:hidden">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="border-white/20 bg-white/10 text-[#F3E4C9] placeholder:text-[#F3E4C9]/50"
              />
            </form>
            <nav className="flex flex-col gap-0.5">
              {navLinks.map((link) => {
                const active = isNavActive(link.href, 'match' in link ? link.match : undefined);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'rounded-lg px-3 py-3 text-sm font-medium text-[#F3E4C9] transition',
                      active ? 'bg-white/15 font-semibold' : 'opacity-75 hover:bg-white/10 hover:opacity-100'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {user?.role === 'admin' && (
                <Link
                  href="/dashboard/admin"
                  className="mt-1 flex items-center gap-2 rounded-lg bg-[#F3E4C9]/15 px-3 py-3 text-sm font-semibold text-[#F3E4C9] transition hover:bg-[#F3E4C9]/25"
                  onClick={() => setMobileOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
