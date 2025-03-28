import { Option, OptionType } from "../types/option";
import { StrikeFilter as StrikeFilterType } from '../types/option';

interface HighYieldTicker {
  symbol: string;
  yieldPercent: number;
  askprice?: number;
  bidprice?: number;
  delta?: number;
  expiration?: string;
  strike?: number;
  volume?: number;
  openinterest?: number;
}

interface HighYieldResponse {
  calls: {
    tickers: HighYieldTicker[];
    url: string;
  };
  puts: {
    tickers: HighYieldTicker[];
    url: string;
  };
}

interface Filter {
  operation: string;
  field: string;
  value: string | number | number[];
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc' | null;
}

export async function fetchOptionsData(
  filters: any[], 
  pageNo: number = 1, 
  pageSize: number = 50,
  sortConfig?: SortConfig,
  strikeFilter?: StrikeFilterType,
  optionType: OptionType = 'call',
  userId?: string | null
) {
  const body: any = {
    filters,
    paging: true,
    pageNo,
    pageSize
  };

  // Add userId to the request body if available
  if (userId) {
    body.userId = userId;
  }

  if (sortConfig && sortConfig.direction) {
    body.filters.push({
      operation: "sort",
      field: sortConfig.field,
      value: `${sortConfig.direction}`
    });
  }

  // Note: The strikeFilter is kept for backward compatibility
  // but most filtering will now be done through the moneynessRange filter
  if (strikeFilter) {
    if (strikeFilter === 'THREE_PERCENT') {
      body.filters.push({
        operation: "strikeFilter",
        field: optionType,
        value: 0.03
      });
    } else if (strikeFilter === 'FIVE_PERCENT') {
      body.filters.push({
        operation: "strikeFilter",
        field: optionType,
        value: 0.05
      });
    } else if (strikeFilter === 'ONE_OUT') {
      body.filters.push({
        operation: "strikeFilter",
        field: optionType,
        value: 0
      });
    }
  }

  const response = await fetch(`https://api.wheelstrategyoptions.com/wheelstrat/filter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  const result = await response.json();
  
  return {
    ...result,
    options: result.options.map((opt: any) => ({
      ...opt,
      delta: opt.delta || null
    }))
  };
}

export async function fetchTickersWithHighestYield(): Promise<HighYieldResponse> {
  const response = await fetch(`https://api.wheelstrategyoptions.com/wheelstrat/fetchTickersWithHighestYield`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch highest yield data');
  }

  return await response.json();
}

interface HighIVTicker {
  symbol: string;
  impliedVolatility: number;
  askprice?: number;
  bidprice?: number;
  delta?: number;
  expiration?: string;
  strike?: number;
  volume?: number;
  openinterest?: number;
  yieldPercent?: number;
}

interface HighIVResponse {
  calls: {
    tickers: HighIVTicker[];
    url: string;
  };
  puts: {
    tickers: HighIVTicker[];
    url: string;
  };
}

export async function fetchTickersWithHighestImpliedVolatility(): Promise<HighIVResponse> {
  const response = await fetch(`https://api.wheelstrategyoptions.com/wheelstrat/fetchTockersWithHighestImpliedVolatility`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch highest implied volatility data');
  }

  return await response.json();
}

interface NextEarningsTicker {
  symbol: string;
  earningsDate: string;
  impliedVolatility: number;
  askprice?: number;
  bidprice?: number;
  delta?: number;
  expiration?: string;
  strike?: number;
  volume?: number;
  openinterest?: number;
  yieldPercent?: number;
  stockPrice?: number;
}

interface NextEarningsResponse {
  calls: {
    tickers: NextEarningsTicker[];
    url: string;
  };
  puts: {
    tickers: NextEarningsTicker[];
    url: string;
  };
}

export async function fetchTickersWithNextEarnings(): Promise<NextEarningsResponse> {
  const response = await fetch(`https://api.wheelstrategyoptions.com/wheelstrat/fetchTickersWithNextEarnings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch next earnings data');
  }

  return await response.json();
}