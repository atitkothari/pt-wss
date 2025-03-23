/**
 * Filter Configuration
 * 
 * This file centralizes all filter min, max, and default values used throughout the application.
 * Modifying values here will affect all components that use these filters.
 */

// Yield Filter Configuration
export const yieldFilterConfig = {
  min: 0,
  max: 10,
  default: 0,
  step: .5,
  tooltip: "Minimum percentage yield to filter options"
};

// Price Filter Configuration
export const priceFilterConfig = {
  min: 0,
  max: 2000,
  defaultMin: 0,
  defaultMax: 2000,
  step: 50,
  tooltip: "Strike price range in dollars"
};

// Volume Filter Configuration
export const volumeFilterConfig = {
  min: 0,
  max: 1000,
  default: 100,
  step: 50,
  tooltip: "Minimum trading volume to ensure liquidity"
};

// Delta Filter Configuration
export const deltaFilterConfig = {
  min: -1,
  max: 1,
  defaultMin: -1,
  defaultMax: 1,
  step: 0.1,
  tooltip: "Delta value (-1 to 1). Delta measures the rate of change of option price with respect to the underlying asset's price."
};

// Days to Expiration Filter Configuration
export const dteFilterConfig = {
  min: 0,
  max: 365,
  defaultMin: 0,
  defaultMax: 30,
  default: 30, // For single value DTE selector
  step: 1,
  tooltip: "Number of days until option expiration",
  // Exponential scale parameters
  isExponential: true,
  exponent: 3, // Power for exponential scaling
  // Helper functions for exponential scaling
  toExponential: (linearValue: number) => {
    const maxValue = 365;
    const normalizedValue = linearValue / maxValue;
    return Math.round(Math.pow(normalizedValue, dteFilterConfig.exponent) * maxValue);
  },
  fromExponential: (exponentialValue: number) => {
    const maxValue = 365;
    const normalizedValue = exponentialValue / maxValue;
    return Math.round(Math.pow(normalizedValue, 1/dteFilterConfig.exponent) * maxValue);
  }
};

// P/E Ratio Filter Configuration
export const peRatioFilterConfig = {
  min: 0,
  max: 100,
  defaultMin: 0,
  defaultMax: 100,
  step: 1,
  tooltip: "Price-to-Earnings ratio to filter stocks"
};

// Market Cap Filter Configuration (in billions)
export const marketCapFilterConfig = {
  min: 0,
  max: 1000,
  defaultMin: 0,
  defaultMax: 1000,
  step: 10,
  tooltip: "Market capitalization in billions of dollars",
  // Exponential scale parameters
  isExponential: true,
  exponent: 3, // Power for exponential scaling
  // Helper functions for exponential scaling
  toExponential: (linearValue: number) => {
    const maxValue = 1000;
    const normalizedValue = linearValue / maxValue;
    return Math.round(Math.pow(normalizedValue, dteFilterConfig.exponent) * maxValue);
  },
  fromExponential: (exponentialValue: number) => {
    const maxValue = 1000;
    const normalizedValue = exponentialValue / maxValue;
    return Math.round(Math.pow(normalizedValue, 1/dteFilterConfig.exponent) * maxValue);
  }
};

// Moneyness Range Filter Configuration
export const moneynessFilterConfig = {
  min: -15,
  max: 15,
  defaultMin: -15,
  defaultMax: 15,
  step: 1,
  tooltip: "Percentage difference between strike price and current stock price"
};

// Moving Average Crossover Options
export const movingAverageCrossoverOptions = [
  "Any",
  "200 > 50",
  "50 > 200"
];

// Sector Options
export const sectorOptions = [
  "All Sectors",
  "Basic Materials",
  "Communication Services",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Energy",
  "Financial Services",
  "Healthcare",
  "Industrials",
  "Real Estate",
  "Technology",
  "Utilities"
];

// Market Cap Categories
export const marketCapCategories = [
  "All Market Caps",
  "Mega Cap (>$200B)",
  "Large Cap ($10B-$200B)",
  "Mid Cap ($2B-$10B)",
  "Small Cap ($300M-$2B)",
  "Micro Cap (<$300M)"
];

// Strike Filter Options
// export const strikeFilterOptions = {
//   default: 'ONE_OUT',
//   options: [ 'ONE_OUT', 'THREE_PERCENT','ALL']
// };

// Default visible columns for options tables
export const defaultVisibleColumns = [
  'symbol',
  'stockPrice',
  'strike',
  'premium',
  'delta',
  'yieldPercent',
  'expiration',
  'volume',
  'openInterest',
  'earningsDate',
  'impliedVolatility'
];

// Implied Volatility Filter Configuration
export const impliedVolatilityFilterConfig = {
  min: 0,
  max: 200,
  defaultMin: 0,
  defaultMax: 200,
  step: 5,
  tooltip: "Implied Volatility percentage range for option contracts"
};