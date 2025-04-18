'use client';

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { createCustomerPortalSession } from "@/app/lib/stripe";

export function StripeRedirectPage() {
  useEffect(() => {
    const redirectToPortal = async () => {
      try {
        await createCustomerPortalSession();
      } catch (error) {
        console.error('Error opening Stripe portal:', error);
        alert(error instanceof Error ? error.message : 'Failed to open subscription management. Please try again later.');
      }
    };

    redirectToPortal();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto" />
        <h1 className="text-2xl font-semibold">Redirecting to Subscription Management</h1>
        <p className="text-gray-400">Please wait while we prepare your subscription management portal...</p>
      </div>
    </div>
  );
} 