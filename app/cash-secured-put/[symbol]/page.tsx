import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { generateWebPageSchema, generateBreadcrumbSchema } from '@/app/lib/structured-data';
import { SymbolPage } from '@/app/components/SymbolPage';
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
    title: `${symbol} Cash Secured Put Screener - Find Options for ${symbol}`,
    description: `Find the best cash secured put options for ${symbol}. Analyze premium yields, expiration dates, and strike prices for optimal cash secured put strategies.`,
    openGraph: {
      title: `${symbol} Cash Secured Put Screener - Find Options for ${symbol}`,
      description: `Find the best cash secured put options for ${symbol}. Analyze premium yields, expiration dates, and strike prices for optimal cash secured put strategies.`,
      url: `https://wheelstrategyoptions.com/cash-secured-put/${symbol}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Cash Secured Put Screener - Find Options for ${symbol}`,
      description: `Find the best cash secured put options for ${symbol}. Analyze premium yields, expiration dates, and strike prices for optimal cash secured put strategies.`,
    },
  };
}

export async function generateStaticParams() {
  return validSymbols.map((symbol) => ({
    symbol,
  }));
}

export default function CashSecuredPutSymbolPage({ params }: Props) {
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
    title: `${symbol} Cash Secured Put Screener`,
    description: `Find the best cash secured put options for ${symbol}. Analyze premium yields, expiration dates, and strike prices.`,
    url: `https://wheelstrategyoptions.com/cash-secured-put/${symbol}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://wheelstrategyoptions.com' },
    { name: 'Cash Secured Put Screener', url: 'https://wheelstrategyoptions.com/cash-secured-put' },
    { name: `${symbol} Cash Secured Put Screener`, url: `https://wheelstrategyoptions.com/cash-secured-put/${symbol}` },
  ]);

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
      <SymbolPage symbol={symbol} type="put" />
    </>
  );
} 