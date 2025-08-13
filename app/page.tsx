"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Footer } from "./components/Footer";
import { PageLayout } from "./components/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

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
    <div className="relative max-w-4xl">
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
      <div className="flex justify-start mt-6 space-x-2">
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
  return (
    <PageLayout className="bg-white text-gray-900 min-h-screen">            
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-4 items-center">
          {/* Left side - Copy */}
          <motion.div 
            className="text-left lg:text-left pr-0 lg:pr-8 lg:col-span-7 order-1 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-900 leading-tight md:leading-normal pb-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Master the Wheel Strategy. Pinpoint High-Yield Covered Calls & CSPs, Effortlessly.
            </motion.h1>
          </motion.div>

          {/* Right side - Hero Image */}
          <motion.div 
            className="mt-0 lg:mt-0 w-full lg:w-full lg:col-span-4 lg:ml-auto h-full flex items-center order-2 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <div className="w-full">                              
                  <img 
                    src="/v3_hero.jpeg" 
                    alt="Wheel Strategy Options Hero" 
                    className="w-full h-auto rounded-lg object-cover"
                  />                
            </div>
          </motion.div>
        </div>
      </div>

      {/* First Benefit Section */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-left max-w-4xl">
          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800 text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Secure Consistent Monthly Premiums Income with Unrivaled Speed and Precision.
          </motion.h2>
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/options">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-7 md:py-8 lg:py-9 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto flex flex-col">
                <div className="text-left font-bold leading-tight">Experience Instant Screening!</div>
                <div className="text-left text-xs sm:text-sm leading-tight">(No Credit Card Needed to Try)</div>
              </Button>
            </Link>
          </motion.div>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-600 mt-4 md:mt-6 leading-relaxed text-left lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            The AI-powered screener scans over 570,000 option contracts in less than a second, delivering high-yield trades tailored by option sellers, for option sellers. Invest in Your Profits, Risk-Free!
          </motion.p>
        </div>
      </motion.div>

      {/* Precision Tools Section */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-left mb-8 md:mb-12 px-2">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Precision Tools for Predictable Profits.
          </motion.h2>
          <motion.h3 
            className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-yellow-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Generate Predictable Income.
          </motion.h3>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            Pinpoint the Most Profitable Covered Calls & CSPs with Confidence.
          </motion.p>
        </div>
        <div className="max-w-4xl px-2">
          <img 
            src="/v3_predictable_income.jpeg" 
            alt="Precision Tools for Predictable Profits" 
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>
      </motion.div>

      {/* Find Trades Section */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-left mb-8 md:mb-12 px-2">
          <motion.h2 
            className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-yellow-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Find Trades that Match Your Setup.
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Hyper-Target Trades with Precision Filters (Delta, IV, P/E & many many more).
          </motion.p>
        </div>
        <div className="max-w-4xl px-2">
        <img 
            src="/v3_find_trades.jpeg" 
            alt="Find Trades that Match Your Setup" 
            className="w-full h-auto rounded-lg object-cover"
          />
   
        </div>
      </motion.div>

            {/* Save Setup Section */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-left mb-8 md:mb-12 px-2">
          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 text-yellow-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Never Lose Your Winning Setup.
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Lock in your most profitable screeners. And even get fresh results delivered straight to your inbox.
          </motion.p>
        </div>
        <div className="max-w-md px-2">
          <img 
            src="/v3_never_lose.jpeg" 
            alt="Never Lose Your Winning Setup" 
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>
      </motion.div>

      {/* Track Trades Section */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-left mb-8 md:mb-12 px-2">
          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 text-yellow-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Track Every Trade.
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Analyze Performance, Optimize for Profit & Maximize Your Wheel Cycle.
          </motion.p>
        </div>
        <div className="max-w-md px-2">
          <img 
            src="/v3_track_every.jpeg" 
            alt="Track Every Trade" 
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>
      </motion.div>

      {/* Second CTA Section */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-left px-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link href="/options">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-7 md:py-8 lg:py-9 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto whitespace-normal">
                <div className="text-left font-bold leading-tight">Try ALL Wheel Strategy Options Features FREE for 5 Days!</div>
              </Button>
            </Link>
          </motion.div>
          <motion.p 
            className="text-base sm:text-lg text-gray-600 mt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            No Credit Card Required. Just Pure Options Power.
          </motion.p>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-left mb-8 md:mb-12 text-gray-800 px-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Why Wheel Strategy Traders Trust Us.
        </motion.h2>
        <TestimonialsCarousel />
      </motion.div>

      {/* About Section */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-left max-w-4xl">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Why We Built This.
          </motion.h2>
          <motion.h3 
            className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Built by Traders, For Traders.
          </motion.h3>
          <motion.p 
            className="text-base sm:text-lg text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            We're options enthusiasts who grew frustrated with ridiculously priced, clunky, slow screeners. So, we built the tool we wished we had – a powerful, intuitive platform designed to maximize your premium income.
          </motion.p>
          <motion.p 
            className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            Our goal is to save you time from sifting through hundreds of thousands of contracts manually. Wheel Strategy Options automates hours of tedious research, so you can focus on what matters: identifying profitable setups and executing trades.
          </motion.p>
        </div>
      </motion.div>

      {/* Final CTA Section */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-left px-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/options">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 md:py-6 lg:py-7 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-bold w-full sm:w-auto whitespace-normal">
                <div className="text-left font-bold leading-tight">Reclaim Your Time. Reclaim Your Profits.<br />Try NOW!</div>
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