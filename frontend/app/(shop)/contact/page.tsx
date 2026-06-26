import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/pages/ContactForm';
import { APP_NAME } from '@/lib/constants';

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/vexironathletics',
    color: 'hover:text-[#1877F2] hover:border-[#1877F2]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/vexironathletics/',
    color: 'hover:text-[#E1306C] hover:border-[#E1306C]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@vexironathletics',
    color: 'hover:text-black dark:hover:text-white hover:border-current',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.67a8.18 8.18 0 004.78 1.52V6.7a4.85 4.85 0 01-1.01-.01z" />
      </svg>
    ),
  },
];

export const metadata: Metadata = {
  title: `Contact Us — ${APP_NAME}`,
  description: 'Get in touch with the VexironAthletics support team.',
};

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'contact@vexironathletics.com',
    href: 'mailto:contact@vexironathletics.com',
    sub: 'We reply within 24 hours',
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+92 307 722 9449',
    href: 'tel:+923077229449',
    sub: 'Mon–Sat, 9 AM – 6 PM PKT',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: 'Chat on WhatsApp',
    href: 'https://wa.me/923077229449',
    sub: 'Fastest response',
  },
  {
    icon: MapPin,
    title: 'Address',
    value: 'Lahore, Punjab, Pakistan',
    href: 'https://maps.google.com/?q=Lahore,Pakistan',
    sub: 'Visit us by appointment',
  },
];

const hours = [
  { day: 'Monday – Friday', time: '9:00 AM – 6:00 PM' },
  { day: 'Saturday', time: '10:00 AM – 4:00 PM' },
  { day: 'Sunday', time: 'Closed' },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0A2947] py-16 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 50%, #F3E4C9 0%, transparent 60%)`,
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
            <Clock className="h-3.5 w-3.5 text-[#F3E4C9]" />
            Mon–Sat · 9 AM – 6 PM PKT
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Get in <span className="text-[#F3E4C9]">touch</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/75 leading-relaxed">
            Questions about orders, sizing, returns, or anything else?
            We&apos;re here and happy to help.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:items-start">

          {/* ── Left: contact info ── */}
          <div className="space-y-8">

            {/* Info cards */}
            <div className="space-y-4">
              {contactInfo.map(({ icon: Icon, title, value, href, sub }) => (
                <a
                  key={title}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 transition group-hover:bg-[var(--primary)]/20">
                    <Icon className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{title}</p>
                    <p className="mt-0.5 font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition">
                      {value}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{sub}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Business hours */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="font-semibold">Business Hours</h2>
              </div>
              <div className="space-y-3">
                {hours.map(({ day, time }) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">{day}</span>
                    <span className={`font-medium ${time === 'Closed' ? 'text-red-500' : 'text-[var(--foreground)]'}`}>
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
              <p className="mb-3 text-sm font-semibold">Follow us</p>
              <div className="flex items-center gap-3">
                {socialLinks.map(({ label, href, icon, color }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition ${color}`}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick note */}
            <div className="rounded-2xl bg-[var(--primary)]/5 border border-[var(--primary)]/20 p-5">
              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                <span className="font-semibold">Tip:</span> For the fastest response, reach us on{' '}
                <a
                  href="https://wa.me/923077229449"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--primary)] hover:underline"
                >
                  WhatsApp
                </a>{' '}
                or email{' '}
                <a
                  href="mailto:contact@vexironathletics.com"
                  className="font-semibold text-[var(--primary)] hover:underline"
                >
                  contact@vexironathletics.com
                </a>
                .
              </p>
            </div>
          </div>

          {/* ── Right: contact form ── */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Send us a message</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Fill in the form below and we&apos;ll get back to you within 24 hours.
              </p>
            </div>
            <ContactForm />
          </div>

        </div>
      </div>
    </div>
  );
}
