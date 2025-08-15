export enum PlausibleEvents {
  // Auth events
  SignIn = 'Sign In',
  SignOut = 'Sign Out',
  SignUp = 'Sign Up',
  PasswordReset = 'Password Reset',

  // Navigation events
  PageView = 'Page View',
  TabChange = 'Tab Change',

  // Screener events
  ScreenerSearch = 'Screener Search',
  FilterChange = 'Filter Change',
  ColumnToggle = 'Column Toggle',
  StockExpand = 'Stock Expand',

  // Calculator events
  CalculatorUse = 'Calculator Use',

  // Discover events
  DiscoverTabChange = 'Discover Tab Change',
  StockDetailView = 'Stock Detail View',

  // Contact events
  ContactClick = 'Contact Click',

  // Pricing events
  PricingMonthlyClick = 'Pricing Monthly Click',
  PricingYearlyClick = 'Pricing Yearly Click',
  PricingStartTrialClick = 'Pricing Start Trial Click',
  PaidConversion = 'Paid Conversion',

  // Error events
  Error = 'Error',

  // Query events
  SaveQuery = 'Save Query',
  SearchQuery = 'Search Query',

  // Trade events
  AddTrade = 'Add Trade',
  EditTrade = 'Edit Trade',
  DeleteTrade = 'Delete Trade',
  ResetFilters = 'Reset Filters',
  Share = 'Share',
  Sort = 'Sort',
  Paginate = 'Paginate',
}

import { usePlausible } from 'next-plausible';

export const usePlausibleTracker = () => {
  const plausible = usePlausible();

  const trackEvent = (eventName: PlausibleEvents, props?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`PLAUSIBLE_EVENT: ${eventName}`, props);
    }
    plausible(eventName, { props });
  };

  const trackPageView = (pageName: string, props?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`PLAUSIBLE_PAGE_VIEW: ${pageName}`, props);
    }
    plausible('pageview', {
      u: `${window.location.pathname}?page=${pageName}`,
      props,
    });
  };

  return { trackEvent, trackPageView };
};
