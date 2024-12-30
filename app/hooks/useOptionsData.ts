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
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  useEffect(()=>{    
    setFirstLoad(false)
  },[])

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
      filters.push({ operation: 'eq', field: 'expiration', value: "\""+expiration+"\"" });
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchOptionsData(filters);   
        const updatedResult = result.map((option: any) => {
          const askPrice = option.askPrice || 0;
          const bidPrice = option.bidPrice || 0;
          const expectedPremium = ((askPrice + bidPrice) / 2) * 100;

          // Parse the ISO string and add one day
          const expirationDate = addDays(parseISO(option.expiration), 1);
          // Format back to YYYY-MM-DD
          const correctedExpiration = format(expirationDate, 'yyyy-MM-dd');
          
          return {
            ...option,
            expectedPremium,
            expiration: correctedExpiration,
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

    if(!firstLoad) fetchData();
  }, [symbol, minYield, maxPrice, minVol, expiration, option]);

  return { data, loading, error, firstLoad };
}