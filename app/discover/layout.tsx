import { generateMetadata } from "@/app/lib/metadata";
import { generateOrganizationSchema } from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "Discover Options Trading Ideas - Trending Opportunities",
  description:
    "Discover trending options trading opportunities, including high IV stocks, upcoming earnings, and top premium yields for both covered calls and cash secured puts.",
  path: "/discover",
  type: "website",
  keywords: [
    "options trading ideas",
    "trending stocks",
    "high IV stocks",
    "earnings plays",
    "premium yields",
    "covered calls",
    "cash secured puts",
  ],
});

export default function DiscoverLayout({
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
      {children}
    </>
  );
}
