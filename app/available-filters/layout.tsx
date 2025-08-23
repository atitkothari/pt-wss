import { generateMetadata } from "@/app/lib/metadata";
import {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "Available Filters - Advanced Options Screening Tools",
  description:
    "Explore our comprehensive suite of options screening filters. Customize your search with Delta, IV, P/E ratios, volume, and more for precise trade selection.",
  path: "/available-filters",
  type: "website",
  keywords: [
    "options filters",
    "screening tools",
    "Delta filter",
    "IV filter",
    "volume filter",
    "custom filters",
    "options screener",
  ],
});

export default function AvailableFiltersLayout({
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
    title: "Available Filters - Advanced Options Screening Tools",
    description:
      "Explore our comprehensive suite of options screening filters. Customize your search with Delta, IV, P/E ratios, volume, and more for precise trade selection.",
    url: "https://wheelstrategyoptions.com/available-filters",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://wheelstrategyoptions.com" },
    {
      name: "Available Filters",
      url: "https://wheelstrategyoptions.com/available-filters",
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
