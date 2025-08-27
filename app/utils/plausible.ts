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
  LoadScreener = 'Load Screener',

  // Calculator events
  CalculatorUse = 'Calculator Use',

  // Discover events
  DiscoverTabChange = 'Discover Tab Change',
  StockDetailView = 'Stock Detail View',

  // Contact events
  ContactClick = 'Contact Click',

  // Pricing events
  PricingMonthlyClick = 'Pricing Monthly Click',
  PricingQuarterlyClick = 'Pricing Quarterly Click',
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
import { useAuth } from '../context/AuthContext';
import { getAnalyticsAuthStatus } from './userAuthStatus';

export const usePlausibleTracker = () => {
  const plausible = usePlausible();
  const { user, userId } = useAuth();

  const trackEvent = (eventName: PlausibleEvents, props?: Record<string, any>) => {
    // Get authentication status - prefer React context, fallback to utility function
    const authStatus = user ? { user_signed_in: true, user_id: user.uid } : getAnalyticsAuthStatus();
    
    // Enhance props with authentication status
    const enhancedProps = {
      ...props,
      ...authStatus
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`PLAUSIBLE_EVENT: ${eventName}`, enhancedProps);
    }
    plausible(eventName, { props: enhancedProps });
  };

  const trackPageView = (pageName: string, props?: Record<string, any>) => {
    // Get authentication status - prefer React context, fallback to utility function
    const authStatus = user ? { user_signed_in: true, user_id: user.uid } : getAnalyticsAuthStatus();
    
    // Enhance props with authentication status
    const enhancedProps = {
      ...props,
      ...authStatus
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`PLAUSIBLE_PAGE_VIEW: ${pageName}`, enhancedProps);
    }
    plausible('pageview', {
      u: `${window.location.pathname}?page=${pageName}`,
      props: enhancedProps,
    });
  };

  return { trackEvent, trackPageView };
};
