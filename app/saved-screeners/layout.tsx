import { generateMetadata } from "@/app/lib/metadata";
import {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "Saved Screeners - Your Custom Options Filters",
  description:
    "Access your saved options screeners and custom filters. Never lose your winning setups and get fresh results delivered to your inbox.",
  path: "/saved-screeners",
  type: "website",
  keywords: [
    "saved screeners",
    "custom filters",
    "options filters",
    "screener setup",
    "filter management",
    "options strategy",
  ],
});

export default function SavedScreenersLayout({
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
    title: "Saved Screeners - Your Custom Options Filters",
    description:
      "Access your saved options screeners and custom filters. Never lose your winning setups and get fresh results delivered to your inbox.",
    url: "https://wheelstrategyoptions.com/saved-screeners",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://wheelstrategyoptions.com" },
    {
      name: "Saved Screeners",
      url: "https://wheelstrategyoptions.com/saved-screeners",
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
