'use client';

import { OptionsTableComponent } from "../components/shared/OptionsTableComponent";
import { Footer } from "../components/Footer";
import { PageLayout } from "../components/PageLayout";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useUserAccess } from "../hooks/useUserAccess";
import { useCheckoutConversion } from "../hooks/useCheckoutConversion";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { DataErrorBoundary } from "../components/DataErrorBoundary";

export default function CoveredCallScreenerPage() {
  const { loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasSearched = Object.keys(Object.fromEntries(searchParams.entries())).length > 0;
  const {status} = useUserAccess();
  
  // Handle checkout conversion tracking
  useCheckoutConversion();

  useEffect(()=>{
    // User status effect
  },[])

  // Redirect from old URLs
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has('type')) {
      const type = params.get('type');
      params.delete('type');
      // Convert old parameters to new format
      Array.from(params.entries()).forEach(([key, value]) => {
        if (!key.startsWith('put_') && !key.startsWith('call_')) {
          params.delete(key);
          params.append(`${type}_${key}`, value);
        }
      });
      router.replace(`/covered-call-screener?${params.toString()}`);
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ErrorBoundary>
        {/* Mobile Navigation Bar */}
        <div className="block md:hidden mb-4 flex items-center justify-center min-h-[20px]">
        <div className="flex flex-wrap justify-center items-center gap-1 w-full text-center">
          <Link href="/cash-secured-put-screener" className="text-xs sm:text-sm text-blue-600 hover:underline font-medium px-1 whitespace-nowrap">CSP Screener</Link>
          <span className="text-gray-300">|</span>
          <Link href="/discover" className="text-xs sm:text-sm text-blue-600 hover:underline font-medium px-1 whitespace-nowrap">Discover</Link>
          <span className="text-gray-300">|</span>
          <Link href="/trade-tracker" className="text-xs sm:text-sm text-blue-600 hover:underline font-medium px-1 whitespace-nowrap">Trade Tracker</Link>
          <span className="text-gray-300">|</span>
          <Link href="/watchlist" className="text-xs sm:text-sm text-blue-600 hover:underline font-medium px-1 whitespace-nowrap">Watchlist</Link>
          {/* <span className="text-gray-300">|</span>
           <Link href="/watchlist" className="text-xs sm:text-sm text-blue-600 hover:underline font-medium px-1 whitespace-nowrap">Watchlist</Link>*/}
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Covered Call Screener</h1>
          <Link 
            href="/cash-secured-put-screener" 
            className="hidden md:block text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Switch to Cash Secured Put Screener →
          </Link>
        </div>
      </div>
        <DataErrorBoundary>
          <div className="bg-white p-4 rounded-lg shadow-sm relative">
            <OptionsTableComponent option="call" />
          </div>
        </DataErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </PageLayout>
  );
} 