'use client';

import { OptionTabs } from "../components/OptionTabs";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from 'next/navigation';

export default function OptionsPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const hasSearched = Object.keys(Object.fromEntries(searchParams.entries())).length > 0;

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
            <p className="text-gray-600">
              Find and analyze covered call and cash secured put opportunities for stocks in SP 500. We are working on adding more stocks to the list.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm relative">
            <OptionTabs />
          </div>
          <Footer />
        </div>
      </div>
    );
  };

  return renderContent();
} 