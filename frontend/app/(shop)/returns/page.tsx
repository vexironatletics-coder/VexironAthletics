import type { Metadata } from 'next';
import { InfoPageLayout, InfoSection } from '@/components/pages/InfoPageLayout';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Returns — ${APP_NAME}`,
  description: 'Return and exchange policy for VexironAthletics orders.',
};

export default function ReturnsPage() {
  return (
    <InfoPageLayout
      title="Returns & Exchanges"
      subtitle="Shop with confidence — easy returns within 30 days."
    >
      <InfoSection title="30-day return policy">
        <p>
          Items may be returned within <strong>30 days</strong> of delivery if they are
          unworn, unwashed, and in original packaging with tags attached.
        </p>
      </InfoSection>
      <InfoSection title="How to return">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Email <a href="mailto:support@vexironathletics.com">support@vexironathletics.com</a> with your order number.</li>
          <li>We will send a return authorization and pickup or drop-off instructions.</li>
          <li>Pack items securely in the original packaging.</li>
          <li>Refunds are processed within 5–7 business days after we receive the return.</li>
        </ol>
      </InfoSection>
      <InfoSection title="Exchanges">
        <p>
          Need a different size or color? Contact us within 30 days and we will arrange
          an exchange at no extra shipping cost for your first exchange.
        </p>
      </InfoSection>
      <InfoSection title="Non-returnable items">
        <ul className="list-disc space-y-2 pl-5">
          <li>Items marked as final sale</li>
          <li>Underwear, swimwear, and accessories worn for hygiene reasons</li>
          <li>Items without original tags or packaging</li>
        </ul>
      </InfoSection>
    </InfoPageLayout>
  );
}
