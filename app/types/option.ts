export interface Option {
  symbol: string;
  expiration: string;
  earningsDate: string;
  stockPrice: number;
  strike: number;
  expectedPremium: number,
  askPrice: number;
  yieldPercent: number;
  bidPrice: number;
  volume: number;
  openInterest: number;
}