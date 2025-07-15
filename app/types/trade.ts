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
}
