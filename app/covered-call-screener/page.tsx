'use client';

import { OptionsTableComponent } from "../components/shared/OptionsTableComponent";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function CoveredCallScreenerPage() {
  const { loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasSearched = Object.keys(Object.fromEntries(searchParams.entries())).length > 0;

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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50">
          <NavBar />
          <div className="max-w-screen-2xl mx-auto p-4">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-screen-2xl mx-auto p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Covered Call Screener</h1>
              <Link 
                href="/cash-secured-put-screener" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Switch to Cash Secured Put Screener →
              </Link>
            </div>
            <p className="text-gray-600 text-sm">
              New to selling options? See how much income you can generate on stocks you already hold using our <a id={'options_subheading_covered_call_calculator'} href="/covered-call-calculator" className="text-blue-600 hover:text-blue-800 underline">covered call calculator</a>.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm relative">
            <OptionsTableComponent option="call" />
          </div>
          <Footer />
        </div>
      </div>
    );
  };

  return renderContent();
} 