"use client";

import { Menu, X, LogOut, ChevronDown, CreditCard, User, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { sendAnalyticsEvent, AnalyticsEvents } from '../utils/analytics';
import { AuthModal } from './modals/AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createCustomerPortalSession } from "@/app/lib/stripe";
import { useRouter } from "next/navigation";

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScreenersOpen, setIsScreenersOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const navigation = {
    screeners: [
      { name: 'Covered Call Screener', href: '/covered-call-screener', id: 'covered_call_screener' },
      { name: 'Cash Secured Put Screener', href: '/cash-secured-put-screener', id: 'cash_secured_put_screener' },
      { name: 'Saved Screeners', href: '/saved-screeners', id: 'saved_screeners' },
    ],
    tools: [
      { name: 'Discover', href: '/discover' },
      { name: 'Covered Call Calculator', href: '/covered-call-calculator' },
      { name: 'Pricing', href: '/pricing'},
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

  const handleManageSubscription = () => {
    router.push('/manage-subscription');
  };

  return (
    <nav className="bg-gradient-to-br from-gray-50 via-white to-blue-50 w-full border-b border-gray-200 p-4 z-40 relative">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <img src="/logo.png" className="h-8 md:h-12 mr-2 md:mr-3" alt="Wheel Strategy Options Logo" />
          <span className="self-center text-lg md:text-2xl font-semibold whitespace-nowrap text-gray-800 hidden sm:inline">
            Wheel Strategy Options
          </span>
          <span className="self-center text-lg md:text-2xl font-semibold whitespace-nowrap text-gray-800 sm:hidden">
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
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
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
                className="text-gray-600 hover:text-gray-900 transition-colors"
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
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => handleNavigation(item.name, item.href, true)}
              >
                {item.name}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4">            
            {loading ? null : user ? (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-white/50 text-gray-800 hover:bg-white/80 border-gray-200 transition-colors flex items-center gap-2">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || user.email || 'User'} 
                          className="h-6 w-6 rounded-full" 
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="max-w-[100px] truncate">
                        {user.displayName || user.email || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleManageSubscription} className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Manage Subscription</span>
                      {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                variant="outline"
                className="bg-white/50 text-gray-800 hover:bg-white/80 border-gray-200 transition-colors"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-800 hover:text-gray-600 transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-[64px] left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 md:hidden z-50 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-4">
            {/* Screeners Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-gray-600 text-sm font-medium mb-2 uppercase tracking-wider">Screeners</h3>
              {navigation.screeners.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block text-gray-600 hover:text-gray-900 py-2 transition-colors"
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
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-gray-600 text-sm font-medium mb-2 uppercase tracking-wider">Tools</h3>
              {navigation.tools.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-600 hover:text-gray-900 py-2 transition-colors"
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
              <h3 className="text-gray-600 text-sm font-medium mb-2 uppercase tracking-wider">Resources</h3>
              {navigation.resources.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-gray-600 hover:text-gray-900 py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name}
                </a>
              ))}
            </div>
            
            {loading ? null : user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-2">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || user.email || 'User'} 
                      className="h-8 w-8 rounded-full" 
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-800" />
                  )}
                  <div className="text-gray-800 font-medium truncate">
                    {user.displayName || user.email || 'User'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  className="bg-white/50 text-gray-800 hover:bg-white/80 border-gray-200 w-full transition-colors flex items-center"
                  disabled={isLoading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>Manage Subscription</span>
                  {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="bg-white/50 text-gray-800 hover:bg-white/80 border-gray-200 w-full transition-colors flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                variant="outline"
                className="bg-white/50 text-gray-800 hover:bg-white/80 border-gray-200 w-full transition-colors"
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