"use client";

import { useState, useEffect } from 'react';
import { fetchOptionsData } from '../services/api';
import { Option } from '../types/option';

export function useOptionsData(
  symbol: string = '',
  minYield: number = 0,
  maxPrice: number = 1000,
  minVol: number = 0,
  expiration: string = '',
  option: string = 'call'
) {
  const [data, setData] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const filters:any = [];
    if(option){
      filters.push({ operation: 'eq', field: 'type', value: "\""+option+"\"" });
    }
    if (symbol) {
      filters.push({ operation: 'like', field: 'symbol', value: symbol });
    }
    if (minYield > 0) {
      filters.push({ operation: 'gt', field: 'yieldPercent', value: minYield });
    }
    if (maxPrice < 1000) {
      filters.push({ operation: 'lt', field: 'strike', value: maxPrice });
    }
    if (minVol > 0) {
      filters.push({ operation: 'gt', field: 'volume', value: minVol });
    }
    if (expiration) {
      filters.push({ operation: 'eq', field: 'expiration', value: expiration });
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchOptionsData(filters);   
        // Add `expectedPremium` to each object in the result
        const updatedResult = result.map((option: any) => {
        const askPrice = option.askPrice || 0; // Default to 0 if askPrice is missing
        const bidPrice = option.bidPrice || 0; // Default to 0 if bidPrice is missing

        // Calculate the average of askPrice and bidPrice, then multiply by 100
        const expectedPremium = ((askPrice + bidPrice) / 2) * 100;

        // Add the expectedPremium field to the option object
        return {
          ...option,
          expectedPremium,
        };
      });
     
        setData(updatedResult);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, minYield, maxPrice, minVol, expiration]);

  return { data, loading, error };
}