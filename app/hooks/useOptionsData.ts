"use client";

import { useState } from 'react';
import { fetchOptionsData } from '../services/api';
import { Option, OptionType, StrikeFilter } from '../types/option';
import { parseISO, addDays, format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { yieldFilterConfig, volumeFilterConfig, priceFilterConfig, moneynessFilterConfig } from '../config/filterConfig';

export function useOptionsData(
  symbols: string[] = [],
  minYield: number = 0,
  maxYield: number = 10,
  minPrice: number = 0,
  maxPrice: number = 1000,
  minVol: number = 0,
  maxVol: number = 10000,
  expiration: string = '',
  option: OptionType = 'call',
  minDelta: number = -1,
  maxDelta: number = 1,
  minExpiration: string = '',
  pageName: string = '',
  excludedSymbols: string[] = []
) {
  const [data, setData] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const searchParams = useSearchParams();
  const { userId } = useAuth(); // Get userId from auth context

  const fetchData = async (
    searchTerms: string[] = symbols,
    minYieldVal: number = minYield,
    maxYieldVal: number = maxYield,
    minPriceVal: number = minPrice,
    maxPriceVal: number = maxPrice,
    minVolVal: number = minVol,
    maxVolVal: number = maxVol,
    selectedExpiration: string = expiration,
    pageNo: number = 1,
    pageSize: number = 50,
    sortConfig?: { field: keyof Option; direction: 'asc' | 'desc' | null },
    strikeFilter?: StrikeFilter,
    deltaRange?: [number, number],
    peRatio?: [number, number],
    marketCap?: [number, number],    
    sector?: string,
    moneynessRange?: [number, number],
    impliedVolatilityRange?: [number, number],
    minSelectedExpiration: string = minExpiration,
    excludedSymbolsList: string[] = excludedSymbols
  ) => {
    setLoading(true);
    try {
      const filters: any = [];
      if(option) {
        filters.push({ operation: 'eq', field: 'type', value: `"${option}"` });
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
      if (excludedSymbolsList && excludedSymbolsList.length > 0) {
        if (excludedSymbolsList.length === 1) {
          filters.push({ operation: 'exclude', field: 'symbol', value: `"${excludedSymbolsList[0]}"` });
        } else {
          filters.push({ 
            operation: 'exclude', 
            field: 'symbol', 
            value: `${excludedSymbolsList.join(',')}`
          });
        }
      }
      if (minYieldVal > 0) {
        filters.push({ operation: 'gt', field: 'yieldPercent', value: minYieldVal });
      }
      if (maxYieldVal < yieldFilterConfig.max) {
        filters.push({ operation: 'lt', field: 'yieldPercent', value: maxYieldVal });
      }
      if (minPriceVal>0 ) {
        filters.push({ operation: 'gte', field: 'strike', value: minPriceVal });
      }
      if (maxPriceVal<priceFilterConfig.max) {
        filters.push({ operation: 'lte', field: 'strike', value: maxPriceVal });
      }      
      if (minVolVal > 0) {
        filters.push({ operation: 'gt', field: 'volume', value: minVolVal });
      }
      if (maxVolVal < volumeFilterConfig.max) {
        filters.push({ operation: 'lt', field: 'volume', value: maxVolVal });
      }
      
      if(selectedExpiration === "") {
        filters.push({ operation: 'gte', field: 'expiration', value: `"${format(new Date(), 'yyyy-MM-dd')}"` });
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
        if(moneynessRange[0] > moneynessFilterConfig.min)
          filters.push({ operation: 'gte', field: 'strikeFilter', value: moneynessRange[0]/100 });
        if(moneynessRange[1] < moneynessFilterConfig.max)
        filters.push({ operation: 'lte', field: 'strikeFilter', value: moneynessRange[1]/100 });
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
        option,
        userId, // Pass userId to the API call
        pageName
      );  
      

      const updatedResult = result.options.map((option: any) => {
        const askPrice = isNaN(option.askPrice) ? 0 : option.askPrice || 0;
        const bidPrice = isNaN(option.bidPrice) ? 0 : option.bidPrice || 0;
        const premium = bidPrice * 100;        

        let expirationDate: string|Date = "-"
        let correctedExpiration = "-"

        if(option.expiration!="redacted" && expirationDate!="redacted"){
          expirationDate = option.expiration;
          correctedExpiration = option.expiration;          
        }                                 
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