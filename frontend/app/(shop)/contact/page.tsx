import type { Metadata } from 'next';
import { InfoPageLayout } from '@/components/pages/InfoPageLayout';
import { ContactForm } from '@/components/pages/ContactForm';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Contact Us — ${APP_NAME}`,
  description: 'Get in touch with the VexironAthletics support team.',
};

export default function ContactPage() {
  return (
    <InfoPageLayout
      title="Contact Us"
      subtitle="We are here to help with orders, sizing, returns, and anything else you need."
    >
      <p>
        Our customer support team is available Monday through Saturday, 9:00 AM – 6:00 PM (PKT).
        We aim to respond to all inquiries within 24 hours.
      </p>
      <ul className="mt-4 list-none space-y-2 pl-0">
        <li>
          <strong>Email:</strong>{' '}
          <a href="mailto:support@vexironathletics.com">support@vexironathletics.com</a>
        </li>
        <li>
          <strong>Phone:</strong> +92 300 1234567
        </li>
        <li>
          <strong>Address:</strong> Lahore, Punjab, Pakistan
        </li>
      </ul>
      <ContactForm />
    </InfoPageLayout>
  );
}
