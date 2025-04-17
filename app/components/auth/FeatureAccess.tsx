import { useUserAccess, UserAccessStatus } from "@/app/hooks/useUserAccess";
import { useEffect } from "react";
import { AuthModal } from "../modals/AuthModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { createCheckoutSession } from "@/app/lib/stripe";

interface FeatureAccessProps {
  children: React.ReactNode;
}

export function FeatureAccess({ children }: FeatureAccessProps) {
  const { status, loading } = useUserAccess();
  const { user } = useAuth();

  useEffect(() => {
    // If user is not authenticated or needs subscription, handle redirection
    if (!loading && (status === 'unauthenticated' || status === 'needs_subscription')) {
      handleAccess();
    }
  }, [status, loading]);

  const handleAccess = async () => {
    if (status === 'unauthenticated') {
      // Show login/signup modal
      return <AuthModal isOpen={true} onClose={() => {}} initialMode="signin" />;
    }

    if (status === 'needs_subscription') {
      try {
        // Redirect to Stripe checkout
        await createCheckoutSession(true);
      } catch (error) {
        console.error('Error creating checkout session:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Show appropriate UI based on user status
  const renderContent = () => {
    switch (status) {
      case 'pro':
      case 'trial':
        return children;
      
      case 'unauthenticated':
        return (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-4 text-center">
            <h2 className="text-2xl font-bold">Sign in to Access Features</h2>
            <p className="text-gray-600 max-w-md">
              Please sign in or create an account to access all features.
            </p>
            <AuthModal isOpen={true} onClose={() => {}} initialMode="signin" />
          </div>
        );
      
      case 'needs_subscription':
        return (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-4 text-center">
            <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
            <p className="text-gray-600 max-w-md">
              Your trial has ended. Upgrade to Pro to continue accessing all features.
            </p>
            <Button
              onClick={() => createCheckoutSession(true)}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Upgrade Now
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
} 