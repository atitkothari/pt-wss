import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlausibleTracker } from '../utils/plausible';
import { PlausibleEvents } from '../utils/plausible';

export function useCheckoutConversion() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { trackEvent } = usePlausibleTracker();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // User returned from successful checkout - track the conversion
      trackEvent(PlausibleEvents.PaidConversion, { sessionId });
      
      // Clean up the URL by removing the session_id parameter
      const params = new URLSearchParams(searchParams.toString());
      params.delete('session_id');
      const newUrl = params.toString() ? `?${params.toString()}` : '';
      const currentPath = window.location.pathname;
      router.replace(`${currentPath}${newUrl}`);
    }
  }, [searchParams, trackEvent, router]);
}
