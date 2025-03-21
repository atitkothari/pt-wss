"use client";

import { Coffee, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, signInWithGoogle, logout } = useAuth();
  
  const navigation = [
    // { name: 'Home', href: '/' },
    { name: 'Options Screener', href: '/options' },
    { name: 'Covered Call Calculator', href: '/covered-call-calculator' },
    { name: 'Blog', href: 'https://wheelstrategyoptions.com/blog/', external: true },
    { name: 'API', href: 'https://forms.gle/FRLem4M35jQV3W7Z6', external: true },
    // { name: 'Provide Feedback', href: 'mailto:theproducttank@gmail.com?subject=Feedback about Wheel Strategy Screener', external: true },
  ];

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
            {navigation.map((item) => (
              item.external ? (
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
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-gray-300"
                >
                  {item.name}
                </Link>
              )
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
          <div className="absolute top-[72px] left-0 right-0 bg-gray-900 border-b border-gray-700 p-4 md:hidden z-50">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                item.external ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-white hover:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                    id={item.name === 'API' ? 'api_btn' : undefined}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-white hover:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              {/* <Button
                id="btn_buy_coffee_mobile"
                variant="outline"
                onClick={() => window.open('https://buymeacoffee.com/wheelstrategyoptions', '_blank')}
                className="bg-white/10 text-white hover:bg-white/20 border-white/20 w-full"
              >
                <Coffee className="h-4 w-4 mr-2" />
                <span>Support This Project</span>
              </Button> */}
              
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