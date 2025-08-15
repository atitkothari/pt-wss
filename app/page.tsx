"use client";

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
  BellRing,
  TrendingUp,
  Shield,
  Zap,
  ChartSpline
} from "lucide-react";
import { Footer } from "./components/Footer";
import { PageLayout } from "./components/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useCheckoutConversion } from "./hooks/useCheckoutConversion";

function TestimonialsCarousel() {
  const testimonials = [1, 2, 3, 4, 5, 6];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <img 
              src={`/testimonials/${testimonials[currentIndex]}.webp`} 
              alt={`User testimonial ${testimonials[currentIndex]}`} 
              className="w-full h-auto rounded-lg max-h-[400px] object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <motion.button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      <motion.button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  // Handle checkout conversion tracking
  useCheckoutConversion();

  return (
    <PageLayout className="bg-gradient-to-br from-gray-100 via-blue-50 to-amber-50 text-gray-900 min-h-screen">            
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid lg:grid-cols-10 gap-3 lg:gap-8 items-center">
          {/* Left side - Copy */}
          <motion.div 
            className="text-left pr-0 lg:pr-8 lg:col-span-7"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 leading-normal pb-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Analyze High Premium Option Contracts 
            </motion.h1>
            <motion.p 
              className="text-lg md:text-2xl text-gray-600 mb-6 md:mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <b>Fast. Easy. Affordable.</b>
            </motion.p>
            <motion.p 
              className="text-lg md:text-2xl text-gray-600 mb-6 md:mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              Scan 570,000+ option contracts in seconds. Discover high-yield trades that maximize premium income — with powerful filters built by option sellers for option sellers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >
              <Link href="/options">
                <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Launch Screener <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.div 
              className="container mx-auto py-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            >
              <p className="text-lg text-gray-500 mb-2">
                <a 
                  href="https://wheelstrategyoptions.com/blog/selling-options-for-income-a-practical-guide-2/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Learn more
                </a> 
                {' '} about Wheel Strategy.
              </p>
            </motion.div>
          </motion.div>

          {/* Right side - Animated Stats */}
          <motion.div 
            className="mt-4 lg:mt-0 w-full lg:w-full lg:col-span-3 lg:ml-auto h-full flex items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <div className="w-full space-y-6">
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <motion.div 
                      className="text-2xl font-bold text-gray-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.2, type: "spring", stiffness: 200 }}
                    >
                      570K+
                    </motion.div>
                    <div className="text-sm text-gray-600">Option Contracts</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <motion.div 
                      className="text-2xl font-bold text-gray-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.4, type: "spring", stiffness: 200 }}
                    >
                      &lt; 1s
                    </motion.div>
                    <div className="text-sm text-gray-600">Scan Time</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <ChartSpline className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <motion.div 
                      className="text-2xl font-bold text-gray-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.6, type: "spring", stiffness: 200 }}
                    >
                      3.5k+
                    </motion.div>
                    <div className="text-sm text-gray-600">Stocks & ETFs</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Divider */}
      <motion.div 
        className="w-full px-4 py-7"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </motion.div>

            {/* Detailed Features Section */}
            <motion.div 
        className="py-16 md:py-7"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Blazing Fast Screening of Over 570,000 Option Contracts
          </motion.h2>
          <div className="space-y-20">
            <DetailedFeature
              title="Covered Call and Cash Secured Put Screener"
              description="Find the best covered call opportunities with our advanced screening tools. Filter by premium yield, strike price, expiration, earnings, and more. Screen for cash-secured put opportunities that match your risk tolerance and income targets."
              imageSrc="/Screener.webp"
              imageAlt="Covered Call and Cash Secured Put Screener"
            />
            <DetailedFeature
              title="Advanced Filters"
              description="Filter by Delta, Implied Volatility, Days to Expiration, P/E Ratio, Market Cap, and more to find the perfect trade."
              imageSrc="/AdvancedFilters.webp"
              imageAlt="Advanced Filters Interface"
              reverse
            />
            <DetailedFeature
              title="Save and Load Screener"
              description="Save your favorite screeners and load them anytime. Perfect for recurring strategies and quick access to your preferred setups."
              imageSrc="/SaveFilters.webp"
              imageAlt="Save and Load Screener Interface"
            />
            <DetailedFeature
              title="Trade Tracker"
              description="Track your option trades with detailed analytics, profit/loss calculations, and performance metrics. Monitor your wheel strategy progress and optimize your trading decisions."
              imageSrc="/trade-tracker.webp"
              imageAlt="Trade Tracker Interface"
              reverse
            />
            <DetailedFeature
              title="Watchlist"
              description="Create and manage personalized watchlists of your favorite stocks and options. Get real-time alerts and notifications when opportunities match your criteria."
              imageSrc="/watchlist.webp"
              imageAlt="Watchlist Interface"
            />
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="w-full px-4 py-7"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div 
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          What Our Users Say
        </motion.h2>
        <TestimonialsCarousel />
      </motion.div>
      


      {/* Divider */}    
      <motion.div 
        className="w-full px-4 py-7"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div 
        className="container mx-auto px-4 py-7 md:py-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2 
          className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>
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
      </motion.div>

      {/* Divider */}
      <motion.div 
        className="w-full px-4 py-7"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="bg-transparent py-12 md:py-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Ready to Maximize Your Income?
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Join successful options traders who use our platform to find and execute high-yield trades.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/options">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Launch Screener <Search className="ml-2 h-4 md:h-5 w-4 md:w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
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
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <motion.div 
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function DetailedFeature({ 
  title, 
  description, 
  imageSrc, 
  imageAlt,
  reverse = false 
}: { 
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <motion.div 
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center px-4 md:px-8 lg:px-12`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <motion.div 
        className="lg:w-1/2"
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <Link href="/options" className="group block">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-blue-600 group-hover:text-blue-700 transition-colors duration-300">{title}</h3>
            <p className="text-lg text-500 leading-relaxed group-hover:text-blue-600 transition-colors duration-300">{description}</p>
          </div>
        </Link>
      </motion.div>
      <motion.div 
        className="lg:w-1/2"
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
      >
        <Link href="/options" className="group block">
          <img 
            src={imageSrc} 
            alt={imageAlt}
            className="w-full h-auto max-h-[300px] object-contain rounded-lg transition-all duration-300 group-hover:opacity-90"
          />
        </Link>
      </motion.div>
    </motion.div>
  );
}