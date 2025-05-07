export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

export const getCookiePreferences = (): CookiePreferences => {
  if (typeof window === 'undefined') {
    return {
      necessary: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString()
    };
  }

  const stored = localStorage.getItem('cookie-preferences');
  if (!stored) {
    return {
      necessary: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString()
    };
  }

  return JSON.parse(stored);
};

export const hasAcceptedAnalytics = (): boolean => {
  const preferences = getCookiePreferences();
  return preferences.analytics;
};

export const hasAcceptedMarketing = (): boolean => {
  const preferences = getCookiePreferences();
  return preferences.marketing;
}; 