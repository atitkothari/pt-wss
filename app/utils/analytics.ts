// Type for analytics events
type AnalyticsEvent = {
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
};

// Function to send analytics events
export const sendAnalyticsEvent = (event: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    ((window as any).gtag)('event', event.event_name, {
      event_category: event.event_category,
      event_label: event.event_label,
      value: event.value,
      ...event
    });
  }
};

// Predefined event names
export const AnalyticsEvents = {
  // Auth events
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
  SIGN_UP: 'sign_up',
  PASSWORD_RESET: 'password_reset',
  
  // Navigation events
  PAGE_VIEW: 'page_view',
  TAB_CHANGE: 'tab_change',
  
  // Screener events
  SCREENER_SEARCH: 'screener_search',
  FILTER_CHANGE: 'filter_change',
  COLUMN_TOGGLE: 'column_toggle',
  STOCK_EXPAND: 'stock_expand',
  
  // Calculator events
  CALCULATOR_USE: 'calculator_use',
  
  // Discover events
  DISCOVER_TAB_CHANGE: 'discover_tab_change',
  STOCK_DETAIL_VIEW: 'stock_detail_view',
  
  // Contact events
  CONTACT_CLICK: 'contact_click',
  
  // Pricing events
  PRICING_MONTHLY_CLICK: 'pricing_monthly_click',
  PRICING_YEARLY_CLICK: 'pricing_yearly_click',
  PRICING_START_TRIAL_CLICK: 'pricing_start_trial_click',
  
  // Error events
  ERROR: 'error'
} as const; 