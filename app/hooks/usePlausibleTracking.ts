import { usePlausible } from 'next-plausible';

export const usePlausibleTracking = () => {
  const plausible = usePlausible();

  const trackAuthEvent = (action: 'sign_in' | 'sign_up' | 'reset_password', method: 'email' | 'google') => {
    plausible('auth', {
      props: {
        action,
        method,
      },
    });
  };

  const trackQueryEvent = (action: 'save' | 'search' | 'filter', details?: Record<string, any>) => {
    plausible('query', {
      props: {
        action,
        ...details,
      },
    });
  };

  const trackCalculatorEvent = (action: 'calculate', details?: Record<string, any>) => {
    plausible('calculator', {
      props: {
        action,
        ...details,
      },
    });
  };

  const trackPricingEvent = (action: 'billing_toggle' | 'start_trial' | 'contact', details?: Record<string, any>) => {
    plausible('pricing', {
      props: {
        action,
        ...details,
      },
    });
  };

  return {
    trackAuthEvent,
    trackQueryEvent,
    trackCalculatorEvent,
    trackPricingEvent,
  };
}; 