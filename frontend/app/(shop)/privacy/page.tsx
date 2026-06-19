import type { Metadata } from 'next';
import { InfoPageLayout, InfoSection } from '@/components/pages/InfoPageLayout';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description: 'How VexironAthletics collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      subtitle="Last updated: January 2026"
    >
      <InfoSection title="Information we collect">
        <p>
          When you create an account, place an order, or contact support, we may collect
          your name, email, phone number, shipping address, order history, and payment
          preferences. We also collect basic usage data to improve our website experience.
        </p>
      </InfoSection>
      <InfoSection title="How we use your information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Process and deliver your orders</li>
          <li>Send order confirmations and shipping updates</li>
          <li>Provide customer support</li>
          <li>Improve our products, services, and website</li>
          <li>Send marketing emails (you can unsubscribe anytime)</li>
        </ul>
      </InfoSection>
      <InfoSection title="Data sharing">
        <p>
          We do not sell your personal information. We share data only with trusted
          service providers (payment processors, shipping partners, analytics) required
          to operate our store, and only to the extent necessary.
        </p>
      </InfoSection>
      <InfoSection title="Cookies">
        <p>
          We use cookies to keep you signed in, remember cart items, and analyze site
          traffic. You can control cookies through your browser settings.
        </p>
      </InfoSection>
      <InfoSection title="Your rights">
        <p>
          You may request access to, correction of, or deletion of your personal data
          by emailing{' '}
          <a href="mailto:privacy@vexironathletics.com">privacy@vexironathletics.com</a>.
        </p>
      </InfoSection>
      <InfoSection title="Contact">
        <p>
          For privacy-related questions, contact us at{' '}
          <a href="mailto:privacy@vexironathletics.com">privacy@vexironathletics.com</a>.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
