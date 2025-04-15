"use client";

import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { sendAnalyticsEvent, AnalyticsEvents } from '../utils/analytics';
import { AuthModal } from './modals/AuthModal';

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScreenersOpen, setIsScreenersOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  
  const navigation = {
    screeners: [
      { name: 'Covered Call Screener', href: '/covered-call-screener', id: 'covered_call_screener' },
      { name: 'Cash Secured Put Screener', href: '/cash-secured-put-screener', id: 'cash_secured_put_screener' },
      { name: 'Saved Screeners', href: '/saved-screeners', id: 'saved_screeners' },
    ],
    tools: [
      { name: 'Discover', href: '/discover' },
      { name: 'Covered Call Calculator', href: '/covered-call-calculator' },
    ],
    resources: [
      { name: 'Blog', href: 'https://wheelstrategyoptions.com/blog/', external: true },
    ],
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const handleNavigation = (name: string, href: string, external: boolean = false) => {
    sendAnalyticsEvent({
      event_name: AnalyticsEvents.PAGE_VIEW,
      event_category: 'Navigation',
      event_label: name,
      page_path: href,
      is_external: external
    });
  };

  return (
    <nav className="bg-gradient-to-b from-gray-900 to-gray-800 w-full border-b border-gray-700 p-4 z-40 relative">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <img src="/logo.png" className="h-8 md:h-12 mr-2 md:mr-3" alt="Wheel Strategy Options Logo" />
          <span className="self-center text-lg md:text-2xl font-semibold whitespace-nowrap text-white hidden sm:inline">
            Wheel Strategy Options
          </span>
          <span className="self-center text-lg md:text-2xl font-semibold whitespace-nowrap text-white sm:hidden">
            Wheel Strategy Options
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-8">
            {/* Screeners Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setIsScreenersOpen(!isScreenersOpen)}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                Screeners
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isScreenersOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ease-in-out">
                  <div className="py-1">
                    {navigation.screeners.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setIsScreenersOpen(false);
                          handleNavigation(item.name, item.href);
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tools */}
            {navigation.tools.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => handleNavigation(item.name, item.href)}
              >
                {item.name}
              </Link>
            ))}

            {/* Resources */}
            {navigation.resources.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => handleNavigation(item.name, item.href, true)}
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
                className="bg-white/10 text-white hover:bg-white/20 border-white/20 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20 border-white/20 transition-colors"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white hover:text-gray-300 transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-[64px] left-0 right-0 bg-gray-900 border-b border-gray-700 p-4 md:hidden z-50 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-4">
            {/* Screeners Section */}
            <div className="border-b border-gray-700 pb-4">
              <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Screeners</h3>
              {navigation.screeners.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block text-gray-300 hover:text-white py-2 transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation(item.name, item.href);
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Tools Section */}
            <div className="border-b border-gray-700 pb-4">
              <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Tools</h3>
              {navigation.tools.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-300 hover:text-white py-2 transition-colors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation(item.name, item.href);
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Resources Section */}
            <div className="pb-4">
              <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Resources</h3>
              {navigation.resources.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-gray-300 hover:text-white py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name}
                </a>
              ))}
            </div>
            
            {loading ? null : user ? (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-white/10 text-white hover:bg-white/20 border-white/20 w-full transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log out</span>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20 border-white/20 w-full transition-colors"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
}