import { generateMetadata } from "@/app/lib/metadata";
import {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "FAQ - Frequently Asked Questions About Options Trading",
  description:
    "Get answers to common questions about options trading, the wheel strategy, and how to use our options screener effectively.",
  path: "/faq",
  type: "website",
  keywords: [
    "options trading FAQ",
    "wheel strategy questions",
    "options screener help",
    "covered calls FAQ",
    "cash secured puts FAQ",
    "trading questions",
    "options help",
  ],
});

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = generateOrganizationSchema({
    name: "Wheel Strategy Options",
    url: "https://wheelstrategyoptions.com",
    logo: "https://wheelstrategyoptions.com/logo.png",
    description: "Advanced options trading platform for the wheel strategy",
  });

  const webPageSchema = generateWebPageSchema({
    title: "FAQ - Frequently Asked Questions About Options Trading",
    description:
      "Get answers to common questions about options trading, the wheel strategy, and how to use our options screener effectively.",
    url: "https://wheelstrategyoptions.com/faq",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://wheelstrategyoptions.com" },
    { name: "FAQ", url: "https://wheelstrategyoptions.com/faq" },
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
