'use client';

import { useUserAccess } from "@/app/hooks/useUserAccess";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "../modals/AuthModal";
import { Button } from "@/components/ui/button";

export function withFeatureAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiresAuth: boolean = true,
  requiresPro: boolean = true
) {
  return function WithFeatureAccessWrapper(props: P) {
    const { status, loading, redirectToAppropriateScreen } = useUserAccess();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (requiresAuth && status === 'unauthenticated') {
          router.push('/auth/signin');
          return;
        }

        if (requiresPro && status === 'needs_subscription') {
          router.push('/pricing');
          return;
        }
      }
    }, [status, loading, router]);

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      );
    }

    // Handle unauthorized access
    if (requiresAuth && status === 'unauthenticated') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <h1 className="text-2xl font-bold">Please sign in to continue</h1>
          <AuthModal isOpen={true} onClose={() => {}} initialMode="signin" />
        </div>
      );
    }

    // Handle non-pro access to pro features
    if (requiresPro && status === 'needs_subscription') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <h1 className="text-2xl font-bold">Upgrade to Pro</h1>
          <p className="text-gray-600 max-w-md text-center">
            This feature requires a Pro subscription. Please upgrade to continue.
          </p>
          <Button
            onClick={() => router.push('/pricing')}
            className="bg-primary text-white hover:bg-primary/90"
          >
            View Pricing
          </Button>
        </div>
      );
    }

    // If all checks pass, render the wrapped component
    return <WrappedComponent {...props} />;
  };
} 