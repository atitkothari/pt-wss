export type EmailFrequency = 'daily' | 'weekly' | 'monthly';

export interface SavedScreener {
  id: string;
  name: string;
  filters: {
    optionType: 'call' | 'put';
    searchTerm?: string;
    selectedStocks?: string[];
    yieldRange?: [number, number];
    minPrice?: number;
    maxPrice?: number;
    volumeRange?: [number, number];
    deltaFilter?: [number, number];
    minDte?: number;
    maxDte?: number;
    impliedVolatility?: [number, number];
    peRatio?: [number, number];
    marketCap?: [number, number];
    moneynessRange?: [number, number];
    movingAverageCrossover?: string[];
    sector?: string[];
    excludedStocks?: string[];
    probabilityOfProfit?: [number, number];
    annualizedReturn?: [number, number];
  };
  emailNotifications?: {
    enabled: boolean;
    email: string;
    frequency: EmailFrequency;
  };
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
} 