export interface CashSecuredPut {
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