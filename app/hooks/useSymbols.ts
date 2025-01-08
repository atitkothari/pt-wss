import { useState, useEffect } from 'react';

export function useSymbols() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await fetch('https://api.wheelstrategyoptions.com/wheelstrat/fetchAllTickers');
        const data = await response.json();
        setSymbols(data.symbols);
      } catch (error) {
        console.error('Failed to fetch symbols:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSymbols();
  }, []);

  return { symbols, loading };
} 