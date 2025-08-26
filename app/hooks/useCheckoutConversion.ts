import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlausibleTracker } from '../utils/plausible';
import { PlausibleEvents } from '../utils/plausible';
import { pricingInfo } from '../config/pricingInfo';

export function useCheckoutConversion() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { trackEvent } = usePlausibleTracker();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // User returned from successful checkout - track the conversion
      trackEvent(PlausibleEvents.PaidConversion, { sessionId });
      
      // Get billing cycle and limited time status from URL parameters
      const billingCycle = searchParams.get('billing_cycle') as 'monthly' | 'quarterly' | 'yearly';
      const isLimitedTime = searchParams.get('is_limited_time') === 'true';
      
      console.log('Conversion tracking - Session ID:', sessionId);
      console.log('Conversion tracking - Billing cycle:', billingCycle);
      console.log('Conversion tracking - Limited time:', isLimitedTime);
      console.log('Conversion tracking - All search params:', Object.fromEntries(searchParams.entries()));
      
      // Calculate the actual price based on billing cycle and limited time status
      let conversionValue = 1.0; // Default fallback
      if (billingCycle && (billingCycle === 'monthly' || billingCycle === 'quarterly' || billingCycle === 'yearly')) {
        if (isLimitedTime) {
          conversionValue = pricingInfo.limitedTime[billingCycle].totalPrice;
        } else {
          conversionValue = pricingInfo.regular[billingCycle].totalPrice;
        }
        console.log('Conversion tracking - Calculated value:', conversionValue);
      } else {
        console.log('Conversion tracking - Using fallback value:', conversionValue);
      }
      
      // Track Google Ads conversion if analytics are accepted
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-17045149487/Ab57CIfp1I0bEK-u4b8_',
          'value': conversionValue,
          'currency': 'USD'
        });
        console.log('Conversion tracking - Google Ads event sent with value:', conversionValue);
      }
      
      // Clean up the URL by removing the session_id parameter
      const params = new URLSearchParams(searchParams.toString());
      params.delete('session_id');
      const newUrl = params.toString() ? `?${params.toString()}` : '';
      const currentPath = window.location.pathname;
      router.replace(`${currentPath}${newUrl}`);
    }
  }, [searchParams, trackEvent, router]);
}
