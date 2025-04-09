import { SavedScreener } from '../types/screener';

export const defaultScreeners: SavedScreener[] = [
  // Covered Call Screeners
  {
    id: 'high-iv-call',
    name: 'High IV',
    filters: {
      optionType: 'call',
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
    id: 'high-yield-call',
    name: 'High Yield',
    filters: {
      optionType: 'call',
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
    id: 'earnings-next-week-call',
    name: 'Earnings Next Week',
    filters: {
      optionType: 'call',
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
    id: 'high-volume-call',
    name: 'High Volume',
    filters: {
      optionType: 'call',
      volumeRange: [100, 1000000],
      minPrice: 5,
      maxPrice: 1000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  // Cash Secured Put Screeners
  {
    id: 'high-iv-put',
    name: 'High IV',
    filters: {
      optionType: 'put',
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
    id: 'high-yield-put',
    name: 'High Yield',
    filters: {
      optionType: 'put',
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
    id: 'earnings-next-week-put',
    name: 'Earnings Next Week',
    filters: {
      optionType: 'put',
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
    id: 'high-volume-put',
    name: 'High Volume',
    filters: {
      optionType: 'put',
      volumeRange: [100, 1000000],
      minPrice: 5,
      maxPrice: 1000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  }
]; 