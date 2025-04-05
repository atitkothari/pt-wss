import { SavedScreener } from '../types/screener';

export const defaultScreeners: SavedScreener[] = [
  {
    id: 'high-iv',
    name: 'High IV',
    optionType: 'call',
    filters: {
      impliedVolatility: [50, 200],
      volumeRange: [100, 1000000],
      minPrice: 5,
      maxPrice: 1000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'high-yield',
    name: 'High Yield',
    optionType: 'call',
    filters: {
      yieldRange: [2, 100],
      volumeRange: [100, 1000000],
      minPrice: 5,
      maxPrice: 1000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'earnings-next-week',
    name: 'Earnings Next Week',
    optionType: 'call',
    filters: {
      minDte: 1,
      maxDte: 7,
      impliedVolatility: [30, 200],
      volumeRange: [100, 1000000]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'high-volume',
    name: 'High Volume',
    optionType: 'call',
    filters: {
      volumeRange: [1000, 1000000],
      minPrice: 5,
      maxPrice: 1000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  }
]; 