import { useAuth } from "@/app/context/AuthContext";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { useRouter } from "next/navigation";

export type UserAccessStatus = 
  | 'unauthenticated'
  | 'pro'
  | 'trial'
  | 'needs_subscription'
  | 'loading';

export function useUserAccess() {
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, isTrialActive, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();

  const loading = authLoading || subscriptionLoading;

  const getUserStatus = (): UserAccessStatus => {
    if (loading) return 'loading';
    if (!user) return 'unauthenticated';    
    if (isSubscribed) return 'pro';
    if (isTrialActive) return 'trial';
    return 'needs_subscription';
  };

  const canAccessFeature = () => {
    const status = getUserStatus();
    return status === 'pro' || status === 'trial';
  };

  const redirectToAppropriateScreen = () => {
    const status = getUserStatus();
    
    switch (status) {
      case 'unauthenticated':
        router.push('/auth/signin');
        break;
      case 'needs_subscription':
        router.push('/pricing');
        break;
      default:
        break;
    }
  };

  return {
    status: getUserStatus(),
    canAccessFeature,
    redirectToAppropriateScreen,
    loading
  };
} 