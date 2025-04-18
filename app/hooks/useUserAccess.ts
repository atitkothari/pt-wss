import { useAuth } from "@/app/context/AuthContext";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { useRouter } from "next/navigation";

export type UserAccessStatus = 
  | 'unauthenticated'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused'
  | 'needs_subscription'
  | 'loading';

export function useUserAccess() {
  const { user, loading: authLoading } = useAuth();
  const {     
    loading: subscriptionLoading, 
    subscriptionStatus,    
  } = useSubscription();
  const router = useRouter();

  const loading = authLoading || subscriptionLoading;

  const getUserStatus = (): UserAccessStatus => {
    if (loading) return 'loading';
    if (!user) return 'unauthenticated';
    console.log("subs",subscriptionStatus)
    // If there's no subscription status, user needs to subscribe
    if (!subscriptionStatus) return 'needs_subscription';

    // Map subscription status to user access status
    switch (subscriptionStatus) {
      case 'active':
        return 'active';
      case 'trialing':
        return 'trialing';
      case 'past_due':
      case 'canceled':
      case 'incomplete':
      case 'incomplete_expired':
      case 'unpaid':
      case 'paused':
        return 'paused';
      //   return 'past_due';
      // case 'canceled':
      //   return 'canceled';
      // case 'incomplete':
      //   return 'incomplete';
      // case 'incomplete_expired':
      //   return 'incomplete_expired';
      // case 'unpaid':
      //   return 'unpaid';
      // case 'paused':
      //   return 'paused';
      default:
        return 'needs_subscription';
    }
  };

  const canAccessFeature = () => {
    const status = getUserStatus();
    // Only active and trial subscriptions can access features
    return status === 'active' || status === 'trialing';
  };

  const shouldShowPaymentWarning = () => {
    const status = getUserStatus();
    // Show warning for past_due and incomplete statuses
    return status === 'past_due' || status === 'incomplete';
  };

  const getStatusMessage = (): string => {
    const status = getUserStatus();
    switch (status) {
      case 'active':
        return 'You have full access to all features';
      case 'trialing':
        return 'You are currently in your trial period';
      case 'past_due':
        return 'Your payment is past due. Please update your payment method';
      case 'canceled':
        return 'Your subscription has been canceled';
      case 'incomplete':
        return 'Your payment is incomplete. Please complete the payment process';
      case 'incomplete_expired':
        return 'Your trial has ended. Please subscribe to continue accessing features';
      case 'unpaid':
        return 'Your subscription is unpaid. Please update your payment method';
      case 'paused':
        return 'Your subscription is paused';
      case 'needs_subscription':
        return 'Please subscribe to access features';
      case 'unauthenticated':
        return 'Please sign in to access features';
      case 'loading':
        return 'Loading...';
      default:
        return 'Unknown status';
    }
  };

  const redirectToAppropriateScreen = () => {
    const status = getUserStatus();
    
    switch (status) {
      case 'unauthenticated':
        router.push('/auth/signin');
        break;
      case 'needs_subscription':
      case 'canceled':
      case 'incomplete_expired':
        router.push('/pricing');
        break;
      case 'past_due':
      case 'incomplete':
      case 'unpaid':
        router.push('/billing');
        break;
      default:
        break;
    }
  };

  return {
    status: getUserStatus(),
    canAccessFeature,
    redirectToAppropriateScreen,
    shouldShowPaymentWarning,
    getStatusMessage,
    loading    
  };
} 