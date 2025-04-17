'use client';

import { ReactNode } from "react";
import { NavBar } from "./NavBar";
import { SubscriptionBanner } from "./SubscriptionBanner";
import { useAuth } from "@/app/context/AuthContext";

interface PageLayoutProps {
  children: ReactNode;
  showBanner?: boolean;
  className?: string;
}

export function PageLayout({ children, showBanner = true, className = "" }: PageLayoutProps) {
  const { user } = useAuth();

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <NavBar />
      {showBanner && user && <SubscriptionBanner />}
      <div className="max-w-screen-2xl mx-auto p-4">
        {children}
      </div>
    </div>
  );
} 