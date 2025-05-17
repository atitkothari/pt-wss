import { generateMetadata } from '@/app/lib/metadata';
import { generateOrganizationSchema } from '@/app/lib/structured-data';

export const metadata = generateMetadata({
  title: 'Covered Call Screener - Find High-Yield Options',
  description: 'Scan 570,000+ option contracts in seconds. Find the best covered calls for the wheel strategy with our advanced screener.',
  path: '/covered-call-screener',
  type: 'website',
});

export default function CoveredCallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema({
    name: 'Wheel Strategy Options',
    url: 'https://wheelstrategyoptions.com',
    logo: 'https://wheelstrategyoptions.com/logo.png',
    description: 'Advanced options trading platform for the wheel strategy',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </>
  );
} 