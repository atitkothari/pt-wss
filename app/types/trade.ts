export interface Trade {
  id: string;
  symbol: string;
  type: 'call' | 'put';
  strike: number;
  expiration: string;
  premium: number;
  status: 'open' | 'closed';
  openDate: string;
  closeDate: string | null;
  closingCost?: number; // Amount paid to close the trade
  contracts?: number; // Number of contracts
  optionKey?: number; // Option key for fetching current market data
}
