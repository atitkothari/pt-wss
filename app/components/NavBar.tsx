"use client";

import { Menu, X, LogOut, ChevronDown, CreditCard, User, Settings, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useSubscription } from "@/app/context/SubscriptionContext";
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
  const { subscriptionStatus } = useSubscription();
  const router = useRouter();
  
  const navigation = {
    screeners: [
      { name: 'Covered Call Screener', href: '/covered-call-screener', id: 'covered_call_screener' },
      { name: 'Cash Secured Put Screener', href: '/cash-secured-put-screener', id: 'cash_secured_put_screener' },
    ],
    resources: [
      { name: 'Discover', href: '/discover' },
      { name: 'Covered Call Calculator', href: '/covered-call-calculator' },
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
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center gap-4">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity shrink-0">
          <img src="/logo.png" className="h-8 md:h-10 mr-2 md:mr-3" alt="Wheel Strategy Options Logo" />
          <span className="self-center text-base md:text-xl font-semibold whitespace-nowrap text-gray-900 hidden sm:inline">
            Wheel Strategy Options
          </span>
          <span className="self-center text-base md:text-xl font-semibold whitespace-nowrap text-gray-900 sm:hidden">
            Wheel Strategy Options
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-end flex-1 gap-6">
          <div className="flex items-center gap-6">
            {/* Individual Screener Links */}
            {navigation.screeners.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                onClick={() => handleNavigation(item.name, item.href)}
              >
                {item.name}
              </Link>
            ))}

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsScreenersOpen(!isScreenersOpen)}
                className="flex items-center text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
              >
                Resources
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isScreenersOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ease-in-out">
                  <div className="py-1">
                    {navigation.resources.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors font-medium"
                        onClick={() => {
                          setIsScreenersOpen(false);
                          handleNavigation(item.name, item.href, item.external);
                        }}
                        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/pricing"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
              onClick={() => handleNavigation('Pricing', '/pricing')}
            >
              Pricing
            </Link>
          </div>
          
          <div className="flex items-center">            
            {loading ? null : user ? (
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-white/80 text-gray-900 hover:bg-white border-gray-200 transition-colors flex items-center gap-2 font-medium">
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
                    <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/saved-screeners')} className="cursor-pointer text-gray-700 hover:text-gray-900">
                      <Save className="mr-2 h-4 w-4" />
                      <span>Saved Screeners</span>
                    </DropdownMenuItem>
                    {subscriptionStatus && (
                      <DropdownMenuItem onClick={handleManageSubscription} className="cursor-pointer text-gray-700 hover:text-gray-900">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Manage Subscription</span>
                        {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-gray-700 hover:text-gray-900">
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
                className="bg-white/80 text-gray-900 hover:bg-white border-gray-200 transition-colors whitespace-nowrap font-medium"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-gray-900 hover:text-gray-700 transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-[64px] left-0 right-0 bg-white shadow-lg border border-gray-200 p-4 lg:hidden z-50 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-4">
            {/* Screeners Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-gray-900 text-sm font-semibold mb-2 uppercase tracking-wider">Screeners</h3>
              {navigation.screeners.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block text-gray-700 hover:text-gray-900 py-2 transition-colors font-medium"
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
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-gray-900 text-sm font-semibold mb-2 uppercase tracking-wider">Resources</h3>
              {navigation.resources.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 hover:text-gray-900 py-2 transition-colors font-medium"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation(item.name, item.href, item.external);
                  }}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Pricing */}
            <div className="pb-4 border-b border-gray-200">
              <Link
                href="/pricing"
                className="block text-gray-700 hover:text-gray-900 py-2 transition-colors font-medium"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleNavigation('Pricing', '/pricing');
                }}
              >
                Pricing
              </Link>

              {/* Saved Screeners - Only show if user is logged in */}
              {user && (
                <Link
                  href="/saved-screeners"
                  className="block text-gray-700 hover:text-gray-900 py-2 transition-colors font-medium"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavigation('Saved Screeners', '/saved-screeners');
                  }}
                >
                  Saved Screeners
                </Link>
              )}
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
                
                {subscriptionStatus && (
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
                )}
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