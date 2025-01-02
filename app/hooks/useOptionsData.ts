"use client";

import { useState, useEffect } from 'react';
import { fetchOptionsData } from '../services/api';
import { Option } from '../types/option';
import { parseISO, addDays, format } from 'date-fns';

export function useOptionsData(
  symbol: string = '',
  minYield: number = 0,
  maxPrice: number = 1000,
  minVol: number = 0,
  expiration: string = '',
  option: string = 'call'
) {
  const [data, setData] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async (
    searchTerm: string = symbol,
    minYieldVal: number = minYield,
    maxPriceVal: number = maxPrice,
    minVolVal: number = minVol,
    selectedExpiration: string = expiration,
    pageNo: number = 1,
    pageSize: number = 50,
    sortConfig?: { field: string; direction: 'asc' | 'desc' | null }
  ) => {
    setLoading(true);
    try {
      const filters: any = [];
      if(option) {
        filters.push({ operation: 'eq', field: 'type', value: `"${option}"` });
      }
      if (searchTerm) {
        filters.push({ operation: 'like', field: 'symbol', value: searchTerm });
      }
      if (minYieldVal > 0) {
        filters.push({ operation: 'gt', field: 'yieldPercent', value: minYieldVal });
      }
      if (maxPriceVal < 1000) {
        filters.push({ operation: 'lt', field: 'strike', value: maxPriceVal });
      }
      if (minVolVal > 0) {
        filters.push({ operation: 'gt', field: 'volume', value: minVolVal });
      }
      
      if(selectedExpiration === "") {
        filters.push({ operation: 'gt', field: 'expiration', value: `"${format(new Date(), 'yyyy-MM-dd')}"` });
      } else if (selectedExpiration) {            
        filters.push({ operation: 'eq', field: 'expiration', value: `"${selectedExpiration}"` });      
      }

      const result = await fetchOptionsData(filters, pageNo, pageSize, sortConfig);   
      const updatedResult = result.options.map((option: any) => {
        const askPrice = option.askPrice || 0;
        const bidPrice = option.bidPrice || 0;
        const premium = ((askPrice + bidPrice) / 2) * 100;

        const expirationDate = addDays(parseISO(option.expiration), 1);
        const correctedExpiration = format(expirationDate, 'yyyy-MM-dd');
        
        return {
          ...option,
          premium,
          expiration: correctedExpiration,
        };
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