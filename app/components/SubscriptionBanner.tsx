'use client';

import { useUserAccess } from "@/app/hooks/useUserAccess";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export function SubscriptionBanner() {
  const { status, getStatusMessage, shouldShowPaymentWarning, currentPeriodEnd } = useUserAccess();
  const { daysLeftInTrial } = useSubscription();
  const router = useRouter();

  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  const getAlertVariant = () => {
    if (shouldShowPaymentWarning()) return "destructive";
    if (status === 'pro') return "default";
    if (status === 'trial') return "default";
    return "destructive";
  };

  const getIcon = () => {
    if (shouldShowPaymentWarning()) return AlertCircle;
    if (status === 'pro') return CheckCircle2;
    if (status === 'trial') return Clock;
    return AlertCircle;
  };

  const Icon = getIcon();

  const handleAction = () => {
    switch (status) {
      case 'past_due':
      case 'incomplete':
      case 'unpaid':
        router.push('/billing');
        break;
      case 'canceled':
      case 'incomplete_expired':
      case 'needs_subscription':
        router.push('/pricing');
        break;
      default:
        break;
    }
  };

  const getActionButtonText = () => {
    switch (status) {
      case 'past_due':
      case 'incomplete':
      case 'unpaid':
        return 'Update Payment';
      case 'canceled':
      case 'incomplete_expired':
      case 'needs_subscription':
        return 'View Plans';
      default:
        return null;
    }
  };

  const actionButtonText = getActionButtonText();

  return (
    <Alert variant={getAlertVariant()} className="mb-4">
      <Icon className="h-4 w-4" />
      <AlertTitle className="ml-2">Subscription Status</AlertTitle>
      <AlertDescription className="ml-2 flex items-center justify-between">
        <span>
          {getStatusMessage()}
          {currentPeriodEnd && status === 'pro' && (
            <span className="ml-2 text-sm text-muted-foreground">
              (Next billing date: {currentPeriodEnd.toLocaleDateString()})
            </span>
          )}
          {status === 'trial' && daysLeftInTrial > 0 && (
            <span className="ml-2 text-sm font-medium">
              ({daysLeftInTrial} {daysLeftInTrial === 1 ? 'day' : 'days'} remaining)
            </span>
          )}
        </span>
        {actionButtonText && (
          <Button
            variant="outline"
            size="sm"
            className="ml-4"
            onClick={handleAction}
          >
            {actionButtonText}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
} 