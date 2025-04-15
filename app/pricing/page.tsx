'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { useState } from "react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavBar />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pb-4 pt-8 md:pt-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 md:mb-8 px-4">
            Start with a 5-day free trial. No credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <span className={`text-base md:text-lg ${!isYearly ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
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

      {/* Pricing Card */}
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-lg mx-auto">
          <Card className="bg-white border-2 border-blue-100 shadow-lg">
            <CardHeader className="text-center pb-6 md:pb-8 border-b px-4 md:px-6">
              <CardTitle className="text-2xl md:text-3xl font-bold mb-2">Pro Plan</CardTitle>
              <CardDescription className="text-base md:text-lg text-gray-600 mb-4 md:mb-6">
                Everything you need for options trading
              </CardDescription>
              <div className="flex items-center justify-center gap-1 md:gap-2">
                <span className="text-3xl md:text-4xl font-bold text-gray-900">
                  ${isYearly ? '89' : '9'}
                </span>
                <span className="text-gray-600 text-base md:text-lg">
                  /{isYearly ? 'year' : 'month'}
                </span>
              </div>
              {isYearly && (
                <p className="text-green-600 text-xs md:text-sm mt-2">
                  $7.42/month, billed annually
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
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-base md:text-lg py-4 md:py-6">
                Start 5-Day Free Trial
              </Button>
              <p className="text-xs md:text-sm text-gray-500 text-center">
                No credit card required
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg md:text-xl font-semibold mb-2">What's included in the free trial?</h3>
            <p className="text-sm md:text-base text-gray-700">The free trial includes full access to all features for 5 days. No credit card required.</p>
          </div>
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-sm md:text-base text-gray-700">Yes, you can cancel your subscription at any time. No questions asked.</p>
          </div>
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg md:text-xl font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-sm md:text-base text-gray-700">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
          </div>          
        </div>
      </div>

      <Footer />
    </div>
  );
} 