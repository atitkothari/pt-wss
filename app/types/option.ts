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
  expectedPremium?: number; // Calculated field
}