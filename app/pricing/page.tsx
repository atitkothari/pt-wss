'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, Mail, CreditCard } from "lucide-react";
import { Footer } from "../components/Footer";
import { PageLayout } from "../components/PageLayout";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { createCheckoutSession } from "@/app/lib/stripe";
import { AuthModal } from "@/app/components/modals/AuthModal";
import { useUserAccess } from "@/app/hooks/useUserAccess";
import DebugEnv from "../components/DebugEnv";
import { sendAnalyticsEvent, AnalyticsEvents } from '../utils/analytics';
import { useRouter } from "next/navigation";
import { usePlausibleTracking } from '../hooks/usePlausibleTracking';
import { StockChips } from '../components/StockChips';
import { pricingInfo } from "../config/pricingInfo";
import { fetchOptionsData } from "../services/api";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  
  const [visitCount, setVisitCount] = useState(0);
  const [isLimitedTime, setIsLimitedTime] = useState(false);
  const { user, userId } = useAuth();
  const { status } = useUserAccess();
  const router = useRouter();
  const { trackPricingEvent } = usePlausibleTracking();  

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const count = parseInt(localStorage.getItem('pricingPageVisitCount') || '0', 10) + 1;
      localStorage.setItem('pricingPageVisitCount', count.toString());
      setVisitCount(count);
      setIsLimitedTime(count > 2);
    }

    const reportPricingPage = async ()=>{      
      await fetchOptionsData([], undefined, undefined, undefined, undefined, undefined, userId, 'pricing_page');
    }
    reportPricingPage();
  }, []);

  const handleBillingToggle = (isYearly: boolean) => {
    setIsYearly(isYearly);
    sendAnalyticsEvent({
      event_name: isYearly ? AnalyticsEvents.PRICING_YEARLY_CLICK : AnalyticsEvents.PRICING_MONTHLY_CLICK,
      event_category: 'Pricing',
      event_label: isYearly ? 'Yearly' : 'Monthly'
    });
    trackPricingEvent('billing_toggle', { isYearly });
  };

  const handleStartTrial = async () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout');
    }
    try {
      setIsLoading(true);
      if (!user) {
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
        event_label: isYearly ? 'Yearly' : 'Monthly'
      });
      trackPricingEvent('start_trial');
      await createCheckoutSession(isYearly, isLimitedTime);
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful auth modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    // After successful auth, the useEffect above will handle the redirect
  };

  const handleContactClick = () => {
    sendAnalyticsEvent({
      event_name: AnalyticsEvents.CONTACT_CLICK,
      event_category: 'Contact',
      event_label: 'Pricing Page'
    });
    trackPricingEvent('contact');
    window.location.href = 'mailto:reply@wheelstrategyoptions.com';
  };

  const features = [
    "Advanced Options Screening",
    "Covered Call Screener",
    "Cash-Secured Put Screener",
    "Customizable Filters",
    "Save & Load Screeners",
    "API Access",
    "Advanced Filters (Delta, IV, DTE and more)",
    "Premium Yield Analysis",
    "Fundamental Filters (P/E Ratio, Market Cap and more)",
    "Column Customization",
    "Mobile Responsive Design",    
    "Watchlist",
    "Trade Tracker"
  ];

  return (
    <PageLayout className="bg-white text-gray-900">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
        initialMode="signin"
      />
            
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pb-4 pt-8 md:pt-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 md:mb-8 px-4">
          Scan 570,000+ option contracts in seconds.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <span className={`text-base md:text-lg ${!isYearly ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
              Monthly
            </span>
            <button
              onClick={() => {
                handleBillingToggle(!isYearly);
              }}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: isYearly ? '#3B82F6' : '#E5E7EB' }}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className={`text-base md:text-lg ${isYearly ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                Yearly
              </span>
              <span className="bg-green-100 text-green-700 text-xs md:text-sm px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium whitespace-nowrap">
                Save 17%
              </span>
            </div>           
          </div>
        </div>
      </div>

      {/* Pricing Card and Stock Chips Section */}
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
          {/* Pricing Card */}
          <div className="w-full lg:w-1/3">
            <Card className="bg-white border-2 border-blue-100 shadow-lg">
              <CardHeader className="text-center pb-6 md:pb-8 border-b px-4 md:px-6">
                <CardTitle className="text-2xl md:text-3xl font-bold mb-2">Pro Plan</CardTitle>                

                <div className="flex items-center justify-center gap-1 md:gap-2">
                  {isYearly ? (
                    <>
                      <span className="text-3xl md:text-4xl font-bold text-gray-900">
                        <span className="line-through">{isLimitedTime ? pricingInfo.limitedTime.yearly.lineThrough : pricingInfo.regular.yearly.lineThrough}</span> {isLimitedTime ? pricingInfo.limitedTime.yearly.priceStr : pricingInfo.regular.yearly.priceStr}
                      </span>
                      <span className="text-gray-600 text-base md:text-lg">
                        /month
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl md:text-4xl font-bold text-gray-900">
                          {isLimitedTime && <span className="line-through">{pricingInfo.limitedTime.monthly.lineThrough}</span>} {isLimitedTime ? pricingInfo.limitedTime.monthly.priceStr : pricingInfo.regular.monthly.priceStr}
                        </span>                      
                        <span className="text-gray-600 text-base md:text-lg">
                          /month
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {isYearly ? (
                  <p className="text-green-600 text-xs md:text-sm mt-2">
                    <span className="line-through">{isLimitedTime ? pricingInfo.limitedTime.yearly.lineThroughYear : pricingInfo.regular.yearly.lineThroughYear}</span> {isLimitedTime ? pricingInfo.limitedTime.yearly.yearlyEquivalentStr : pricingInfo.regular.yearly.yearlyEquivalentStr}
                  </p>
                ): null}
                {isLimitedTime && (
                  <p className="text-red-600 text-xs md:text-sm mt-2 font-semibold">
                    Limited time offer! Discounted price available for a short period.
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-6 md:pt-8 px-4 md:px-6">
                <ul className="space-y-3 md:space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 md:gap-3">
                      {feature.toLowerCase().includes("coming soon") ? (
                        <Clock className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm md:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 md:gap-4 pt-6 md:pt-8 px-4 md:px-6">
                {status === 'active' || status === 'paused' ? (
                  <Button 
                    onClick={() => router.push('/manage-subscription')}
                    className="w-full bg-black text-white flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Manage Subscription</span>
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleStartTrial}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-base md:text-lg py-4 md:py-6 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        'Upgrade'
                      )}
                    </Button>                  
                  </>
                )}
                <Button
                  onClick={handleContactClick}
                  size="sm"
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  Have Questions?
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Stock Chips Section */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 h-full">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">
                Tool That Pays For Itself
              </h2>
              <p className="text-gray-600 mb-6">
                Our users make back their yearly subscription cost in one trade. These stocks have multiple weekly options <b>contracts(puts) that pay more than the annual subscription.</b> 
              </p>
              <StockChips />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          What Our Users Have To Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <img 
              src="/testimonials/1.webp" 
              alt="User testimonial 1" 
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <img 
              src="/testimonials/2.webp" 
              alt="User testimonial 2" 
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <img 
              src="/testimonials/3.webp" 
              alt="User testimonial 3" 
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <img 
              src="/testimonials/4.webp" 
              alt="User testimonial 4" 
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <img 
              src="/testimonials/5.webp" 
              alt="User testimonial 5" 
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <img 
              src="/testimonials/6.webp" 
              alt="User testimonial 6" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">          
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-sm md:text-base text-gray-700">Yes, you can cancel your subscription at any time. No questions asked.</p>
          </div>
          {/* <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg md:text-xl font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-sm md:text-base text-gray-700">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
          </div> */}
        </div>
      </div>
      <Button
                onClick={handleContactClick}
                size="lg"
                variant="default"
                className="mx-auto block hover:text-gray-900 hover:bg-gray-100"
              >
                Contact Us
      </Button>
      <Footer />
    </PageLayout>
  );
} 