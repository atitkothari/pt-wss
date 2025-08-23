import { generateMetadata } from "@/app/lib/metadata";
import { generateOrganizationSchema } from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "Cash Secured Put Screener - Find High-Yield Options",
  description:
    "Scan 570,000+ option contracts in seconds. Find the best cash secured puts for the wheel strategy with our advanced screener.",
  path: "/cash-secured-put-screener",
  type: "website",
  keywords: [
    "cash secured puts",
    "CSP screener",
    "put options",
    "wheel strategy",
    "options trading",
    "premium income",
  ],
});

export default function CashSecuredPutScreenerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema({
    name: "Wheel Strategy Options",
    url: "https://wheelstrategyoptions.com",
    logo: "https://wheelstrategyoptions.com/logo.png",
    description: "Advanced options trading platform for the wheel strategy",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="min-h-screen bg-gray-50">{children}</div>
    </>
  );
}
