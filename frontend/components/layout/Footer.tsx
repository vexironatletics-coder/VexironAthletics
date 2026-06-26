import Link from 'next/link';
import { Mail } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const footerLinks = {
  shop: [
    { href: '/category/men', label: 'Men' },
    { href: '/category/women', label: 'Women' },
    { href: '/category/children', label: 'Children' },
    { href: '/products', label: 'All Products' },
  ],
  support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns' },
    { href: '/faq', label: 'FAQ' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/vexironathletics',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/vexironathletics/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@vexironathletics',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.67a8.18 8.18 0 004.78 1.52V6.7a4.85 4.85 0 01-1.01-.01z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:contact@vexironathletics.com',
    icon: <Mail className="h-5 w-5" />,
  },
];

export function Footer() {
  return (
    <footer className="site-footer border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand + socials */}
          <div>
            <Link href="/" className="text-xl font-bold text-[var(--accent)]">
              {APP_NAME}
            </Link>
            <p className="mt-3 text-sm opacity-80 leading-relaxed">
              Premium clothing for men, women, and children. Quality fashion at affordable prices.
            </p>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-current/20 opacity-70 transition hover:border-[var(--accent)] hover:opacity-100 hover:text-[var(--accent)]"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Email text */}
            <a
              href="mailto:contact@vexironathletics.com"
              className="mt-4 block text-xs opacity-60 hover:opacity-100 hover:text-[var(--accent)] transition"
            >
              contact@vexironathletics.com
            </a>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="theme-link text-sm opacity-80 hover:opacity-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-current/10 pt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between text-sm opacity-70">
          <span>© 2026 {APP_NAME}. All rights reserved.</span>
          <div className="flex items-center gap-4">
            {socialLinks.slice(0, 3).map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 transition hover:opacity-100"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
