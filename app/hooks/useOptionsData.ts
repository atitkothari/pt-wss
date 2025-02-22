"use client";

import { useState } from 'react';
import { fetchOptionsData } from '../services/api';
import { Option, OptionType, StrikeFilter } from '../types/option';
import { parseISO, addDays, format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

export function useOptionsData(
  symbol: string = '',
  minYield: number = 0,
  maxPrice: number = 1000,
  minVol: number = 0,
  expiration: string = '',
  option: OptionType = 'call',
  minDelta: number = -1,
  maxDelta: number = 1
) {
  const [data, setData] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const searchParams = useSearchParams();

  const fetchData = async (
    searchTerm: string = symbol,
    minYieldVal: number = minYield,
    maxPriceVal: number = maxPrice,
    minVolVal: number = minVol,
    selectedExpiration: string = expiration,
    pageNo: number = 1,
    pageSize: number = 50,
    sortConfig?: { field: keyof Option; direction: 'asc' | 'desc' | null },
    strikeFilter?: StrikeFilter,
    deltaRange?: [number, number]
  ) => {
    setLoading(true);
    try {
      const filters: any = [];
      if(option) {
        filters.push({ operation: 'eq', field: 'type', value: `"${option}"` });
      }
      if (searchTerm) {
        filters.push({ operation: 'eq', field: 'symbol', value: `"${searchTerm}"` });
      }
      if (minYieldVal > 0) {
        filters.push({ operation: 'gt', field: 'yieldPercent', value: minYieldVal });
      }
      if (maxPriceVal) {
        filters.push({ operation: 'lt', field: 'strike', value: maxPriceVal });
      }
      if (minVolVal > 0) {
        filters.push({ operation: 'gt', field: 'volume', value: minVolVal });
      }
      
      if(selectedExpiration === "") {
        filters.push({ operation: 'eq', field: 'expiration', value: `"${format(new Date(), 'yyyy-MM-dd')}"` });
      } else if (selectedExpiration) {            
        filters.push({ operation: 'gte', field: 'expiration', value: `"${format(new Date(), 'yyyy-MM-dd')}"` });
        filters.push({ operation: 'lte', field: 'expiration', value: `"${selectedExpiration}"` });      
      }

      if (deltaRange) {
        filters.push({ operation: 'gte', field: 'delta', value: deltaRange[0] });
        filters.push({ operation: 'lte', field: 'delta', value: deltaRange[1] });
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
        option        
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

  return { data, loading, error, totalCount, fetchData };
}