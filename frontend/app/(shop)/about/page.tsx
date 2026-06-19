import type { Metadata } from 'next';
import { InfoPageLayout, InfoSection } from '@/components/pages/InfoPageLayout';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `About Us — ${APP_NAME}`,
  description: 'Learn about VexironAthletics — premium clothing for every lifestyle.',
};

export default function AboutPage() {
  return (
    <InfoPageLayout
      title="About Us"
      subtitle={`${APP_NAME} is built for people who value quality, comfort, and style.`}
    >
      <InfoSection title="Our story">
        <p>
          Founded in 2024, {APP_NAME} started with a simple idea: make premium fashion
          accessible for families across Pakistan. From everyday essentials to statement
          pieces, we curate collections for men, women, and children that balance quality
          craftsmanship with fair pricing.
        </p>
      </InfoSection>
      <InfoSection title="What we stand for">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Quality first</strong> — durable fabrics and thoughtful construction</li>
          <li><strong>Inclusive sizing</strong> — styles for every body and every age</li>
          <li><strong>Customer care</strong> — responsive support and hassle-free returns</li>
          <li><strong>Sustainable growth</strong> — responsible sourcing and packaging improvements</li>
        </ul>
      </InfoSection>
      <InfoSection title="Our collections">
        <p>
          Browse curated lines for <a href="/category/men">Men</a>,{' '}
          <a href="/category/women">Women</a>, and{' '}
          <a href="/category/children">Children</a> — updated seasonally with new arrivals
          and exclusive online offers.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
