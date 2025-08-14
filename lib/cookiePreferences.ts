export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  timestamp: string;
};

export const getCookiePreferences = (): CookiePreferences => {
  if (typeof window === 'undefined') {
    return {
      necessary: true,
      analytics: true,
      timestamp: new Date().toISOString()
    };
  }

  const stored = localStorage.getItem('cookie-preferences');
  if (!stored) {
    return {
      necessary: true,
      analytics: true,
      timestamp: new Date().toISOString()
    };
  }

  return JSON.parse(stored);
};

export const hasAcceptedAnalytics = (): boolean => {
  const preferences = getCookiePreferences();
  return preferences.analytics;
}; 