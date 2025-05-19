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
  ArrowRight,
  Save,
  BellRing
} from "lucide-react";
import { Footer } from "./components/Footer";
import { PageLayout } from "./components/PageLayout";

export default function LandingPage() {
  return (
    <PageLayout className="bg-gradient-to-br from-gray-100 via-blue-50 to-amber-50 text-gray-900 min-h-screen">            
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid lg:grid-cols-10 gap-3 lg:gap-8 items-center">
          {/* Left side - Copy */}
          <div className="text-left pr-0 lg:pr-8 lg:col-span-7">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 leading-normal pb-1">
              Analyze High Premium Option Contracts 
            </h1>
            <p className="text-lg md:text-2xl text-gray-600 mb-6 md:mb-8 leading-relaxed"><b>Fast. Easy. Affordable.</b></p>
            <p className="text-lg md:text-2xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
              Scan 570,000+ option contracts in seconds. Discover high-yield trades that maximize premium income — with powerful filters built by option sellers for option sellers.
            </p>
            <Link href="/options">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Launch Screener <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
              </Button>
            </Link>
            <div className="container mx-auto py-2">
            <p className="text-lg text-gray-500 mb-2">
            <a 
            href="https://wheelstrategyoptions.com/blog/selling-options-for-income-a-practical-guide-2/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >Learn more</a> 
           {' '} about Wheel Strategy.

        </p>
        </div>
                  {/* Learn More About Wheel Strategy Section */}
    
          </div>

          {/* Right side - Video */}
          <div className="mt-4 lg:mt-0 w-full lg:w-full lg:col-span-3 lg:ml-auto h-full flex items-center">
            <video 
              poster="video-poster.png"
              className="w-full max-h-[50vh] lg:max-h-none rounded-xl shadow-[0_8px_30px_rgb(0,0,0,.5)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-shadow duration-300 object-contain"              
              muted
              autoPlay           
            >
              <source src="/demoVideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-transparent py-8 md:py-12 mt-4 md:mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-8 text-gray-800">
            Blazing Fast Screening of Over 570,000 Option Contracts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<BarChart2 className="h-6 md:h-8 w-6 md:w-8 text-blue-500" />}
              title="Covered Call Screener"
              description="Find the best covered call opportunities with our advanced screening tools. Filter by premium yield, strike price, expiration, earnings, and more."
            />
            <FeatureCard
              icon={<DollarSign className="h-6 md:h-8 w-6 md:w-8 text-blue-500" />}
              title="Cash-Secured Put Screener"
              description="Screen for cash-secured put opportunities that match your risk tolerance and income targets."
              href="/cash-secured-put-screener"
            />
            <FeatureCard
              icon={<Filter className="h-6 md:h-8 w-6 md:w-8 text-blue-500" />}
              title="Advanced Filters"
              description="Filter by Delta, Implied Volatility, Days to Expiration, P/E Ratio, Market Cap, and more to find the perfect trade."
            />
            <FeatureCard
              icon={<Save className="h-6 md:h-8 w-6 md:w-8 text-blue-500" />}
              title="Save & Load Screeners"
              description="Save your favorite screeners and load them anytime. Perfect for recurring strategies and quick access to your preferred setups."
            />
            <FeatureCard
              icon={<BellRing className="h-6 md:h-8 w-6 md:w-8 text-blue-500" />}
              title="Email Notifications"
              description="Get notified when your saved screeners find new opportunities matching your criteria."
            />
            <FeatureCard
              icon={<LineChart className="h-6 md:h-8 w-6 md:w-8 text-blue-500" />}
              title="Fundamental Analysis"
              description="Screen by P/E Ratio, Market Cap, and sector to find fundamentally sound companies for your options strategy."
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <StepCard
            icon={<Target className="h-5 md:h-6 w-5 md:w-6 text-white" />}
            number="1"
            title="Choose Your Strategy"
            description="Select between covered calls or cash-secured puts based on where you are in the wheel cycle."
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
      <div className="bg-transparent py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-800">
            Ready to Maximize Your Income?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join successful options traders who use our platform to find and execute high-yield trades.
          </p>
          <Link href="/options">
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              Launch Screener <Search className="ml-2 h-4 md:h-5 w-4 md:w-5" />
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </PageLayout>
  );
}

function FeatureCard({ icon, title, description, href = "/options" }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  href?: string;
}) {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:scale-[1.02] cursor-pointer">
        <div className="mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </Link>
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
      <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}