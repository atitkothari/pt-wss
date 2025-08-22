'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock, CreditCard } from "lucide-react";
import { createCheckoutSession } from "@/app/lib/stripe";
import { useAuth } from "@/app/context/AuthContext";
import { AuthModal } from "./AuthModal";
import { useUserAccess } from "@/app/hooks/useUserAccess";
import { useRouter } from "next/navigation";
import { sendAnalyticsEvent, AnalyticsEvents } from '@/app/utils/analytics';
import { PlausibleEvents, usePlausibleTracker } from '@/app/utils/plausible';

interface PricingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  triggerSource: 'pricing-page' | 'blurred-table';
}

const features = [
  "Advanced Options Screening",
  "Covered Call Screener",
  "Cash-Secured Put Screener",
  "Customizable Filters",
  "Save & Load Screeners",
  "Advanced Filters (Delta, IV, DTE and more)",
  "Premium Yield Analysis",
  "Fundamental Filters (P/E Ratio, Market Cap and more)",
  "Column Customization",
  "Watchlist",
  "Trade Tracker"
];

// 25% off on top of limited time pricing
const discountedPricing = {
  monthly: {
    originalPrice: 19.99,
    limitedTimePrice: 14.99,
    finalPrice: 11.24, // 14.99 * 0.75
    originalPriceStr: "$19.99",
    limitedTimePriceStr: "$14.99",
    finalPriceStr: "$11.24",
    savings: "$8.75" // 19.99 - 11.24
  },
  quarterly: {
    originalPrice: 11.99,
    limitedTimePrice: 11.99,
    finalPrice: 8.99, // 11.99 * 0.75
    originalPriceStr: "$19.99",
    limitedTimePriceStr: "$11.99",
    finalPriceStr: "$8.99",
    savings: "$11.00" // 19.99 - 8.99
  },
  yearly: {
    originalPrice: 16.50,
    limitedTimePrice: 8.33,
    finalPrice: 6.25, // 8.33 * 0.75
    originalPriceStr: "$19.99",
    limitedTimePriceStr: "$8.33",
    finalPriceStr: "$6.25",
    savings: "$13.74" // 19.99 - 6.25
  }
};

export const PricingPopup = ({ isOpen, onClose, triggerSource }: PricingPopupProps) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, userId } = useAuth();
  const { status } = useUserAccess();
  const router = useRouter();
  const { trackEvent } = usePlausibleTracker();

  // Track popup open
  React.useEffect(() => {
    if (isOpen) {
      // Google Analytics
      sendAnalyticsEvent({
        event_name: 'pricing_popup_opened',
        event_category: 'Pricing Popup',
        event_label: triggerSource,
        custom_parameters: {
          billing_cycle: billingCycle,
          user_status: status,
          trigger_source: triggerSource
        }
      });

      // Plausible Analytics
      trackEvent(PlausibleEvents.PricingStartTrialClick, {
        source: 'popup_opened',
        triggerSource,
        billingCycle,
        userStatus: status,
        userId: userId || 'anonymous'
      });

      // Facebook Pixel
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', {
          content_name: 'Pricing Popup',
          content_category: 'Pricing',
          content_type: 'popup',
          trigger_source: triggerSource
        });
      }
    }
  }, [isOpen, triggerSource, billingCycle, status, userId, trackEvent]);

  if (!isOpen) return null;

  const handleBillingToggle = (cycle: 'monthly' | 'quarterly' | 'yearly') => {
    setBillingCycle(cycle);
    sendAnalyticsEvent({
      event_name: cycle === 'yearly' ? AnalyticsEvents.PRICING_YEARLY_CLICK : 
                  cycle === 'quarterly' ? AnalyticsEvents.PRICING_QUARTERLY_CLICK : 
                  AnalyticsEvents.PRICING_MONTHLY_CLICK,
      event_category: 'Pricing',
      event_label: cycle === 'yearly' ? 'Yearly' : cycle === 'quarterly' ? 'Quarterly' : 'Monthly'
    });
    if (cycle === 'yearly') {
      trackEvent(PlausibleEvents.PricingYearlyClick, { billingCycle: 'yearly', source: 'popup' });
    } else if (cycle === 'quarterly') {
      trackEvent(PlausibleEvents.PricingQuarterlyClick, { billingCycle: 'quarterly', source: 'popup' });
    } else {
      trackEvent(PlausibleEvents.PricingMonthlyClick, { billingCycle: 'monthly', source: 'popup' });
    }
  };

  const handleStartTrial = async () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout');
    }
    try {
      setIsLoading(true);
      if (!user) {
        // Track auth modal opened from popup
        sendAnalyticsEvent({
          event_name: 'pricing_popup_auth_modal_opened',
          event_category: 'Pricing Popup',
          event_label: triggerSource,
          custom_parameters: {
            billing_cycle: billingCycle,
            trigger_source: triggerSource,
            user_status: 'unauthenticated'
          }
        });

        // Plausible Analytics
        trackEvent(PlausibleEvents.PricingStartTrialClick, {
          source: 'popup_auth_modal_opened',
          triggerSource,
          billingCycle,
          userStatus: 'unauthenticated',
          userId: 'anonymous'
        });

        setShowAuthModal(true);
        return;
      }

      if (!user.emailVerified) {
        alert("Please verify your email first!");
        return;
      }

      sendAnalyticsEvent({
        event_name: AnalyticsEvents.PRICING_START_TRIAL_CLICK,
        event_category: 'Pricing',
        event_label: billingCycle === 'yearly' ? 'Yearly' : billingCycle === 'quarterly' ? 'Quarterly' : 'Monthly'
      });
      trackEvent(PlausibleEvents.PricingStartTrialClick, { source: 'popup', triggerSource });
      
      // Pass the coupon code to the checkout session with limited time pricing
      await createCheckoutSession(billingCycle, true, 'LABORDAY25');
      
      // Track successful checkout session creation
      sendAnalyticsEvent({
        event_name: 'pricing_popup_checkout_created',
        event_category: 'Pricing Popup',
        event_label: triggerSource,
        custom_parameters: {
          billing_cycle: billingCycle,
          trigger_source: triggerSource,
          user_status: status,
          coupon_code: 'LABORDAY25',
          pricing_type: 'limited_time'
        }
      });

      // Plausible Analytics
      trackEvent(PlausibleEvents.PricingStartTrialClick, {
        source: 'popup_checkout_created',
        triggerSource,
        billingCycle,
        userStatus: status,
        userId: userId || 'anonymous',
        couponCode: 'LABORDAY25',
        pricingType: 'limited_time'
      });
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthModalClose = () => {
    // Track auth modal closed
    sendAnalyticsEvent({
      event_name: 'pricing_popup_auth_modal_closed',
      event_category: 'Pricing Popup',
      event_label: triggerSource,
      custom_parameters: {
        billing_cycle: billingCycle,
        trigger_source: triggerSource,
        user_status: status
      }
    });

    // Plausible Analytics
    trackEvent(PlausibleEvents.PricingStartTrialClick, {
      source: 'popup_auth_modal_closed',
      triggerSource,
      billingCycle,
      userStatus: status,
      userId: userId || 'anonymous'
    });

    setShowAuthModal(false);
  };

  const getBillingCycleLabel = (cycle: 'monthly' | 'quarterly' | 'yearly') => {
    switch (cycle) {
      case 'monthly': return '/month';
      case 'quarterly': return '/month';
      case 'yearly': return '/month';
      default: return '/month';
    }
  };

  const getPriceDisplay = (cycle: 'monthly' | 'quarterly' | 'yearly') => {
    const pricing = discountedPricing[cycle];
    return (
      <>
        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <span className="line-through text-gray-300 font-normal">{pricing.originalPriceStr}</span> 
          <span className="line-through text-gray-600 font-normal mx-1 sm:mx-2">{pricing.limitedTimePriceStr}</span>
          <span className="text-black">{pricing.finalPriceStr}</span>
        </span>
        <span className="text-gray-600 text-sm sm:text-base md:text-lg">
          {getBillingCycleLabel(cycle)}
        </span>
      </>
    );
  };

  const getYearlyEquivalent = (cycle: 'monthly' | 'quarterly' | 'yearly') => {
    if (cycle === 'yearly') {
      const pricing = discountedPricing.yearly;
      const yearlyTotal = pricing.finalPrice * 12;
      const originalYearlyTotal = pricing.originalPrice * 12;
      const limitedTimeYearlyTotal = pricing.limitedTimePrice * 12;
      return (
        <p className="text-green-600 text-xs md:text-sm mt-2">
          <span className="line-through text-gray-300 font-normal">{originalYearlyTotal.toFixed(0)}</span> 
          <span className="line-through text-gray-600 font-normal mx-1">{limitedTimeYearlyTotal.toFixed(0)}</span>
          <span className="text-black">{yearlyTotal.toFixed(0)}/year</span>
        </p>
      );
    }
    return null;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => {
        // Track popup close via backdrop click
        sendAnalyticsEvent({
          event_name: 'pricing_popup_closed',
          event_category: 'Pricing Popup',
          event_label: triggerSource,
          custom_parameters: {
            billing_cycle: billingCycle,
            user_status: status,
            trigger_source: triggerSource,
            close_method: 'backdrop_click'
          }
        });

        // Plausible Analytics
        trackEvent(PlausibleEvents.PricingStartTrialClick, {
          source: 'popup_closed',
          triggerSource,
          billingCycle,
          userStatus: status,
          userId: userId || 'anonymous',
          closeMethod: 'backdrop_click'
        });

        onClose();
      }}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
          {/* Header with close button */}
          <div className="flex justify-between items-start p-4 sm:p-6 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <div className="bg-red-100 text-red-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                  🎉 LIMITED TIME OFFER
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-600 text-xs sm:text-sm font-medium">Expires in 9 days</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Get an Additional 25% Off!
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
                Already discounted prices + extra 25% off with coupon code <span className="font-mono bg-yellow-100 text-yellow-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-semibold break-words">LABORDAY25</span>
              </p>
            </div>
            <Button
              onClick={() => {
                // Track popup close
                sendAnalyticsEvent({
                  event_name: 'pricing_popup_closed',
                  event_category: 'Pricing Popup',
                  event_label: triggerSource,
                  custom_parameters: {
                    billing_cycle: billingCycle,
                    user_status: status,
                    trigger_source: triggerSource,
                    close_method: 'close_button'
                  }
                });

                // Plausible Analytics
                trackEvent(PlausibleEvents.PricingStartTrialClick, {
                  source: 'popup_closed',
                  triggerSource,
                  billingCycle,
                  userStatus: status,
                  userId: userId || 'anonymous',
                  closeMethod: 'close_button'
                });

                onClose();
              }}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Billing Toggle */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={() => handleBillingToggle('monthly')}
                className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  billingCycle === 'monthly' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => handleBillingToggle('quarterly')}
                className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  billingCycle === 'quarterly' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Quarterly
              </button>
              <button
                onClick={() => handleBillingToggle('yearly')}
                className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  billingCycle === 'yearly' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-4 sm:p-6">
            <Card className="bg-white border-2 border-blue-100 shadow-lg">
              <CardHeader className="text-center pb-4 sm:pb-6 border-b px-4 sm:px-6">
                <CardTitle className="text-xl sm:text-2xl font-bold mb-2">Pro Plan</CardTitle>
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {getPriceDisplay(billingCycle)}
                </div>
                {getYearlyEquivalent(billingCycle)}
                <div className="mt-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-xs sm:text-sm font-medium leading-relaxed">
                    💰 Save {discountedPricing[billingCycle].savings} per month with coupon code LABORDAY25
                  </p>
                </div>
                
                {/* Action Button - moved below green box */}
                <div className="mt-4">
                                  {status === 'active' || status === 'paused' ? (
                  <Button 
                    onClick={() => {
                      // Track manage subscription click from popup
                      sendAnalyticsEvent({
                        event_name: 'pricing_popup_manage_subscription_clicked',
                        event_category: 'Pricing Popup',
                        event_label: triggerSource,
                        custom_parameters: {
                          billing_cycle: billingCycle,
                          trigger_source: triggerSource,
                          user_status: status
                        }
                      });

                      // Plausible Analytics
                      trackEvent(PlausibleEvents.PricingStartTrialClick, {
                        source: 'popup_manage_subscription_clicked',
                        triggerSource,
                        billingCycle,
                        userStatus: status,
                        userId: userId || 'anonymous'
                      });

                      router.push('/manage-subscription');
                    }}
                    className="w-full bg-black text-white flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Manage Subscription</span>
                  </Button>
                  ) : (
                    <Button 
                      onClick={handleStartTrial}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-4 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        'Get 25% Off Now'
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
        initialMode="signin"
      />
    </>
  );
};
