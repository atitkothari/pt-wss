import { SavedScreener } from '../types/screener';

export const defaultScreeners: SavedScreener[] = [
  // Covered Call Screeners
  {
    id: 'high-iv-call',
    name: 'High IV',
    filters: {
      optionType: 'call',
      impliedVolatility: [70, 200],
      volumeRange: [100, 1000000],
      minPrice: 5,      
      deltaFilter:[0,.85],
      moneynessRange:[2,30],
      maxDte: 30,
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
      deltaFilter:[0,.85],
      moneynessRange:[2,100],
      maxDte: 30,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'unusual-volume-call',
    name: 'Unusual Volume',
    filters: {
      optionType: 'call',
      volumeRange: [500, 1000000],
      minPrice: 5,      
      deltaFilter:[0,.85],
      moneynessRange:[2,100],
      maxDte: 30,      
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
      impliedVolatility: [70, 200],
      volumeRange: [100, 1000000],
      minPrice: 5,      
      deltaFilter:[-0.85,0],
      moneynessRange:[-30,-2],
      maxDte: 30,   
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
      deltaFilter:[-0.85,0],
      moneynessRange:[-30,-2],
      maxDte: 30,  
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'unusual-volume-put',
    name: 'Unusual Volume',
    filters: {
      optionType: 'put',
      volumeRange: [100, 1000000],
      minPrice: 5,      
      deltaFilter:[-0.85,0],
      moneynessRange:[-30,-2],
      maxDte: 30,  
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  // Low Delta Call Screeners
  {
    id: 'low-delta-call',
    name: 'Low Delta Call',
    filters: {
      optionType: 'call',
      deltaFilter: [0.1, 0.3],
      volumeRange: [100, 1000000],
      minPrice: 0.5,
      moneynessRange: [5, 50],
      maxDte: 45,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  // Low Delta Put Screeners
  {
    id: 'low-delta-put',
    name: 'Low Delta Put',
    filters: {
      optionType: 'put',
      deltaFilter: [-0.3, -0.1],
      volumeRange: [100, 1000000],
      minPrice: 0.5,
      moneynessRange: [-50, -5],
      maxDte: 45,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  // Weekly Options Screeners
  {
    id: 'weekly-call',
    name: 'Weekly Call',
    filters: {
      optionType: 'call',
      minDte: 1,
      maxDte: 7,
      volumeRange: [200, 1000000],
      minPrice: 0.5,
      deltaFilter: [0.2, 0.5],
      moneynessRange: [2, 20],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'weekly-put',
    name: 'Weekly Put',
    filters: {
      optionType: 'put',
      minDte: 1,
      maxDte: 7,
      volumeRange: [200, 1000000],
      minPrice: 0.5,
      deltaFilter: [-0.5, -0.2],
      moneynessRange: [-20, -2],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  // High Probability Trades
  {
    id: 'high-prob-call',
    name: 'High Probability Call',
    filters: {
      optionType: 'call',
      deltaFilter: [0.7, 0.85],
      volumeRange: [100, 1000000],
      minPrice: 1,
      moneynessRange: [-10, 10],
      maxDte: 30,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'high-prob-put',
    name: 'High Probability Put',
    filters: {
      optionType: 'put',
      deltaFilter: [-0.85, -0.7],
      volumeRange: [100, 1000000],
      minPrice: 1,
      moneynessRange: [-10, 10],
      maxDte: 30,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  }
]; 