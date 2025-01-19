"use client";

import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavBar() {
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

        <Button
          id="btn_buy_coffee"
          variant="outline"
          onClick={() => window.open('https://buymeacoffee.com/wheelstrategyoptions', '_blank')}
          className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs md:text-sm px-2 md:px-4 h-8 md:h-10"
        >
          <Coffee className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Support This Project</span>
          <span className="sm:hidden">Support</span>
        </Button>
      </div>
    </nav>
  );
} 