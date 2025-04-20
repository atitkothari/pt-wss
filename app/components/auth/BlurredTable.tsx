'use client';

import { useUserAccess } from "@/app/hooks/useUserAccess";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Mail, Check, ExternalLink, CreditCard } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "../modals/AuthModal";
import { createCheckoutSession } from "@/app/lib/stripe";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  "Newsletter",
  "Early access to new features",
  "Priority support",
  "API Access (Coming soon)",
  "Export as CSV and Excel (Coming Soon)",  
];

export const BlurredTable = ({ children, className, hasSearched = false }: BlurredTableProps) => {
  const { status, loading } = useUserAccess();
  const { user, sendVerificationEmail } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const shouldBlur = hasSearched || (status !== 'trialing' && status !== 'active' && status !== 'incomplete_expired');

  const handleUpgrade = async (isYearly: boolean = true) => {
    try {
      await createCheckoutSession(isYearly);
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
    } catch (error) {
      console.error('Failed to resend verification email:', error);
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
          <div className={cn("relative min-h-[1560px] lg:min-h-[700px]", className)}>
            {/* Blurred Content with Gradient that shows some rows */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent from-5% via-indigo-50/30 via-30% to-indigo-100/90 to-100% pointer-events-none z-10"></div>
              <div className="relative">
                <div className="relative">
                  {children}
                </div>
                <div className="absolute inset-0 filter blur-[2px] pointer-events-none">
                  {children}
                </div>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="absolute inset-0 flex flex-col items-center p-8 z-20">
              {status === 'unauthenticated' ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 px-4 py-2 rounded-md">
                    Create an account to see results!
                  </h2>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    size="lg"
                    variant="outline"                    
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-0 relative shadow-md flex flex-col py-4 h-auto"
                    disabled={loading}
                  >                    
                    Start your 5-day free trial
                  </Button>
                  <p className="text-sm text-gray-600 mt-2"><b>No credit card required</b></p>
                </>
              ) : user && !user.emailVerified ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 px-4 py-2 rounded-md">
                    Verify Your Email
                  </h2>
                  <p className="text-sm text-gray-600 mt-4">
                    We've sent a verification link to your email address. Please check your inbox and click the link to verify your email.
                  </p>
                  <Button
                    onClick={handleResendVerification}
                    size="lg"
                    variant="outline"
                    className="bg-blue-600 hover:bg-blue-700 text-white mt-4"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend verification email
                  </Button>
                </>
              ) : status === 'paused' ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 px-4 py-2 rounded-md">
                    Your subscription has ended
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    Provide payment method to continue
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button
                      onClick={() => router.push('/manage-subscription')}
                      size="lg"
                      className="bg-black text-white hover:bg-white/20 border-white/20 transition-colors flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Manage Subscription</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 px-4 py-2 rounded-md">
                    Account Created! Start your free trial
                  </h2>
                  <p className="text-sm text-gray-600 mb-2 ">
                    No Credit Card Required
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button
                      onClick={() => handleUpgrade(false)}
                      size="lg"
                      className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-md flex flex-col py-4 h-auto"
                    >
                      <span className="text-base font-semibold">Monthly Plan</span>
                      <span className="text-xs font-normal opacity-90">$19.99/month</span>
                    </Button>
                    <Button
                      onClick={() => handleUpgrade(true)}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-0 relative shadow-md flex flex-col py-4 h-auto"
                    >
                      <span className="text-base font-semibold">Yearly Plan</span>
                      <span className="text-xs font-normal opacity-90">$16.5/month</span>
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">Save 17%</span>
                    </Button>
                  </div>
                </>
              )}

              {/* Features List - Only show for non-email verification states */}
              {!(user && !user.emailVerified) && (
                <div className="mt-8 w-full max-w-4xl px-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 px-4 py-2 rounded-md inline-block">All Features Included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {features.map((feature, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/90 hover:bg-white transition-colors group shadow-lg border border-gray-100 text-left"
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
                        className="bg-black text-white hover:bg-gray-100 border border-gray-300 flex items-center gap-2 font-medium shadow-md"
                      >
                        See Pricing                      
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
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