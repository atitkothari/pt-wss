import { generateMetadata } from "@/app/lib/metadata";
import {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
} from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "Covered Call Calculator - Calculate Premium Income & Returns",
  description:
    "Use our advanced covered call calculator to estimate premium income, calculate returns, and analyze risk-reward scenarios for your wheel strategy.",
  path: "/covered-call-calculator",
  type: "website",
  keywords: [
    "covered call calculator",
    "premium calculator",
    "options calculator",
    "return calculator",
    "risk analysis",
    "wheel strategy calculator",
  ],
});

export default function CoveredCallCalculatorLayout({
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
    title: "Covered Call Calculator - Calculate Premium Income & Returns",
    description:
      "Use our advanced covered call calculator to estimate premium income, calculate returns, and analyze risk-reward scenarios for your wheel strategy.",
    url: "https://wheelstrategyoptions.com/covered-call-calculator",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://wheelstrategyoptions.com" },
    {
      name: "Covered Call Calculator",
      url: "https://wheelstrategyoptions.com/covered-call-calculator",
    },
  ]);

  const howToSchema = generateHowToSchema([
    {
      name: "Enter Stock Information",
      text: "Input the stock symbol, current price, and number of shares you own.",
    },
    {
      name: "Select Option Details",
      text: "Choose the strike price, expiration date, and option premium.",
    },
    {
      name: "Review Results",
      text: "Analyze your potential returns, breakeven points, and risk metrics.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {children}
    </>
  );
}
