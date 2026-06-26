import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/pages/ContactForm';
import { APP_NAME } from '@/lib/constants';

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
