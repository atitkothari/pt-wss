'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { fetchOptionsData } from '../services/api';
import { Option, OptionType, StrikeFilter } from '../types/option';
import { parseISO, addDays, format } from 'date-fns';
import { useAuth } from './AuthContext';
import { yieldFilterConfig, volumeFilterConfig, priceFilterConfig } from '../config/filterConfig';
import { useSearchParams } from 'next/navigation';

interface OptionsDataContextType {
  data: Option[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  fetchData: (
    searchTerms?: string[],
    minYieldVal?: number,
    maxYieldVal?: number,
    minPriceVal?: number,
    maxPriceVal?: number,
    minVolVal?: number,
    maxVolVal?: number,
    selectedExpiration?: string,
    pageNo?: number,
    pageSize?: number,
    sortConfig?: { field: keyof Option; direction: 'asc' | 'desc' | null },
    strikeFilter?: StrikeFilter,
    deltaRange?: [number, number],
    peRatio?: [number, number],
    marketCap?: [number, number],
    movingAverageCrossover?: string,
    sector?: string,
    moneynessRange?: [number, number],
    impliedVolatilityRange?: [number, number],
    minSelectedExpiration?: string,
    optionType?: OptionType
  ) => Promise<void>;
}

const OptionsDataContext = createContext<OptionsDataContextType>({
  data: [],
  loading: false,
  error: null,
  totalCount: 0,
  fetchData: async () => {}
});

export const useOptionsData = () => useContext(OptionsDataContext);

export const OptionsDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { userId } = useAuth(); // Get userId from auth context
  const searchParams = useSearchParams();

  const fetchData = async (
    searchTerms: string[] = [],
    minYieldVal: number = 0,
    maxYieldVal: number = 10,
    minPriceVal: number = 0,
    maxPriceVal: number = 1000,
    minVolVal: number = 0,
    maxVolVal: number = 10000,
    selectedExpiration: string = '',
    pageNo: number = 1,
    pageSize: number = 50,
    sortConfig?: { field: keyof Option; direction: 'asc' | 'desc' | null },
    strikeFilter?: StrikeFilter,
    deltaRange?: [number, number],
    peRatio?: [number, number],
    marketCap?: [number, number],
    movingAverageCrossover?: string,
    sector?: string,
    moneynessRange?: [number, number],
    impliedVolatilityRange?: [number, number],
    minSelectedExpiration: string = '',
    optionType: OptionType = 'call'
  ) => {
    setLoading(true);
    try {
      const filters: any = [];
      if(optionType) {
        filters.push({ operation: 'eq', field: 'type', value: `"${optionType}"` });
      }
      if (searchTerms && searchTerms.length > 0) {
        if (searchTerms.length === 1) {
          filters.push({ operation: 'eq', field: 'symbol', value: `"${searchTerms[0]}"` });
        } else {
          filters.push({ 
            operation: 'in', 
            field: 'symbol', 
            value: `${searchTerms.join(',')}`
          });
        }
      }
      if (minYieldVal > 0) {
        filters.push({ operation: 'gt', field: 'yieldPercent', value: minYieldVal });
      }
      if (maxYieldVal < yieldFilterConfig.max) {
        filters.push({ operation: 'lt', field: 'yieldPercent', value: maxYieldVal });
      }
      if (minPriceVal > 0) {
        filters.push({ operation: 'gte', field: 'strike', value: minPriceVal });
      }
      if (maxPriceVal < priceFilterConfig.max) {
        filters.push({ operation: 'lte', field: 'strike', value: maxPriceVal });
      }      
      if (minVolVal > 0) {
        filters.push({ operation: 'gt', field: 'volume', value: minVolVal });
      }
      if (maxVolVal < volumeFilterConfig.max) {
        filters.push({ operation: 'lt', field: 'volume', value: maxVolVal });
      }
      
      if(selectedExpiration === "") {
        filters.push({ operation: 'eq', field: 'expiration', value: `"${format(new Date(), 'yyyy-MM-dd')}"` });
      } else if (selectedExpiration) {
        // If minSelectedExpiration is provided, use it as the lower bound
        // Otherwise, use today's date as the lower bound
        const lowerBoundDate = minSelectedExpiration ? minSelectedExpiration : format(new Date(), 'yyyy-MM-dd');
        filters.push({ operation: 'gte', field: 'expiration', value: `"${lowerBoundDate}"` });
        filters.push({ operation: 'lte', field: 'expiration', value: `"${selectedExpiration}"` });      
      }

      if (deltaRange) {
        filters.push({ operation: 'gte', field: 'delta', value: deltaRange[0] });
        filters.push({ operation: 'lte', field: 'delta', value: deltaRange[1] });
      }
      
      // Add moneyness range filters
      if (moneynessRange) {
        filters.push({ operation: 'strikeFilter', field: optionType, 
          value: moneynessRange[0]/100
        });
      }
      
      // Add implied volatility filters
      if (impliedVolatilityRange) {
        if (impliedVolatilityRange[0] > 0) {
          filters.push({ operation: 'gte', field: 'impliedVolatility', value: impliedVolatilityRange[0] });
        }
        if (impliedVolatilityRange[1] < 200) {
          filters.push({ operation: 'lte', field: 'impliedVolatility', value: impliedVolatilityRange[1] });
        }
      }
      
      // Add PE Ratio filters
      if (peRatio && peRatio[0] > 0) {
        filters.push({ operation: 'gte', field: 'peRatio', value: peRatio[0] });
      }
      if (peRatio && peRatio[1] < 100) {
        filters.push({ operation: 'lte', field: 'peRatio', value: peRatio[1] });
      }
      
      // Add Market Cap filters (in billions)
      if (marketCap && marketCap[0] > 0) {
        filters.push({ operation: 'gte', field: 'marketCap', value: marketCap[0] * 1000000000 });
      }
      if (marketCap && marketCap[1] < 1000) {
        filters.push({ operation: 'lte', field: 'marketCap', value: marketCap[1] * 1000000000});
      }
      
      // Add Moving Average Crossover filter
      if (movingAverageCrossover && movingAverageCrossover !== 'Any') {
        filters.push({ 
          operation: 'eq', 
          field: 'movingAverageCrossover', 
          value: `"${movingAverageCrossover}"` 
        });
      }
      
      // Add Sector filter
      if (sector && sector !== 'All Sectors') {
        filters.push({ 
          operation: 'eq', 
          field: 'sector', 
          value: `"${sector}"` 
        });
      }

      // Get sort params from URL if not provided in sortConfig
      const sortBy = sortConfig?.field || searchParams.get('sortBy');
      const sortDir = sortConfig?.direction || searchParams.get('sortDir') as 'asc' | 'desc' | null;

      const finalSortConfig = sortBy ? {
        field: sortBy,
        direction: sortDir || 'asc'
      } : undefined;
      
      const result = await fetchOptionsData(
        filters, 
        pageNo, 
        pageSize, 
        finalSortConfig, 
        strikeFilter,
        optionType,
        userId // Pass userId to the API call
      );   

      const updatedResult = result.options.map((option: any) => {
        const askPrice = isNaN(option.askPrice) ? 0 : option.askPrice || 0;
        const bidPrice = isNaN(option.bidPrice) ? 0 : option.bidPrice || 0;
        const premium = ((askPrice + bidPrice) / 2) * 100;

        const expirationDate = addDays(parseISO(option.expiration), 1);
        const correctedExpiration = format(expirationDate, 'yyyy-MM-dd');
        
        // Handle potential NaN values in numeric fields
        const safeOption = {
          ...option,
          premium: isNaN(premium) ? 0 : premium,
          delta: isNaN(option.delta) ? null : option.delta,
          yieldPercent: isNaN(option.yieldPercent) ? 0 : option.yieldPercent,
          impliedVolatility: isNaN(option.impliedVolatility) ? 0 : option.impliedVolatility,
          stockPrice: isNaN(option.stockPrice) ? 0 : option.stockPrice,
          strike: isNaN(option.strike) ? 0 : option.strike,
          volume: isNaN(option.volume) ? 0 : option.volume,
          openInterest: isNaN(option.openInterest) ? 0 : option.openInterest,
          expiration: correctedExpiration,
          askPrice: isNaN(askPrice)? 0 : askPrice,
          bidPrice: isNaN(bidPrice)? 0 : bidPrice,
        };

        return safeOption;
      });
   
      setData(updatedResult);
      setTotalCount(result.count);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OptionsDataContext.Provider value={{ data, loading, error, totalCount, fetchData }}>
      {children}
    </OptionsDataContext.Provider>
  );
};