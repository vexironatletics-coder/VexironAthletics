'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    try {
      await signOut();
    } catch {
      // Clerk session may already be cleared
    }
    router.push('/');
  };

  const navLinkClass =
    'text-sm font-medium text-[var(--header-fg)] opacity-80 transition-colors duration-200 hover:opacity-100 hover:text-[var(--brand-cream)]';

  const isNavActive = (href: string, match?: 'home') => {
    if (match === 'home') return pathname === '/';
    if (href.startsWith('/category/')) return pathname === href;
    if (href.startsWith('/products')) return pathname === '/products';
    return pathname === href;
  };

  return (
    <header className="site-header sticky top-0 z-50 border-b shadow-sm">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link href="/" aria-label={APP_NAME} className="flex items-center">
            <Image
              src="/logo.png"
              alt={APP_NAME}
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = isNavActive(link.href, 'match' in link ? link.match : undefined);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-[var(--radius)] px-3 py-2 transition-all duration-200',
                    active
                      ? 'bg-[var(--secondary)] font-semibold text-[var(--accent)]'
                      : navLinkClass
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
                  'flex items-center gap-1.5 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-all duration-200',
                  pathname.startsWith('/dashboard/admin')
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20'
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <SearchAutocomplete />
          </div>
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex md:hidden">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-48 lg:w-64"
                autoFocus
              />
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
          )}

          <Link href="/dashboard/user/wishlist" aria-label="Wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/cart" className="relative" aria-label="Cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-scale-in items-center justify-center rounded-full theme-gradient text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAccountOpen(!accountOpen)}
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Button>
            {accountOpen && (
              <div className="animate-scale-in absolute right-0 mt-2 w-48 origin-top-right rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg">
                {user ? (
                  <>
                    <p className="px-4 py-2 text-sm font-medium">{user.name}</p>
                    <Link
                      href="/dashboard/user/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--secondary)]"
                      onClick={() => setAccountOpen(false)}
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--secondary)]"
                      onClick={() => setAccountOpen(false)}
                    >
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    <Link
                      href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--secondary)]"
                      onClick={() => setAccountOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-[var(--secondary)]"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm hover:bg-[var(--secondary)]"
                      onClick={() => setAccountOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 text-sm hover:bg-[var(--secondary)]"
                      onClick={() => setAccountOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-slide-down border-t border-[var(--border)] px-4 py-4 lg:hidden">
          <form onSubmit={handleSearch} className="mb-4 sm:hidden">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
            />
          </form>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isNavActive(link.href, 'match' in link ? link.match : undefined);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium transition',
                    active
                      ? 'bg-[var(--secondary)] font-semibold text-[var(--accent)]'
                      : navLinkClass
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
                className="flex items-center gap-2 rounded-[var(--radius)] bg-[var(--accent)]/10 px-3 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/20"
                onClick={() => setMobileOpen(false)}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
