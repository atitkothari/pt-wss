import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";

export default function PricingPage() {
  const features = [
    "Advanced Options Screening",
    "Covered Call Screener",
    "Cash-Secured Put Screener",
    // "Real-time Market Data",
    "Customizable Filters",
    "Save & Load Screeners",
    "Advanced Filters(Delta, IV, DTE and more)",
    "Premium Yield Analysis",
    // "Strike Price Optimization",
    // "Expiration Date Selection",
    // "Volume & Liquidity Filters",
    // "Implied Volatility Analysis",
    // "Delta Filtering",
    "Fundamental Filters(P/E Ratio, Market Cap and more)",
    // "P/E Ratio Screening",
    // "Market Cap Filtering",
    // "Sector-based Filtering",
    // "Moving Average Analysis",
    // "Moneyness Range Filtering",
    "Column Customization",
    "Mobile Responsive Design",
    "API Access (Coming soon)",
    "Export as CSV and Excel (Coming Soon)"
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavBar />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start with a 5-day free trial. No credit card required.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Trial Card */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl">Free Trial</CardTitle>
              <CardDescription className="text-gray-600">
                Try all features for 5 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6">$0</div>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {feature.toLowerCase().includes("coming soon") ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </CardFooter>
          </Card>

          {/* Monthly Plan */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl">Monthly</CardTitle>
              <CardDescription className="text-gray-600">
                Perfect for active traders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6">$9<span className="text-lg text-gray-600">/month</span></div>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {feature.toLowerCase().includes("coming soon") ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </CardFooter>
          </Card>

          {/* Annual Plan */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl">Annual</CardTitle>
              <CardDescription className="text-gray-600">
                Best value for committed traders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6">$89<span className="text-lg text-gray-600">/year</span></div>
              <div className="text-green-600 mb-4">Save 17% compared to monthly</div>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {feature.toLowerCase().includes("coming soon") ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">What's included in the free trial?</h3>
            <p className="text-gray-700">The free trial includes full access to all features for 5 days. No credit card required.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-700">Yes, you can cancel your subscription at any time. No questions asked.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-700">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">Is there a refund policy?</h3>
            <p className="text-gray-700">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 