"use client";

import { useState } from 'react';
import { fetchOptionsData } from '../services/api';
import { Option, OptionType, StrikeFilter } from '../types/option';
import { parseISO, addDays, format, subDays } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { yieldFilterConfig, volumeFilterConfig, priceFilterConfig, moneynessFilterConfig } from '../config/filterConfig';

// Function to fetch current option price by optionKey
export const fetchOptionPrice = async (optionKey: string): Promise<{ askPrice: number; bidPrice: number, stockprice:number } | null> => {
  try {
    const response = await fetch(`/api/options-key?optionKey=${optionKey}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      askPrice: Number(data.askprice)*100 || 0,
      bidPrice: Number(data.bidprice)*100 || 0,
      stockprice: data.stockprice
    };
  } catch (error) {
    console.error('Error fetching option price:', error);
    return null;
  }
};

// Function to calculate unrealized P/L for a trade
export const calculateUnrealizedPL = (
  tradePremium: number,
  currentPrice: number,
  contracts: number = 1,
  tradeType: 'call' | 'put'
): number => {
  // For sold options (covered calls, cash secured puts), unrealized P/L is:
  // Premium received - Current market value of the option
  const currentValue = currentPrice;
  const unrealizedPL = (tradePremium - currentValue)*contracts;
  
  return unrealizedPL;
};

export function useOptionsData(
  options: {
    symbols?: string[];
    minYield?: number;
    maxYield?: number;
    minPrice?: number;
    maxPrice?: number;
    minVol?: number;
    maxVol?: number;
    expiration?: string;
    option?: OptionType;
    minDelta?: number;
    maxDelta?: number;
    minExpiration?: string;
    pageName?: string;
    excludedSymbols?: string[];
    probabilityRange?: [number, number];
    annualizedReturnRange?: [number, number];
  } = {}
) {
  const {
    symbols = [],
    minYield = 0,
    maxYield = 10,
    minPrice = 0,
    maxPrice = 1000,
    minVol = 0,
    maxVol = 10000,
    expiration = '',
    option = 'call',
    minDelta = -1,
    maxDelta = 1,
    minExpiration = '',
    pageName = '',
    excludedSymbols = [],
    probabilityRange,
    annualizedReturnRange
  } = options;

  const [data, setData] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const searchParams = useSearchParams();
  const { userId } = useAuth(); // Get userId from auth context

  const fetchData = async (
    fetchOptions: {
      searchTerms?: string[];
      minYield?: number;
      maxYield?: number;
      minPrice?: number;
      maxPrice?: number;
      minVol?: number;
      maxVol?: number;
      selectedExpiration?: string;
      pageNo?: number;
      pageSize?: number;
      sortConfig?: { field: keyof Option; direction: 'asc' | 'desc' | null };
      strikeFilter?: StrikeFilter;
      deltaRange?: [number, number];
      peRatio?: [number, number];
      marketCap?: [number, number];
      sector?: string;
      moneynessRange?: [number, number];
      impliedVolatilityRange?: [number, number];
      minSelectedExpiration?: string;
      excludedSymbols?: string[];
      probabilityRange?: [number, number];
      annualizedReturnRange?: [number, number];
    } = {}
  ) => {
    const {
      searchTerms = symbols,
      minYield: minYieldVal = minYield,
      maxYield: maxYieldVal = maxYield,
      minPrice: minPriceVal = minPrice,
      maxPrice: maxPriceVal = maxPrice,
      minVol: minVolVal = minVol,
      maxVol: maxVolVal = maxVol,
      selectedExpiration = expiration,
      pageNo = 1,
      pageSize = 50,
      sortConfig,
      strikeFilter,
      deltaRange,
      peRatio,
      marketCap,
      sector,
      moneynessRange,
      impliedVolatilityRange,
      minSelectedExpiration = minExpiration,
      excludedSymbols: excludedSymbolsList = excludedSymbols,
      probabilityRange: fetchProbabilityRange = probabilityRange,
      annualizedReturnRange
    } = fetchOptions;

    // Get sort params from URL if not provided in sortConfig
    const sortBy = sortConfig?.field || searchParams.get('sortBy');      

    const sortDir = sortConfig?.direction || searchParams.get('sortDir') as 'asc' | 'desc' | null;    
    setLoading(true);
    try {
      const filters: any = [];
      // Add option type filter
      if (option) {
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
      // if((searchTerms.length>0 && searchTerms[0]=='') || searchTerms.length==0){      
      //   filters.push({ 
      //     operation: 'sort', 
      //     field: 'lastUpdatedDate', 
      //     value: 'desc'
      //   });
      // }
      if (excludedSymbolsList && excludedSymbolsList.length > 0) {
        if (excludedSymbolsList.length === 1) {
          filters.push({ operation: 'exclude', field: 'symbol', value: `${excludedSymbolsList[0]}` });
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
        console.log("selectedExpiration is empty");
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
          filters.push({ operation: 'strikeFilter', field: option, value: moneynessRange[0]/100 });
        if(moneynessRange[1] < moneynessFilterConfig.max)
        filters.push({ operation: 'strikeFilter', field: option, value: moneynessRange[1]/100 });
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

      // Add probability filter
      if (fetchProbabilityRange) {
        if (fetchProbabilityRange[0] > 0) {
          filters.push({ operation: 'gte', field: 'probability', value: fetchProbabilityRange[0]/100 });
        }
        if (fetchProbabilityRange[1] < 100) {
          filters.push({ operation: 'lte', field: 'probability', value: fetchProbabilityRange[1]/100 });
        }
      }

      // Add annualized return filter
      if (annualizedReturnRange) {
        if (annualizedReturnRange[0] > 0) {
          filters.push({ operation: 'gte', field: 'annualizedReturn', value: annualizedReturnRange[0] });
        }
        if (annualizedReturnRange[1] < 1000) {
          filters.push({ operation: 'lte', field: 'annualizedReturn', value: annualizedReturnRange[1] });
        }
      }


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