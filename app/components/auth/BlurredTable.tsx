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
  "Export as CSV and Excel (Coming Soon)",
  "Newsletter"
];

export const BlurredTable = ({ children, className, hasSearched = false }: BlurredTableProps) => {
  const { status, loading } = useUserAccess();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const shouldBlur = hasSearched || status !== 'trial' && status !== 'pro';

  const handleUpgrade = async (isYearly: boolean = true) => {
    try {
      await createCheckoutSession(isYearly);
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
          <div className={cn("relative", className)}>
            {/* Blurred Content with Gradient that shows some rows */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent from-5% via-indigo-50/30 via-30% to-indigo-100/90 to-100% pointer-events-none z-10"></div>
              <div className="filter blur-[2px] pointer-events-none">
                {children}
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="absolute inset-0 flex flex-col items-center bg-transparent p-4 text-center z-20 pt-[10vh]">
              {status === 'unauthenticated' ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 bg-white/80 px-4 py-2 rounded-md shadow-sm">
                    Sign in to see all results!
                  </h2>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white border-0 mt-2 flex items-center gap-2 justify-center shadow-md"
                    disabled={loading}
                  >
                    <Mail className="h-5 w-5" />
                    Start your 5-day free trial
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">No credit card required</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 px-4 py-2 rounded-md">
                    Signup for 5 day free trial. No credit card required.
                  </h2>
                  <p className="text-sm text-gray-600 mb-2 ">
                    Try the wheel strategy screener with all features. After your trial, continue for just $7/month(billed annually)
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button
                      onClick={() => handleUpgrade(false)}
                      size="lg"
                      className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-md flex flex-col py-4 h-auto"
                    >
                      <span className="text-base font-semibold">Monthly Plan</span>
                      <span className="text-xs font-normal opacity-90">$9/month</span>
                    </Button>
                    <Button
                      onClick={() => handleUpgrade(true)}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-0 relative shadow-md flex flex-col py-4 h-auto"
                    >
                      <span className="text-base font-semibold">Yearly Plan</span>
                      <span className="text-xs font-normal opacity-90">$7/month</span>
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">Save 22%</span>
                    </Button>
                  </div>
                </>
              )}

              {/* Features List - Moved back to the bottom */}
              <div className="mt-8 w-full max-w-4xl px-4">
                <h3 className="text-xl font-bold text-gray-900 mb-6 px-4 py-2 rounded-md inline-block">All Features Included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {features.map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/90 hover:bg-white transition-colors group shadow-sm border border-gray-100 text-left"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors text-left">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <Link href="/pricing" className="inline-block">
                    <Button
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 flex items-center gap-2 font-medium shadow-md"
                    >
                      See Pricing
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
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