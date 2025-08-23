import { generateMetadata } from "@/app/lib/metadata";
import {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "Manage Subscription - Update Your Plan & Billing",
  description:
    "Manage your Wheel Strategy Options subscription. Update billing information, change plans, or cancel your subscription anytime.",
  path: "/manage-subscription",
  type: "website",
  keywords: [
    "subscription management",
    "billing",
    "plan changes",
    "account settings",
    "subscription updates",
    "billing management",
  ],
});

export default function ManageSubscriptionLayout({
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
    title: "Manage Subscription - Update Your Plan & Billing",
    description:
      "Manage your Wheel Strategy Options subscription. Update billing information, change plans, or cancel your subscription anytime.",
    url: "https://wheelstrategyoptions.com/manage-subscription",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://wheelstrategyoptions.com" },
    {
      name: "Manage Subscription",
      url: "https://wheelstrategyoptions.com/manage-subscription",
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
