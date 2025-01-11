export interface Option {
  askPrice: number;
  bidPrice: number;
  earningsDate: string;
  expiration: string;
  impliedVolatility: number;
  openInterest: number;
  stockPrice: number;
  strike: number;
  symbol: string;
  type: string;
  volume: number;
  yieldPercent: number;
  premium?: number; // Calculated field
  delta?: number;  // Make it optional since some options might not have delta
  annualizedReturn?: number;
}

export type OptionType = 'call' | 'put';

export type StrikeFilter = 'ITM' | 'ONE_OUT' | 'THREE_PERCENT' | 'ALL';