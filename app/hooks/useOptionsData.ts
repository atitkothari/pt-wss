"use client";

import { useState, useEffect } from 'react';
import { fetchOptionsData } from '../services/api';
import { Option } from '../types/option';

export function useOptionsData(
  symbol: string = '',
  minYield: number = 0,
  maxPrice: number = 1000,
  minBid: number = 0,
  expiration: string = ''
) {
  const [data, setData] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const filters = [];

    if (symbol) {
      filters.push({ operation: '=', field: 'symbol', value: symbol });
    }
    if (minYield > 0) {
      filters.push({ operation: 'gt', field: 'yieldPercent', value: minYield });
    }
    if (maxPrice < 1000) {
      filters.push({ operation: 'lt', field: 'stockPrice', value: maxPrice });
    }
    if (minBid > 0) {
      filters.push({ operation: 'gt', field: 'bidPrice', value: minBid });
    }
    if (expiration) {
      filters.push({ operation: '=', field: 'expiration', value: expiration });
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchOptionsData(filters);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, minYield, maxPrice, minBid, expiration]);

  return { data, loading, error };
}