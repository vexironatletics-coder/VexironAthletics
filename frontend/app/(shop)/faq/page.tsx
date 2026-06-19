import type { Metadata } from 'next';
import { InfoPageLayout } from '@/components/pages/InfoPageLayout';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `FAQ — ${APP_NAME}`,
  description: 'Frequently asked questions about orders, shipping, and returns.',
};

const faqs = [
  {
    q: 'How do I track my order?',
    a: 'Sign in and visit My Orders to see real-time status. You will also receive email updates when your order is confirmed, shipped, and delivered.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We currently accept cash on delivery (COD) across Pakistan. Online payment options will be added soon.',
  },
  {
    q: 'How do I choose the right size?',
    a: 'Each product page includes a size guide. If you are between sizes, we recommend sizing up for a relaxed fit.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Contact us within 2 hours of placing your order. Once processing begins, changes may not be possible.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'At this time we ship within Pakistan only. International shipping is planned for a future release.',
  },
  {
    q: 'How does the wishlist work?',
    a: 'Sign in and tap the heart icon on any product to save it. Access your wishlist from the account menu or dashboard.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. We use industry-standard encryption and never store full payment details on our servers.',
  },
  {
    q: 'How do I reset my password?',
    a: 'Go to the login page and click "Forgot password?" to receive a reset link by email.',
  },
];

export default function FAQPage() {
  return (
    <InfoPageLayout
      title="Frequently Asked Questions"
      subtitle="Quick answers to common questions."
    >
      <div className="not-prose space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-xl border border-zinc-200 bg-white transition-shadow open:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <summary className="cursor-pointer list-none px-5 py-4 font-medium text-zinc-900 transition hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4">
                {faq.q}
                <span className="text-zinc-400 transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <div className="border-t border-zinc-100 px-5 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </InfoPageLayout>
  );
}
