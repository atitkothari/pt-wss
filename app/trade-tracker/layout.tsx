import { generateMetadata } from "@/app/lib/metadata";
import {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "Trade Tracker - Monitor Your Options Portfolio",
  description:
    "Track and analyze your options trades in real-time. Monitor performance, calculate P&L, and optimize your wheel strategy for maximum profits.",
  path: "/trade-tracker",
  type: "website",
  keywords: [
    "trade tracker",
    "portfolio management",
    "options tracking",
    "P&L calculator",
    "trade analysis",
    "wheel strategy performance",
  ],
});

export default function TradeTrackerLayout({
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
    title: "Trade Tracker - Monitor Your Options Portfolio",
    description:
      "Track and analyze your options trades in real-time. Monitor performance, calculate P&L, and optimize your wheel strategy for maximum profits.",
    url: "https://wheelstrategyoptions.com/trade-tracker",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://wheelstrategyoptions.com" },
    {
      name: "Trade Tracker",
      url: "https://wheelstrategyoptions.com/trade-tracker",
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
