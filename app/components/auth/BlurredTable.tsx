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
import { sendAnalyticsEvent, AnalyticsEvents } from "@/app/utils/analytics";

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
  "API Access",
  "Advanced Filters(Delta, IV, DTE and more)",
  "Premium Yield Analysis",
  "Fundamental Filters(P/E Ratio, Market Cap and more)",
  "Column Customization",
  "Mobile Responsive Design",
  "Newsletter",
  "Early access to new features",
  "Priority support",  
  "Watchlist",  
  "Trade Tracker (Coming Soon)"
];

export const BlurredTable = ({ children, className, hasSearched = false }: BlurredTableProps) => {
  const { status, loading } = useUserAccess();
  const { user, sendVerificationEmail } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const router = useRouter();

  const shouldBlur = hasSearched || (status !== 'trialing' && status !== 'active' && status !== 'incomplete_expired');

  const handleUpgrade = async (isYearly: boolean = true) => {
    try {
      setIsUpgrading(true);
      sendAnalyticsEvent({
        event_name: isYearly ? AnalyticsEvents.PRICING_YEARLY_CLICK : AnalyticsEvents.PRICING_MONTHLY_CLICK,
        event_category: 'Pricing',
        event_label: isYearly ? 'Yearly' : 'Monthly',
        plan_type: isYearly ? 'yearly' : 'monthly'
      });
      await createCheckoutSession(isYearly);
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setIsUpgrading(false);
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
          <div className={cn("relative min-h-[1560px] lg:min-h-[900px]", className)}>
            {/* Blurred Content with Gradient that shows some rows */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent from-5% via-indigo-50/30 via-30% to-indigo-100/90 to-100% pointer-events-none z-10" style={{ top: '200px' }}></div>
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-[200px] overflow-hidden">
                  {children}
                </div>
                <div className="filter blur-[2px] pointer-events-none" style={{ clipPath: 'inset(200px 0 0 0)' }}>
                  {children}
                </div>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="absolute inset-0 flex flex-col items-center p-8 z-20" style={{ top: '200px' }}>
              {status === 'unauthenticated' ? (
                <>
                <h2 className="text-xl sm:text-2xl font-bold text-black">
                  Sign in to see all results for FREE!
                </h2>
                <p className="text-sm sm:text-base text-black-200 max-w-md">
                  Get full access to all options data and screening capabilities by signing in with your Email or Google account.
                </p>

                <Button
                  onClick={()=>setShowAuthModal(true)}
                  size="lg"
                  className="bg-white hover:bg-gray-100 text-gray-900 border-0 mt-2 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  {loading ? 'Signing in...' : 'Sign in with Google'}
                </Button>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  size="lg"
                  variant="outline"
                  className="bg-white hover:bg-gray-100 text-gray-900 border-0 mt-2 flex items-center gap-2"
                >
                  <Mail className="h-5 w-5" />
                  Sign in with Email
                </Button>
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
                    className="bg-blue-600 hover:bg-blue-700 text-black mt-4"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend verification email
                  </Button>
                </>
              ) : status === 'paused' ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 px-4 py-2 rounded-md">
                    Your subscription has ended. Please choose a subscription plan.
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button
                      onClick={() => handleUpgrade(false)}
                      size="lg"
                      disabled={isUpgrading}
                      className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-md flex flex-col py-4 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpgrading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-normal line-through">$19.99/month</span>                            
                            {/* <span className="text-base font-normal">$0.99/month for first month</span>                             */}
                          </div>
                          <span className="text-xs font-semibold">Monthly Plan</span>                          
                          {/* <span className="text-xs text-yellow-300 mt-1">Use code: MEMORIALDAY</span> */}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleUpgrade(true)}
                      size="lg"
                      disabled={isUpgrading}
                      className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-0 relative shadow-md flex flex-col py-4 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpgrading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-base font-normal">$10/month</span>
                          <span className="text-xs font-semibold">Yearly Plan</span>                          
                          {/* <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">Save 20%</span> */}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (                
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 px-4 py-2 rounded-md text-center">
                  Welcome back! Your trial has ended. Please choose a subscription plan.
                  </h2>
                  <span className="text-base font-semibold"> Our users make back their yearly subscription cost in one trade.</span>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button
                      onClick={() => handleUpgrade(false)}
                      size="lg"
                      disabled={isUpgrading}
                      className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-md flex flex-col py-4 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpgrading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-normal">$19.99/month</span>                            
                            {/* <span className="text-base font-normal">$0.99/month for first month</span>                             */}
                          </div>
                          <span className="text-xs font-semibold">Monthly Plan</span>                          
                          {/* <span className="text-xs text-yellow-300 mt-1">Use code: MEMORIALDAY</span> */}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleUpgrade(true)}
                      size="lg"
                      disabled={isUpgrading}
                      className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-0 relative shadow-md flex flex-col py-4 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpgrading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-base font-normal">$10/month</span>
                          <span className="text-xs font-semibold">Yearly Plan</span>                          
                          {/* <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">Save 20%</span> */}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              {/* Features List - Only show for non-email verification states */}
              {status!=='unauthenticated' && !( user && !user.emailVerified) && (
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