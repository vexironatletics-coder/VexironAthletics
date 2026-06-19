import Link from 'next/link';
import { Share2, Globe, Mail } from 'lucide-react';
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

export function Footer() {
  return (
    <footer className="site-footer border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-xl font-bold text-[var(--accent)]">
              {APP_NAME}
            </Link>
            <p className="mt-3 text-sm opacity-80">
              Premium clothing for men, women, and children. Quality fashion at affordable prices.
            </p>
            <div className="mt-4 flex gap-4">
              <Share2 className="h-5 w-5 opacity-60 transition hover:opacity-100" />
              <Globe className="h-5 w-5 opacity-60 transition hover:opacity-100" />
              <Link href="/contact" aria-label="Contact us">
                <Mail className="h-5 w-5 opacity-60 transition hover:opacity-100" />
              </Link>
            </div>
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
        <div className="mt-12 border-t border-current/10 pt-8 text-center text-sm opacity-70">
          © 2026 {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
