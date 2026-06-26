'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  Tags,
  ShoppingBag,
  Ticket,
  BarChart3,
  Palette,
  Users,
  User,
  Settings,
  Heart,
  ClipboardList,
  Images,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  match?: 'exact' | 'prefix';
}

interface SidebarNavGroup {
  label: string;
  icon?: LucideIcon;
  children: SidebarNavItem[];
}

type SidebarEntry = SidebarNavItem | SidebarNavGroup;

interface SidebarProps {
  title: string;
  subtitle?: string;
  entries: SidebarEntry[];
}

function isGroup(entry: SidebarEntry): entry is SidebarNavGroup {
  return 'children' in entry;
}

function isLinkActive(pathname: string, href: string, match: 'exact' | 'prefix' = 'exact') {
  if (match === 'prefix') {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
}

function isGroupActive(pathname: string, group: SidebarNavGroup) {
  return group.children.some((child) =>
    isLinkActive(pathname, child.href, child.match ?? 'exact')
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  match = 'exact',
  nested = false,
  prefetchOnHover = true,
}: SidebarNavItem & { nested?: boolean; prefetchOnHover?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = isLinkActive(pathname, href, match);

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={() => {
        if (prefetchOnHover) router.prefetch(href);
      }}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-[var(--radius)] px-3 py-2 text-sm transition-all duration-200',
        nested ? 'ml-0' : 'font-medium',
        active
          ? nested
            ? 'bg-[var(--secondary)] font-medium text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]'
            : 'theme-gradient font-medium text-white shadow-md'
          : 'text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            active && !nested ? 'text-white' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'
          )}
          aria-hidden
        />
      )}
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarGroup({ group }: { group: SidebarNavGroup }) {
  const pathname = usePathname();
  const groupActive = isGroupActive(pathname, group);
  const GroupIcon = group.icon;
  const threadColor = groupActive
    ? 'color-mix(in srgb, var(--accent) 50%, var(--sidebar-thread))'
    : 'var(--sidebar-thread)';

  return (
    <div className="relative">
      <div
        className={cn(
          'mb-1 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider',
          groupActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
        )}
      >
        {GroupIcon && <GroupIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
        <span>{group.label}</span>
      </div>

      <div
        className="relative ml-5 space-y-0.5 border-l-2 pl-3"
        style={{ borderColor: threadColor }}
      >
        {group.children.map((child, index) => {
          const isLast = index === group.children.length - 1;

          return (
            <div key={child.href} className="relative py-0.5">
              <span
                aria-hidden
                className="pointer-events-none absolute -left-3 top-1/2 h-2.5 w-3 -translate-y-1/2 rounded-bl-[10px] border-b-2"
                style={{ borderColor: threadColor }}
              />
              {isLast && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-[2px] top-1/2 bottom-0 w-[2px] bg-[var(--card)]"
                />
              )}
              <SidebarLink {...child} nested />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar({ title, subtitle, entries }: SidebarProps) {
  return (
    <aside className="sidebar-nested w-full shrink-0 lg:w-60">
      <div className="rounded-[calc(var(--radius)*1.5)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <div className="mb-5 border-b border-[var(--border)] pb-4">
          <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p>
          )}
        </div>

        <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-3 lg:overflow-visible">
          {entries.map((entry) => {
            if (isGroup(entry)) {
              return <SidebarGroup key={entry.label} group={entry} />;
            }

            return (
              <SidebarLink
                key={entry.href}
                {...entry}
                match={entry.match}
              />
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

const userEntries: SidebarEntry[] = [
  {
    href: '/dashboard/user',
    label: 'Overview',
    icon: LayoutDashboard,
    match: 'exact',
  },
  {
    label: 'Account',
    icon: User,
    children: [
      { href: '/dashboard/user/profile', label: 'Profile', icon: User },
      { href: '/dashboard/user/settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    label: 'Shopping',
    icon: ShoppingBag,
    children: [
      { href: '/dashboard/user/orders', label: 'My Orders', icon: ClipboardList },
      { href: '/dashboard/user/wishlist', label: 'Wishlist', icon: Heart },
    ],
  },
];

const adminEntries: SidebarEntry[] = [
  {
    href: '/dashboard/admin',
    label: 'Overview',
    icon: LayoutDashboard,
    match: 'exact',
  },
  {
    label: 'Catalog',
    icon: Package,
    children: [
      { href: '/dashboard/admin/products', label: 'All Products', icon: Package, match: 'exact' },
      { href: '/dashboard/admin/low-stock', label: 'Low Stock', icon: AlertTriangle },
      { href: '/dashboard/admin/categories', label: 'Sub-Categories', icon: Tags },
    ],
  },
  {
    label: 'Sales',
    icon: ShoppingBag,
    children: [
      { href: '/dashboard/admin/orders', label: 'Orders', icon: ClipboardList },
      { href: '/dashboard/admin/coupons', label: 'Coupons', icon: Ticket },
    ],
  },
  {
    label: 'Insights',
    icon: BarChart3,
    children: [
      { href: '/dashboard/admin/audience', label: 'Audience', icon: BarChart3 },
    ],
  },
  {
    label: 'Store',
    icon: Palette,
    children: [
      { href: '/dashboard/admin/appearance', label: 'Appearance', icon: Palette },
      { href: '/dashboard/admin/hero-slides', label: 'Hero Slider', icon: Images },
      { href: '/dashboard/admin/categories', label: 'Collections', icon: Tags },
      { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    ],
  },
];

export function UserSidebar() {
  return (
    <Sidebar
      title="My Account"
      subtitle="Profile, orders & preferences"
      entries={userEntries}
    />
  );
}

export function AdminSidebar() {
  return (
    <Sidebar
      title="Admin Panel"
      subtitle="Manage your store"
      entries={adminEntries}
    />
  );
}
