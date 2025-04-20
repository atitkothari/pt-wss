import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { generateWebPageSchema, generateBreadcrumbSchema } from '@/app/lib/structured-data';
import { validSymbols } from '@/app/lib/valid-symbols';

interface Props {
  params: {
    symbol: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = params;
  
  if (!validSymbols.includes(symbol)) {
    return {
      title: 'Stock Not Found',
      description: 'The requested stock symbol could not be found.',
    };
  }

  return {
    title: `${symbol} Covered Call Screener - Find High-Yield Options`,
    description: `Find the best covered call options for ${symbol}. Analyze premium yields, expiration dates, and strike prices for optimal covered call strategies.`,
    openGraph: {
      title: `${symbol} Covered Call Screener - Find High-Yield Options`,
      description: `Find the best covered call options for ${symbol}. Analyze premium yields, expiration dates, and strike prices for optimal covered call strategies.`,
      url: `https://wheelstrategyoptions.com/covered-call/${symbol}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Covered Call Screener - Find High-Yield Options`,
      description: `Find the best covered call options for ${symbol}. Analyze premium yields, expiration dates, and strike prices for optimal covered call strategies.`,
    },
  };
}

export default function StockCoveredCallPage({ params }: Props) {
  const { symbol } = params;

  if (!validSymbols.includes(symbol)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Stock Not Found</h1>
        <p>The requested stock symbol could not be found.</p>
      </div>
    );
  }

  // Generate structured data for SEO
  const webPageSchema = generateWebPageSchema({
    title: `${symbol} Covered Call Screener`,
    description: `Find the best covered call options for ${symbol}. Analyze premium yields, expiration dates, and strike prices.`,
    url: `https://wheelstrategyoptions.com/covered-call/${symbol}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://wheelstrategyoptions.com' },
    { name: 'Covered Call Screener', url: 'https://wheelstrategyoptions.com/covered-call-screener' },
    { name: `${symbol} Covered Calls`, url: `https://wheelstrategyoptions.com/covered-call/${symbol}` },
  ]);

  // Add stock-specific schema
  const stockSchema = {
    "@context": "https://schema.org",
    "@type": "Stock",
    "name": symbol,
    "description": `Covered call options for ${symbol}`,
    "tickerSymbol": symbol,
    "potentialAction": {
      "@type": "TradeAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://wheelstrategyoptions.com/covered-call-screener?call_search=${symbol}`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "USD"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://wheelstrategyoptions.com/covered-call/${symbol}`
    }
  };

  // Redirect to the main screener with call_search parameter
  redirect(`/covered-call-screener?call_search=${symbol}`);

  // This return statement is never reached due to the redirect,
  // but it's needed for TypeScript and to maintain SEO benefits
  return (
    <>
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stockSchema) }}
      />
    </>
  );
} 