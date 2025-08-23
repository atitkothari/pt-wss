import { generateMetadata } from "@/app/lib/metadata";
import {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "Available Stocks - Complete List of Tradeable Symbols",
  description:
    "Browse our complete list of available stocks for options trading. Find the perfect symbols for your wheel strategy with our comprehensive stock database.",
  path: "/available-stocks",
  type: "website",
  keywords: [
    "available stocks",
    "tradeable symbols",
    "options symbols",
    "stock list",
    "trading symbols",
    "options universe",
  ],
});

export default function AvailableStocksLayout({
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

  const webPageSchema = generateWebPageSchema({
    title: "Available Stocks - Complete List of Tradeable Symbols",
    description:
      "Browse our complete list of available stocks for options trading. Find the perfect symbols for your wheel strategy with our comprehensive stock database.",
    url: "https://wheelstrategyoptions.com/available-stocks",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://wheelstrategyoptions.com" },
    {
      name: "Available Stocks",
      url: "https://wheelstrategyoptions.com/available-stocks",
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
