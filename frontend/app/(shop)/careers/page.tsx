import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageLayout, InfoSection } from '@/components/pages/InfoPageLayout';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Careers — ${APP_NAME}`,
  description: 'Join the VexironAthletics team.',
};

const openings = [
  {
    title: 'Customer Support Specialist',
    location: 'Lahore · Full-time',
    desc: 'Help customers with orders, returns, and product questions via email and chat.',
  },
  {
    title: 'Digital Marketing Coordinator',
    location: 'Remote · Full-time',
    desc: 'Manage social campaigns, email newsletters, and performance analytics.',
  },
  {
    title: 'Warehouse Operations Associate',
    location: 'Karachi · Full-time',
    desc: 'Pick, pack, and ship orders with accuracy and care.',
  },
];

export default function CareersPage() {
  return (
    <InfoPageLayout
      title="Careers"
      subtitle="Build the future of fashion e-commerce with us."
    >
      <InfoSection title="Why work with us">
        <ul className="list-disc space-y-2 pl-5">
          <li>Competitive salary and performance bonuses</li>
          <li>Employee discount on all {APP_NAME} products</li>
          <li>Flexible work arrangements where roles allow</li>
          <li>Growth opportunities in a fast-moving startup environment</li>
        </ul>
      </InfoSection>
      <InfoSection title="Open positions">
        <div className="not-prose space-y-4">
          {openings.map((job) => (
            <div
              key={job.title}
              className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{job.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{job.location}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{job.desc}</p>
            </div>
          ))}
        </div>
      </InfoSection>
      <InfoSection title="Apply">
        <p>
          Send your CV and a short cover letter to{' '}
          <a href="mailto:careers@vexironathletics.com">careers@vexironathletics.com</a>.
          We review applications on a rolling basis.
        </p>
        <Button asChild className="not-prose mt-4">
          <Link href="/contact">Contact HR</Link>
        </Button>
      </InfoSection>
    </InfoPageLayout>
  );
}
