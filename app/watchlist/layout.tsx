import { generateMetadata } from "@/app/lib/metadata";
import {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: "Watchlist - Monitor Your Favorite Options",
  description:
    "Build and manage your options watchlist. Track potential trades, monitor price movements, and never miss profitable opportunities.",
  path: "/watchlist",
  type: "website",
  keywords: [
    "options watchlist",
    "trade monitoring",
    "price alerts",
    "favorite stocks",
    "options tracking",
    "trade opportunities",
  ],
});

export default function WatchlistLayout({
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
    title: "Watchlist - Monitor Your Favorite Options",
    description:
      "Build and manage your options watchlist. Track potential trades, monitor price movements, and never miss profitable opportunities.",
    url: "https://wheelstrategyoptions.com/watchlist",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://wheelstrategyoptions.com" },
    { name: "Watchlist", url: "https://wheelstrategyoptions.com/watchlist" },
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
