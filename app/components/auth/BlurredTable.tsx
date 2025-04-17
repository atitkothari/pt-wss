'use client';

import { useUserAccess } from "@/app/hooks/useUserAccess";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Mail, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "../modals/AuthModal";
import { createCheckoutSession } from "@/app/lib/stripe";
import Link from "next/link";

interface BlurredTableProps {
  children: React.ReactNode;
  className?: string;
  hasSearched?: boolean;
}

const features = [
  "Advanced Options Screening",
  "Covered Call Screener",
  "Cash-Secured Put Screener",
  "Customizable Filters",
  "Save & Load Screeners",
  "Advanced Filters(Delta, IV, DTE and more)",
  "Premium Yield Analysis",
  "Fundamental Filters(P/E Ratio, Market Cap and more)",
  "Column Customization",
  "Mobile Responsive Design",
  "API Access (Coming soon)",
  "Export as CSV and Excel (Coming Soon)"
];

export const BlurredTable = ({ children, className, hasSearched = false }: BlurredTableProps) => {
  const { status, loading } = useUserAccess();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const shouldBlur = hasSearched && (status === 'unauthenticated' || status === 'needs_subscription');

  const handleUpgrade = async () => {
    try {
      await createCheckoutSession(true);
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      );
    }

    if (shouldBlur) {
      return (
        <div className="relative">
          <div className={cn("filter blur-sm pointer-events-none", className)}>
            {children}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm p-4 text-center">
            {status === 'unauthenticated' ? (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Sign in to see all results!
                </h2>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white border-0 mt-2 flex items-center gap-2 justify-center"
                  disabled={loading}
                >
                  <Mail className="h-5 w-5" />
                  Start your free trial with Email
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Upgrade to Pro to see all results!
                </h2>
                <Button
                  onClick={handleUpgrade}
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white border-0 mt-2"
                >
                  Upgrade Now
                </Button>
              </>
            )}

            {/* Features List */}
            <div className="mt-8 w-full max-w-4xl px-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6">All Features Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Link href="/pricing" className="inline-block">
                  <Button
                    size="lg"
                    className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-300 flex items-center gap-2 font-medium"
                  >
                    View All Plans
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  };

  return (
    <>
      {renderContent()}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode="signin" 
      />
    </>
  );
};