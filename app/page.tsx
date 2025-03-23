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
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">      
      <NavBar />
      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center pt-4 md:pt-8">
        <img src="/logo.png" className="h-20 md:h-24 mb-3 md:mb-4" alt="Wheel Strategy Options Logo" />
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-6">
          Wheel Strategy Options
        </h2>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-2 md:py-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
            Smart Options, Smarter Returns: Screen, Select, Succeed
          </h1>
          <p className="text-base md:text-xl text-gray-600 mb-4 md:mb-6 max-w-3xl mx-auto">
            Dominate the options game. Our options screener delivers high-yield options trades maximizing premium income with intelligent filters. Select your perfect strategy; succeed in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/options">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                Options Screener <Search className="ml-2 h-4 md:h-5 w-4 md:w-5" />
              </Button>
            </Link>
            <Link href="/covered-call-calculator">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                Covered Call Calculator <BarChart2 className="ml-2 h-4 md:h-5 w-4 md:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-4 md:py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-8">
            Quick Screening for Covered Calls and Cash-Secured Puts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <FeatureCard
              icon={<BarChart2 className="h-6 md:h-8 w-6 md:w-8 text-blue-400" />}
              title="Covered Call Screener"
              description="Find the best covered call opportunities with our advanced screening tools. Filter by yield, strike price, and expiration."
            />
            <FeatureCard
              icon={<DollarSign className="h-6 md:h-8 w-6 md:w-8 text-blue-400" />}
              title="Cash-Secured Put Screener"
              description="Screen for cash-secured put opportunities that match your risk tolerance and profit targets."
            />
            
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <StepCard
            icon={<Target className="h-5 md:h-6 w-5 md:w-6 text-white" />}
            number="1"
            title="Choose Your Strategy"
            description="Select between covered calls or cash-secured puts based on your trading strategy."
          />
          <StepCard
            icon={<Filter className="h-5 md:h-6 w-5 md:w-6 text-white" />}
            number="2"
            title="Set Your Filters"
            description="Filter by yield, strike price, expiration date, and more to find trades that match your criteria."
          />
          <StepCard
            icon={<LineChart className="h-5 md:h-6 w-5 md:w-6 text-white" />}
            number="3"
            title="Analyze & Trade"
            description="Review the filtered results and select the best opportunities for your portfolio."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-4 md:py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-3 md:mb-4">
            <h2 className="text-2xl md:text-4xl font-bold">
              Ready to Maximize Your Returns?
            </h2>
            {/* Icons removed as requested */}
          </div>
          <p className="text-base md:text-xl text-gray-600 mb-4 md:mb-6 max-w-2xl mx-auto">
            Join successful options traders who use our platform to find and execute high-yield trades.
          </p>
          <div className="flex justify-center">
            <Link href="/options">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                Wheel Your Way to Higher Returns <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-100 rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
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
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}