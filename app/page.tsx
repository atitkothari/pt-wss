import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Search, 
  BarChart2, 
  DollarSign, 
  Clock, 
  Target, 
  Filter, 
  LineChart,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Options Screening Made Simple
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Find and analyze options trades that match your strategy. Screen for covered calls and cash-secured puts in seconds.
          </p>
          <Link href="/options">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
              Start Screening <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need for Options Trading
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart2 className="h-8 w-8 text-blue-400" />}
              title="Covered Call Screener"
              description="Find the best covered call opportunities with our advanced screening tools. Filter by yield, strike price, and expiration."
            />
            <FeatureCard
              icon={<DollarSign className="h-8 w-8 text-blue-400" />}
              title="Cash-Secured Put Screener"
              description="Screen for cash-secured put opportunities that match your risk tolerance and profit targets."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8 text-blue-400" />}
              title="Real-Time Data"
              description="Make informed decisions with real-time options data and pricing information."
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <StepCard
            icon={<Target className="h-6 w-6 text-white" />}
            number="1"
            title="Choose Your Strategy"
            description="Select between covered calls or cash-secured puts based on your trading strategy."
          />
          <StepCard
            icon={<Filter className="h-6 w-6 text-white" />}
            number="2"
            title="Set Your Filters"
            description="Filter by yield, strike price, expiration date, and more to find trades that match your criteria."
          />
          <StepCard
            icon={<LineChart className="h-6 w-6 text-white" />}
            number="3"
            title="Analyze & Trade"
            description="Review the filtered results and select the best opportunities for your portfolio."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Trading Smarter?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of options traders who use our platform to find and analyze trading opportunities.
          </p>
          <Link href="/options">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
              Get Started Now <Search className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-700 rounded-lg p-6">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function StepCard({ icon, number, title, description }: { 
  icon: React.ReactNode;
  number: string; 
  title: string; 
  description: string 
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}