'use client';

import { useUserAccess } from "@/app/hooks/useUserAccess";
import { useEffect } from "react";
import { AuthModal } from "../modals/AuthModal";
import { SubscriptionBanner } from "../SubscriptionBanner";

interface FeatureAccessProps {
  children: React.ReactNode;
}

export function FeatureAccess({ children }: FeatureAccessProps) {
  const { status, loading, canAccessFeature, redirectToAppropriateScreen } = useUserAccess();

  useEffect(() => {
    // If user is not authenticated or needs subscription, handle redirection
    if (!loading && !canAccessFeature()) {
      redirectToAppropriateScreen();
    }
  }, [status, loading, canAccessFeature, redirectToAppropriateScreen]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Show login modal for unauthenticated users
  if (status === 'unauthenticated') {
    return <AuthModal isOpen={true} onClose={() => {}} initialMode="signin" />;
  }

  return (
    <div>
      <SubscriptionBanner />
      {canAccessFeature() ? children : null}
    </div>
  );
} 