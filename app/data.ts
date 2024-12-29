export interface CoveredCall {
  symbol: string;
  expiration: string;
  stock_price: number;
  strike: number;
  ask_price: number;
  yield_percent: number;
  bid_price: number;
  volume: number;
  open_interest: number;
}

export const coveredCalls: CoveredCall[] = [
  {
    symbol: "APP",
    expiration: "2025-01-03",
    stock_price: 333.57,
    strike: 325.0,
    ask_price: 7.1,
    yield_percent: 2.18,
    bid_price: 6.4,
    volume: 107.0,
    open_interest: 67.0
  },
  // ... Add all other rows from the CSV
];