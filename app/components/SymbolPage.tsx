import { fetchOptionsData } from "@/app/services/api";
import { Option } from "@/app/types/option";
import { PageLayout } from "./PageLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OptionsTable } from "./table/OptionsTable";
import { defaultVisibleColumns } from "@/app/config/filterConfig";
import Image from "next/image";

interface SymbolPageProps {
  symbol: string;
  type: 'call' | 'put';
}

interface CompanyProfile {
  companyName: string;
  description: string;
  image: string;
}

async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=fbe034b085958a5981944806f4414112`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data && data.length > 0) {
      return data[0];
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch company profile:", error);
    return null;
  }
}

export async function SymbolPage({ symbol, type }: SymbolPageProps) {
  const [companyProfile, optionsData] = await Promise.all([
    getCompanyProfile(symbol),
    fetchOptionsData([{ field: 'symbol', operation: '==', value: symbol }], 1, 10, undefined, undefined, type)
  ]);

  const title = type === 'call' ? `Covered Call` : `Cash Secured Put`;
  const screenerPath = type === 'call' ? `/covered-call-screener` : `/cash-secured-put-screener`;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
import { configDefaultVisibleColumns } from "@/app/config/filterConfig";
import Image from "next/image";

// ... (imports)

// ... (SymbolPageProps, CompanyProfile, getCompanyProfile)

export async function SymbolPage({ symbol, type }: SymbolPageProps) {
  // ... (data fetching)

  const title = type === 'call' ? `Covered Call` : `Cash Secured Put`;
  const screenerPath = type === 'call' ? `/covered-call-screener` : `/cash-secured-put-screener`;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {companyProfile ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              <Image src={companyProfile.image} alt={`${companyProfile.companyName} logo`} width={64} height={64} className="h-16 w-16 rounded-full" />
              <div>
                <h1 className="text-4xl font-bold">{companyProfile.companyName} ({symbol})</h1>
                <h2 className="text-2xl font-semibold">{title} Opportunities</h2>
              </div>
            </div>
            <p className="text-lg mb-8">{companyProfile.description}</p>
          </>
        ) : (
          <h1 className="text-4xl font-bold mb-8">{symbol} {title} Opportunities</h1>
        )}

        <h3 className="text-3xl font-bold mb-4">Top 10 {title} Options</h3>
        <OptionsTable options={optionsData.options} optionType={type} visibleColumns={defaultVisibleColumns} />

        <div className="text-center mt-8">
          <Link href={`${screenerPath}?${type}_search=${symbol}`}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              View All {symbol} {title} Options
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
