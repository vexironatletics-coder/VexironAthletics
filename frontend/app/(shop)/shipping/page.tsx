import type { Metadata } from 'next';
import { InfoPageLayout, InfoSection } from '@/components/pages/InfoPageLayout';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Shipping Info — ${APP_NAME}`,
  description: 'Delivery times, shipping rates, and tracking information.',
};

export default function ShippingPage() {
  return (
    <InfoPageLayout
      title="Shipping Info"
      subtitle="Fast, reliable delivery across Pakistan."
    >
      <InfoSection title="Free shipping">
        <p>
          Enjoy <strong>free standard delivery</strong> on all orders above ₨5,000.
          Orders below that amount are charged a flat ₨250 shipping fee.
        </p>
      </InfoSection>
      <InfoSection title="Delivery times">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Major cities</strong> (Lahore, Karachi, Islamabad): 2–4 business days</li>
          <li><strong>Other urban areas:</strong> 4–6 business days</li>
          <li><strong>Remote locations:</strong> 6–10 business days</li>
        </ul>
        <p>Orders placed after 2:00 PM are processed the next business day.</p>
      </InfoSection>
      <InfoSection title="Order tracking">
        <p>
          Once your order ships, you will receive a confirmation email with tracking details.
          You can also view order status anytime from your{' '}
          <a href="/orders">My Orders</a> page when signed in.
        </p>
      </InfoSection>
      <InfoSection title="Cash on delivery">
        <p>
          We offer cash on delivery (COD) nationwide. Please ensure someone is available
          to receive the package and have the exact amount ready when possible.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
