import type { Metadata } from 'next';
import { InfoPageLayout, InfoSection } from '@/components/pages/InfoPageLayout';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_NAME}`,
  description: 'Terms and conditions for using the VexironAthletics website and services.',
};

export default function TermsPage() {
  return (
    <InfoPageLayout
      title="Terms of Service"
      subtitle="Last updated: January 2026"
    >
      <InfoSection title="Acceptance of terms">
        <p>
          By accessing or using the {APP_NAME} website, you agree to these Terms of Service.
          If you do not agree, please do not use our services.
        </p>
      </InfoSection>
      <InfoSection title="Accounts">
        <p>
          You are responsible for maintaining the confidentiality of your account credentials
          and for all activity under your account. Notify us immediately of any unauthorized use.
        </p>
      </InfoSection>
      <InfoSection title="Orders and pricing">
        <p>
          All prices are listed in Pakistani Rupees (PKR) unless stated otherwise. We reserve
          the right to refuse or cancel orders due to pricing errors, stock unavailability,
          or suspected fraud.
        </p>
      </InfoSection>
      <InfoSection title="Shipping and returns">
        <p>
          Delivery times are estimates, not guarantees. Returns are subject to our{' '}
          <a href="/returns">Returns Policy</a>. Refunds are issued to the original payment
          method where applicable.
        </p>
      </InfoSection>
      <InfoSection title="Intellectual property">
        <p>
          All content on this site — including logos, images, text, and design — is owned
          by {APP_NAME} and protected by copyright and trademark laws. Unauthorized use is prohibited.
        </p>
      </InfoSection>
      <InfoSection title="Limitation of liability">
        <p>
          {APP_NAME} is not liable for indirect, incidental, or consequential damages arising
          from use of our website or products, to the maximum extent permitted by law.
        </p>
      </InfoSection>
      <InfoSection title="Changes">
        <p>
          We may update these terms at any time. Continued use of the site after changes
          constitutes acceptance of the revised terms.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
