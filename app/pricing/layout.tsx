import { generateMetadata } from "@/app/lib/metadata";
import {
  generateOrganizationSchema,
  generateProductSchema,
} from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "Pricing - Wheel Strategy Options Plans & Pricing",
  description:
    "Choose the perfect plan for your options trading needs. Start with a 5-day free trial, no credit card required. Premium features for serious options traders.",
  path: "/pricing",
  type: "website",
  keywords: [
    "pricing",
    "subscription plans",
    "free trial",
    "premium features",
    "options trading platform",
    "wheel strategy tools",
  ],
});

export default function PricingLayout({
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

  const productSchema = generateProductSchema({
    name: "Wheel Strategy Options Premium",
    description:
      "Advanced options trading screener with real-time data, custom filters, and portfolio management tools",
    url: "https://wheelstrategyoptions.com/pricing",
    image: "https://wheelstrategyoptions.com/logo.png",
    brand: "Wheel Strategy Options",
    category: "Financial Software",
    offers: {
      price: "29.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://wheelstrategyoptions.com/pricing",
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {children}
    </>
  );
}
