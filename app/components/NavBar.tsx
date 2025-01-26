"use client";

import { Coffee, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <nav className="bg-gradient-to-b from-gray-900 to-gray-800 w-full border-b border-gray-700 p-4">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
        <a href="/" className="flex items-center">
          <img src="/logo.png" className="h-8 md:h-12 mr-2 md:mr-3" alt="Wheel Strategy Options Logo" />
          <span className="self-center text-lg md:text-2xl font-semibold whitespace-nowrap text-white hidden sm:inline">
            Wheel Strategy Options
          </span>
          <span className="self-center text-lg md:text-2xl font-semibold whitespace-nowrap text-white sm:hidden">
            Wheel Strategy Options
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-gray-300"
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <Button
            id="btn_buy_coffee"
            variant="outline"
            onClick={() => window.open('https://buymeacoffee.com/wheelstrategyoptions', '_blank')}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            <Coffee className="h-4 w-4 mr-2" />
            <span>Support This Project</span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-[72px] left-0 right-0 bg-gray-900 border-b border-gray-700 p-4 md:hidden">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button
                id="btn_buy_coffee_mobile"
                variant="outline"
                onClick={() => window.open('https://buymeacoffee.com/wheelstrategyoptions', '_blank')}
                className="bg-white/10 text-white hover:bg-white/20 border-white/20 w-full"
              >
                <Coffee className="h-4 w-4 mr-2" />
                <span>Support This Project</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 