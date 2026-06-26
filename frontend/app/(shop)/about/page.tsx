import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Heart,
  Leaf,
  Users,
  Package,
  Star,
  MapPin,
  Mail,
} from 'lucide-react';

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
];
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `About Us — ${APP_NAME}`,
  description: 'Learn about VexironAthletics — premium clothing for every lifestyle.',
};

const stats = [
  { label: 'Founded', value: '2024' },
  { label: 'Collections', value: '3+' },
  { label: 'Happy Customers', value: '500+' },
  { label: 'Products', value: '100+' },
];

const values = [
  {
    icon: ShieldCheck,
    title: 'Quality First',
    desc: 'Durable fabrics and thoughtful construction in every piece we make.',
  },
  {
    icon: Users,
    title: 'Inclusive Sizing',
    desc: 'Styles crafted for men, women, and children — every body, every age.',
  },
  {
    icon: Heart,
    title: 'Customer Care',
    desc: 'Responsive support, easy returns, and a 30-day satisfaction guarantee.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Growth',
    desc: 'Responsible sourcing and smarter packaging — step by step.',
  },
  {
    icon: Sparkles,
    title: 'Seasonal Collections',
    desc: 'Fresh arrivals every season with exclusive online-only drops.',
  },
  {
    icon: Package,
    title: 'Fast Delivery',
    desc: 'Free nationwide delivery on orders above ₨5,000. Always on time.',
  },
];

const collections = [
  { slug: 'men', label: "Men's Collection", color: 'from-[#0A2947] to-[#1a4a7a]' },
  { slug: 'women', label: "Women's Collection", color: 'from-[#8B5E3C] to-[#b07d52]' },
  { slug: 'children', label: "Kids' Collection", color: 'from-[#4a6741] to-[#6b9464]' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0A2947] py-20 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #F3E4C9 0%, transparent 60%),
                              radial-gradient(circle at 80% 20%, #8B5E3C 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 text-[#F3E4C9]" />
            Established 2024 · Lahore, Pakistan
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            We dress every{' '}
            <span className="text-[#F3E4C9]">story</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/75 leading-relaxed">
            {APP_NAME} started with a simple belief — premium fashion should be accessible
            to every family across Pakistan. From everyday essentials to statement pieces,
            we build collections that last.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-[#F3E4C9] px-6 py-3 font-semibold text-[#0A2947] shadow-lg transition hover:bg-white"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-[var(--border)] sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="px-6 py-8 text-center">
                <p className="text-3xl font-bold text-[var(--primary)]">{s.value}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Our Story</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                From a local dream to a growing brand
              </h2>
              <div className="mt-6 space-y-4 text-[var(--muted)] leading-relaxed">
                <p>
                  Founded in 2024, {APP_NAME} was born out of a desire to make premium athletic
                  and everyday fashion accessible for families across Pakistan. We noticed a gap
                  in the market — quality clothing that didn&apos;t break the bank.
                </p>
                <p>
                  We curate collections for men, women, and children that balance quality
                  craftsmanship with fair pricing. Every product is selected with care,
                  tested for durability, and designed to make you feel confident.
                </p>
                <p>
                  Based in Lahore, we serve customers nationwide with fast delivery and
                  a commitment to making every shopping experience seamless.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: MapPin, title: 'Lahore, Pakistan', sub: 'Our home base' },
                { icon: Package, title: '100+ Products', sub: 'Curated catalog' },
                { icon: Star, title: '5-star Service', sub: 'Customer rated' },
                { icon: Users, title: 'Family First', sub: 'For every age' },
              ].map(({ icon: Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                    <Icon className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-xs text-[var(--muted)]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-[var(--secondary)]/20 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">What We Stand For</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Our core values</h2>
            <p className="mt-4 text-[var(--muted)]">
              Every decision we make comes back to these six principles.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 transition group-hover:bg-[var(--primary)]/20">
                  <Icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collections CTA ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Collections</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Shop our range</h2>
            <p className="mt-4 text-[var(--muted)]">
              Curated lines for the whole family — updated every season.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className={`group relative flex min-h-[140px] items-end overflow-hidden rounded-2xl bg-gradient-to-br ${c.color} p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl`}
              >
                <div>
                  <p className="font-bold text-white text-lg">{c.label}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm text-white/80 transition group-hover:gap-2">
                    Shop Now <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="border-t border-[var(--border)] bg-[var(--card)] py-14">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <Mail className="mx-auto h-10 w-10 text-[var(--primary)]" />
          <h2 className="mt-4 text-2xl font-bold">Have a question?</h2>
          <p className="mt-2 text-[var(--muted)]">
            Reach our team at{' '}
            <a
              href="mailto:contact@vexironathletics.com"
              className="font-semibold text-[var(--primary)] hover:underline"
            >
              contact@vexironathletics.com
            </a>
            {' '}or{' '}
            <Link href="/contact" className="font-semibold text-[var(--accent)] hover:underline">
              send us a message
            </Link>
            .
          </p>
          {/* Social links */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--secondary)]/30 text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                {icon}
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            © 2026 {APP_NAME}. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
