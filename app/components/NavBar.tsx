"use client";

import { Coffee, Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScreenersOpen, setIsScreenersOpen] = useState(false);
  const { user, loading, signInWithGoogle, logout } = useAuth();
  
  const navigation = {
    screeners: [
      { name: 'Covered Call Screener', href: '/covered-call-screener', id: 'covered_call_screener' },
      { name: 'Cash Secured Put Screener', href: '/cash-secured-put-screener', id: 'cash_secured_put_screener' },
    ],
    tools: [
      { name: 'Discover', href: '/discover' },
      { name: 'Covered Call Calculator', href: '/covered-call-calculator' },
    ],
    resources: [
      { name: 'Blog', href: 'https://wheelstrategyoptions.com/blog/', external: true },
      { name: 'API', href: 'https://forms.gle/FRLem4M35jQV3W7Z6', external: true },
    ],
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-b from-gray-900 to-gray-800 w-full border-b border-gray-700 p-4 z-40 relative">
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
            {/* Screeners Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsScreenersOpen(!isScreenersOpen)}
                className="text-white hover:text-gray-300 flex items-center"
              >
                Screeners
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isScreenersOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg py-1">
                  {navigation.screeners.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                      onClick={() => setIsScreenersOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Tools */}
            {navigation.tools.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-gray-300"
              >
                {item.name}
              </Link>
            ))}

            {/* Resources */}
            {navigation.resources.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-gray-300"
                id={item.name === 'API' ? 'api_btn' : undefined}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
              >
                {item.name}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4">            
            {loading ? null : user ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={signInWithGoogle}
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              >
                Sign In
              </Button>
            )}
          </div>
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
          <div className="absolute top-[64px] left-0 right-0 bg-gray-900 border-b border-gray-700 p-4 md:hidden z-50">
            <div className="flex flex-col space-y-4">
              {/* Screeners Section */}
              <div className="border-b border-gray-700 pb-4">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Screeners</h3>
                {navigation.screeners.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-white hover:text-gray-300 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Tools Section */}
              <div className="border-b border-gray-700 pb-4">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Tools</h3>
                {navigation.tools.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-white hover:text-gray-300 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Resources Section */}
              <div className="pb-4">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Resources</h3>
                {navigation.resources.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-white hover:text-gray-300 py-2"
                    onClick={() => setIsMenuOpen(false)}
                    id={item.name === 'API' ? 'api_btn' : undefined}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              
              {loading ? null : user ? (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20 w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </Button>
              ) : (
                <Button
                  onClick={signInWithGoogle}
                  variant="outline"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20 w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}