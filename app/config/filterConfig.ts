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
  step: 0.05,
  tooltip: "Delta value (-1 to 1). Delta measures the rate of change of option price with respect to the underlying asset's price."
};

// Days to Expiration Filter Configuration
export const dteFilterConfig = {
  min: 0,
  max: 365,
  defaultMin: 0,
  defaultMax: 365,
  default: 365, // For single value DTE selector
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
  'earningsDate',
  'impliedVolatility'
];

// All available columns for reference
// These columns will be shown when their related filters are changed
export const allColumns = [
  'symbol',
  'stockPrice',
  'strike',
  'premium',
  'delta',
  'yieldPercent',
  'expiration',
  'annualizedReturn', // Ann %
  'bidPrice', // Bid
  'askPrice', // Ask
  'volume', // Volume
  'openInterest', // Open Interest
  'peRatio', // P/E Ratio
  'marketCap', // Market Cap
  'sector', // Sector
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

/**
 * Sets all filter values to their defaults in local storage for a specific option type
 * @param optionType - The type of option ('call' or 'put')
 */
export const setDefaultFilterValues = (optionType: 'call' | 'put') => {
  // Yield filter
  localStorage.setItem(`${optionType}_yieldRange`, JSON.stringify([yieldFilterConfig.min, yieldFilterConfig.max]));

  // Price filter
  localStorage.setItem(`${optionType}_minPrice`, JSON.stringify(priceFilterConfig.defaultMin));
  localStorage.setItem(`${optionType}_maxPrice`, JSON.stringify(priceFilterConfig.defaultMax));

  // Volume filter
  localStorage.setItem(`${optionType}_volumeRange`, JSON.stringify([volumeFilterConfig.min, volumeFilterConfig.max]));

  // Delta filter
  localStorage.setItem(`${optionType}_deltaFilter`, JSON.stringify([deltaFilterConfig.defaultMin, deltaFilterConfig.defaultMax]));

  // DTE filter
  localStorage.setItem(`${optionType}_minDte`, JSON.stringify(dteFilterConfig.defaultMin));
  localStorage.setItem(`${optionType}_maxDte`, JSON.stringify(dteFilterConfig.defaultMax));

  // P/E Ratio filter
  localStorage.setItem(`${optionType}_peRatio`, JSON.stringify([peRatioFilterConfig.defaultMin, peRatioFilterConfig.defaultMax]));

  // Market Cap filter
  localStorage.setItem(`${optionType}_marketCap`, JSON.stringify([marketCapFilterConfig.defaultMin, marketCapFilterConfig.defaultMax]));

  // Moneyness filter
  localStorage.setItem(`${optionType}_moneynessRange`, JSON.stringify([moneynessFilterConfig.defaultMin, moneynessFilterConfig.defaultMax]));

  // Moving Average Crossover
  localStorage.setItem(`${optionType}_movingAverageCrossover`, JSON.stringify(movingAverageCrossoverOptions[0]));

  // Sector
  localStorage.setItem(`${optionType}_sector`, JSON.stringify(sectorOptions[0]));

  // Market Cap Category
  localStorage.setItem(`${optionType}_marketCapCategory`, JSON.stringify(marketCapCategories[0]));

  // Implied Volatility filter
  localStorage.setItem(`${optionType}_impliedVolatility`, JSON.stringify([impliedVolatilityFilterConfig.defaultMin, impliedVolatilityFilterConfig.defaultMax]));

  // Visible columns
  localStorage.setItem(`${optionType}_visibleColumns`, JSON.stringify(defaultVisibleColumns));

  // Reset search symbol
  localStorage.setItem(`${optionType}_searchTerm`, JSON.stringify(''));
  localStorage.setItem(`${optionType}_selectedStocks`, JSON.stringify([]));
};

