import { SavedScreener } from '../types/screener';

export const defaultScreeners: SavedScreener[] = [
  // Covered Call Screeners
  {
    id: 'high-iv-call',
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
    id: 'high-yield-call',
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
    id: 'earnings-next-week-call',
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
    id: 'high-volume-call',
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
  },
  // Cash Secured Put Screeners
  {
    id: 'high-iv-put',
    name: 'High IV',
    optionType: 'put',
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
    id: 'high-yield-put',
    name: 'High Yield',
    optionType: 'put',
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
    id: 'earnings-next-week-put',
    name: 'Earnings Next Week',
    optionType: 'put',
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
    id: 'high-volume-put',
    name: 'High Volume',
    optionType: 'put',
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