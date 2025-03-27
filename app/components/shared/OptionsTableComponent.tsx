"use client";

import { useEffect, useState, useCallback } from "react";
import { FilterInput } from "../filters/FilterInput";
import { AdvancedFilters } from "../filters/AdvancedFilters";
import { RangeSlider } from "../filters/RangeSlider";
import { SingleValueSlider } from "../filters/SingleValueSlider";
import { MultiStockSelect } from "../filters/MultiStockSelect";
import { useOptionsData } from "../../hooks/useOptionsData";
import { LoadingSpinner } from "../LoadingSpinner";
import { Option, OptionType, StrikeFilter } from "../../types/option";
import { OptionsTable } from "../table/OptionsTable";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Search, Mail, Save, Coffee, RotateCcw, BellRing } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useSymbols } from '../../hooks/useSymbols';
import { SaveQueryModal } from "../modals/SaveQueryModal";
import { BlurredTable } from "../auth/BlurredTable";
import { useAuth } from "@/app/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  yieldFilterConfig,
  priceFilterConfig,
  volumeFilterConfig,
  deltaFilterConfig,
  dteFilterConfig,
  peRatioFilterConfig,
  marketCapFilterConfig,
  moneynessFilterConfig,
  movingAverageCrossoverOptions,
  sectorOptions,
  defaultVisibleColumns as configDefaultVisibleColumns,
  impliedVolatilityFilterConfig
} from "@/app/config/filterConfig";

interface OptionsTableComponentProps {
  option: OptionType;
}

function getNextFriday(date: Date): Date {
  const dayOfWeek = date.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  const nextFriday = new Date(date);
  nextFriday.setDate(date.getDate() + daysUntilFriday);
  return nextFriday;
}

// Using the centralized default visible columns from filterConfig
const DEFAULT_VISIBLE_COLUMNS = configDefaultVisibleColumns;

export function OptionsTableComponent({ option }: OptionsTableComponentProps) {  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { symbols } = useSymbols();

  const getParamKey = (key: string) => `${option}_${key}`;
  
  // Helper function to get value from URL params, localStorage, or default value
  const getInitialValue = <T,>(paramKey: string, localStorageKey: string, defaultValue: T): T => {
    // First priority: URL parameters
    const urlParam = searchParams.get(paramKey);
    if (urlParam !== null) {
      // For arrays, split by comma and convert to numbers if needed
      if (Array.isArray(defaultValue) && typeof defaultValue[0] === 'number') {
        return urlParam.split(',').map(Number) as unknown as T;
      }
      // For single values
      return (typeof defaultValue === 'number' ? Number(urlParam) : urlParam) as unknown as T;
    }
    
    // Second priority: localStorage (only if in browser)
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(localStorageKey);
      if (storedValue !== null) {
        try {
          return JSON.parse(storedValue) as T;
        } catch (e) {
          console.error(`Error parsing localStorage value for ${localStorageKey}:`, e);
        }
      }
    }
    
    // Third priority: default value
    return defaultValue;
  };

  const [searchTerm, setSearchTerm] = useState(() => {
    const paramKey = getParamKey('search');
    const localStorageKey = `${option}_searchTerm`;
    return getInitialValue<string>(paramKey, localStorageKey, "");
  });
  
  const [selectedStocks, setSelectedStocks] = useState<string[]>(() => {
    const paramKey = getParamKey('search');
    const localStorageKey = `${option}_selectedStocks`;
    const searchParam = searchParams.get(paramKey);
    if (searchParam) {
      return searchParam.split(',');
    }
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(localStorageKey);
      if (storedValue) {
        try {
          return JSON.parse(storedValue);
        } catch (e) {
          console.error(`Error parsing localStorage value for ${localStorageKey}:`, e);
        }
      }
    }
    return [];
  });
  
  const [yieldRange, setYieldRange] = useState<[number, number]>(() => {
    const minYieldParam = getParamKey('min_yield');
    const maxYieldParam = getParamKey('max_yield');
    const localStorageKey = `${option}_yieldRange`;
    
    // Check URL params first
    const minFromUrl = searchParams.get(minYieldParam);
    const maxFromUrl = searchParams.get(maxYieldParam);
    if (minFromUrl !== null && maxFromUrl !== null) {
      return [Number(minFromUrl), Number(maxFromUrl)];
    }
    
    // Then check localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(localStorageKey);
      if (storedValue) {
        try {
          return JSON.parse(storedValue) as [number, number];
        } catch (e) {
          console.error(`Error parsing localStorage value for ${localStorageKey}:`, e);
        }
      }
    }
    
    // Default values
    return [yieldFilterConfig.min, yieldFilterConfig.max];
  });
  
  const [minPrice, setMinPrice] = useState(() => {
    const paramKey = getParamKey('minPrice');
    const localStorageKey = `${option}_minPrice`;
    return getInitialValue<number>(paramKey, localStorageKey, priceFilterConfig.defaultMin);
  });
  
  const [maxPrice, setMaxPrice] = useState(() => {
    const paramKey = getParamKey('maxPrice');
    const localStorageKey = `${option}_maxPrice`;
    return getInitialValue<number>(paramKey, localStorageKey, priceFilterConfig.defaultMax);
  });
  
  const [volumeRange, setVolumeRange] = useState<[number, number]>(() => {
    const minVolParam = getParamKey('min_vol');
    const maxVolParam = getParamKey('max_vol');
    const localStorageKey = `${option}_volumeRange`;
    
    // Check URL params first
    const minFromUrl = searchParams.get(minVolParam);
    const maxFromUrl = searchParams.get(maxVolParam);
    if (minFromUrl !== null && maxFromUrl !== null) {
      return [Number(minFromUrl), Number(maxFromUrl)];
    }
    
    // Then check localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(localStorageKey);
      if (storedValue) {
        try {
          return JSON.parse(storedValue) as [number, number];
        } catch (e) {
          console.error(`Error parsing localStorage value for ${localStorageKey}:`, e);
        }
      }
    }
    
    // Default values
    return [volumeFilterConfig.min, volumeFilterConfig.max];
  });
  
  const [deltaFilter, setDeltaFilter] = useState<[number, number]>(() => {
    const minDeltaParam = getParamKey('min_delta');
    const maxDeltaParam = getParamKey('max_delta');
    const localStorageKey = `${option}_deltaFilter`;
    
    // Check URL params first
    const minFromUrl = searchParams.get(minDeltaParam);
    const maxFromUrl = searchParams.get(maxDeltaParam);
    if (minFromUrl !== null && maxFromUrl !== null) {
      return [Number(minFromUrl), Number(maxFromUrl)];
    }
    
    // Then check localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(localStorageKey);
      if (storedValue) {
        try {
          return JSON.parse(storedValue) as [number, number];
        } catch (e) {
          console.error(`Error parsing localStorage value for ${localStorageKey}:`, e);
        }
      }
    }
    
    // Default values
    return [deltaFilterConfig.defaultMin, deltaFilterConfig.defaultMax];
  });
  
  const [minDte, setMinDte] = useState(() => {
    const paramKey = getParamKey('min_dte');
    const localStorageKey = `${option}_minDte`;
    return getInitialValue<number>(paramKey, localStorageKey, dteFilterConfig.defaultMin);
  });
  
  const [maxDte, setMaxDte] = useState(() => {
    const paramKey = getParamKey('max_dte');
    const localStorageKey = `${option}_maxDte`;
    return getInitialValue<number>(paramKey, localStorageKey, dteFilterConfig.defaultMax);
  });
  
  // Advanced filters
  const [impliedVolatility, setImpliedVolatility] = useState<[number, number]>(() => {
    const minIvParam = getParamKey('min_iv');
    const maxIvParam = getParamKey('max_iv');
    const localStorageKey = `${option}_impliedVolatility`;
    
    // Check URL params first
    const minFromUrl = searchParams.get(minIvParam);
    const maxFromUrl = searchParams.get(maxIvParam);
    if (minFromUrl !== null && maxFromUrl !== null) {
      return [Number(minFromUrl), Number(maxFromUrl)];
    }
    
    // Then check localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(localStorageKey);
      if (storedValue) {
        try {
          return JSON.parse(storedValue) as [number, number];
        } catch (e) {
          console.error(`Error parsing localStorage value for ${localStorageKey}:`, e);
        }
      }
    }
    
    // Default values
    return [impliedVolatilityFilterConfig.defaultMin, impliedVolatilityFilterConfig.defaultMax];
  });
  
  const [peRatio, setPeRatio] = useState<[number, number]>(() => {
    const minPeParam = getParamKey('min_pe');
    const maxPeParam = getParamKey('max_pe');
    const localStorageKey = `${option}_peRatio`;
    
    // Check URL params first
    const minFromUrl = searchParams.get(minPeParam);
    const maxFromUrl = searchParams.get(maxPeParam);
    if (minFromUrl !== null && maxFromUrl !== null) {
      return [Number(minFromUrl), Number(maxFromUrl)];
    }
    
    // Then check localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(localStorageKey);
      if (storedValue) {
        try {
          return JSON.parse(storedValue) as [number, number];
        } catch (e) {
          console.error(`Error parsing localStorage value for ${localStorageKey}:`, e);
        }
      }
    }
    
    // Default values
    return [peRatioFilterConfig.defaultMin, peRatioFilterConfig.defaultMax];
  });
  
  const [marketCap, setMarketCap] = useState<[number, number]>(() => {
    const minMarketCapParam = getParamKey('min_market_cap');
    const maxMarketCapParam = getParamKey('max_market_cap');
    const localStorageKey = `${option}_marketCap`;
    
    // Check URL params first
    const minFromUrl = searchParams.get(minMarketCapParam);
    const maxFromUrl = searchParams.get(maxMarketCapParam);
    if (minFromUrl !== null && maxFromUrl !== null) {
      return [Number(minFromUrl), Number(maxFromUrl)];
    }
    
    // Then check localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(localStorageKey);
      if (storedValue) {
        try {
          return JSON.parse(storedValue) as [number, number];
        } catch (e) {
          console.error(`Error parsing localStorage value for ${localStorageKey}:`, e);
        }
      }
    }
    
    // Default values
    return [marketCapFilterConfig.defaultMin, marketCapFilterConfig.defaultMax];
  });
  
  const [movingAverageCrossover, setMovingAverageCrossover] = useState(() => {
    const paramKey = getParamKey('ma_crossover');
    const localStorageKey = `${option}_movingAverageCrossover`;
    return getInitialValue<string>(paramKey, localStorageKey, movingAverageCrossoverOptions[0]);
  });
  
  const [sector, setSector] = useState(() => {
    const paramKey = getParamKey('sector');
    const localStorageKey = `${option}_sector`;
    return getInitialValue<string>(paramKey, localStorageKey, sectorOptions[0]);
  });
  
  const [moneynessRange, setMoneynessRange] = useState<[number, number]>(() => {
    const minMoneynessParam = getParamKey('min_moneyness');
    const maxMoneynessParam = getParamKey('max_moneyness');
    const localStorageKey = `${option}_moneynessRange`;
    
    // Check URL params first
    const minFromUrl = searchParams.get(minMoneynessParam);
    const maxFromUrl = searchParams.get(maxMoneynessParam);
    if (minFromUrl !== null && maxFromUrl !== null) {
      return [Number(minFromUrl), Number(maxFromUrl)];
    }
    
    // Then check localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(localStorageKey);
      if (storedValue) {
        try {
          return JSON.parse(storedValue) as [number, number];
        } catch (e) {
          console.error(`Error parsing localStorage value for ${localStorageKey}:`, e);
        }
      }
    }
    
    // Default values
    return [moneynessFilterConfig.defaultMin, moneynessFilterConfig.defaultMax];
  });
  
  // Save filter values to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_searchTerm`, JSON.stringify(searchTerm));
    }
  }, [searchTerm, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_selectedStocks`, JSON.stringify(selectedStocks));
    }
  }, [selectedStocks, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_yieldRange`, JSON.stringify(yieldRange));
    }
  }, [yieldRange, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_minPrice`, JSON.stringify(minPrice));
    }
  }, [minPrice, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_maxPrice`, JSON.stringify(maxPrice));
    }
  }, [maxPrice, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_volumeRange`, JSON.stringify(volumeRange));
    }
  }, [volumeRange, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_deltaFilter`, JSON.stringify(deltaFilter));
    }
  }, [deltaFilter, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_minDte`, JSON.stringify(minDte));
    }
  }, [minDte, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_maxDte`, JSON.stringify(maxDte));
    }
  }, [maxDte, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_peRatio`, JSON.stringify(peRatio));
    }
  }, [peRatio, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_marketCap`, JSON.stringify(marketCap));
    }
  }, [marketCap, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_movingAverageCrossover`, JSON.stringify(movingAverageCrossover));
    }
  }, [movingAverageCrossover, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_sector`, JSON.stringify(sector));
    }
  }, [sector, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_moneynessRange`, JSON.stringify(moneynessRange));
    }
  }, [moneynessRange, option]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${option}_impliedVolatility`, JSON.stringify(impliedVolatility));
    }
  }, [impliedVolatility, option]);
  
  const [selectedExpiration, setSelectedExpiration] = useState(searchParams.get(getParamKey('expiration')) || "");
  const [minSelectedExpiration, setMinSelectedExpiration] = useState(searchParams.get(getParamKey('min_expiration')) || "");
  const [sortConfig, setSortConfig] = useState<{ field: keyof Option; direction: 'asc' | 'desc' | null }>({ 
    field: "symbol", 
    direction: null 
  });
  
  const [activeFilters, setActiveFilters] = useState({
    searchTerm: "",
    yieldRange: [yieldFilterConfig.min, yieldFilterConfig.max] as [number, number],
    maxPrice: priceFilterConfig.defaultMax,
    minPrice: priceFilterConfig.defaultMin,
    volumeRange: [volumeFilterConfig.min, volumeFilterConfig.max] as [number, number],
    selectedExpiration: "",
    minSelectedExpiration: "",
    pageNo: 1,
    peRatio: [peRatioFilterConfig.defaultMin, peRatioFilterConfig.defaultMax] as [number, number],
    marketCap: [marketCapFilterConfig.defaultMin, marketCapFilterConfig.defaultMax] as [number, number],
    movingAverageCrossover: movingAverageCrossoverOptions[0],
    sector: sectorOptions[0],
    moneynessRange: [moneynessFilterConfig.defaultMin, moneynessFilterConfig.defaultMax] as [number, number],
    impliedVolatility: [impliedVolatilityFilterConfig.defaultMin, impliedVolatilityFilterConfig.defaultMax] as [number, number],
    deltaFilter: [deltaFilterConfig.defaultMin, deltaFilterConfig.defaultMax] as [number, number]
  });

  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [strikeFilter, setStrikeFilter] = useState<StrikeFilter>(
    (searchParams.get(getParamKey('strikeFilter')) as StrikeFilter)
  );
  const rowsPerPage = 50;

  const { data, loading, error, totalCount, fetchData } = useOptionsData(
    activeFilters.searchTerm.split(","),
    activeFilters.yieldRange[0],
    activeFilters.yieldRange[1],
    activeFilters.minPrice,
    activeFilters.maxPrice,
    activeFilters.volumeRange[0],
    activeFilters.volumeRange[1],
    activeFilters.selectedExpiration,
    option,
    deltaFilterConfig.defaultMin,
    deltaFilterConfig.defaultMax,
    activeFilters.minSelectedExpiration
  );

  // Calculate expiration dates based on minDte and maxDte whenever they change
  useEffect(() => {
    const today = new Date();
    
    // Calculate min expiration date based on minDte
    const minDate = addDays(today, minDte);
    const minFormattedDate = format(minDate, 'yyyy-MM-dd');
    setMinSelectedExpiration(minFormattedDate);
    
    // Calculate max expiration date based on maxDte
    const maxDate = addDays(today, maxDte);
    const maxFormattedDate = format(maxDate, 'yyyy-MM-dd');
    setSelectedExpiration(maxFormattedDate);
  }, [minDte, maxDte]);

  const updateURL = (filters: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      const paramKey = getParamKey(key);
      if (value) {
        params.set(paramKey, value.toString());
      } else {
        params.delete(paramKey);
      }
    });
    router.push(`?${params.toString()}`);
  };

  const [isFromCache, setIsFromCache] = useState(false);
  const [filtersChanged, setFiltersChanged] = useState(false);

  const [searchCount, setSearchCount] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('searchCount') || '0');
    }
    return 0;
  });

  const handleSearch = () => {
    setHasSearched(true);
    setIsFromCache(false);
    setFiltersChanged(false); // Reset the filters changed flag when search is performed
    
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem('searchCount', newCount.toString());
    
    // if (newCount >= 3) {
    //   setShowSaveModal(true);
    //   setSearchCount(0)
    // }

    setActiveFilters({
      searchTerm: selectedStocks.join(','),
      yieldRange,
      minPrice,
      maxPrice,
      volumeRange,
      selectedExpiration,
      minSelectedExpiration,
      pageNo: 1,
      peRatio,
      marketCap,
      movingAverageCrossover,
      sector,
      moneynessRange,
      impliedVolatility,
      deltaFilter
    });

    updateURL({
      search: selectedStocks.join(','),
      min_yield: yieldRange[0],
      max_yield: yieldRange[1],
      maxPrice,
      min_vol: volumeRange[0],
      max_vol: volumeRange[1],
      expiration: selectedExpiration,
      min_expiration: minSelectedExpiration,
      min_dte: minDte,
      max_dte: maxDte,
      min_moneyness: moneynessRange[0],
      max_moneyness: moneynessRange[1],
      min_delta: deltaFilter[0],
      max_delta: deltaFilter[1],
      min_pe: peRatio[0],
      max_pe: peRatio[1],
      min_market_cap: marketCap[0],
      max_market_cap: marketCap[1],
      min_iv: impliedVolatility[0],
      max_iv: impliedVolatility[1],
      ma_crossover: movingAverageCrossover,
      sector: sector
    });

    fetchData(
      selectedStocks, 
      yieldRange[0], 
      yieldRange[1],
      minPrice, 
      maxPrice, 
      volumeRange[0],
      volumeRange[1], 
      selectedExpiration,
      1,
      rowsPerPage,
      sortConfig.direction ? sortConfig : undefined,
      undefined,
      deltaFilter,
      peRatio,
      marketCap,
      movingAverageCrossover,
      sector,
      moneynessRange,
      impliedVolatility,
      minSelectedExpiration
    ).catch(console.error);
    setCurrentPage(1);
  };

  useEffect(() => {
    // Auto fetch data on initial load regardless of URL parameters
    if (!isFromCache) {
      // Set isFromCache first to prevent multiple API calls
      setIsFromCache(true);
      // Use a small timeout to prevent immediate API call on page load
      const timer = setTimeout(() => {
        // If URL has parameters, use those for search
        if (Array.from(searchParams.entries()).length > 0) {
          handleSearch();
        } else {
          // Otherwise, fetch with default values
          fetchData(
            selectedStocks, 
            yieldRange[0], 
            yieldRange[1],
            minPrice, 
            maxPrice, 
            volumeRange[0],
            volumeRange[1], 
            selectedExpiration,
            1,
            rowsPerPage,
            sortConfig.direction ? sortConfig : undefined,
            undefined,
            deltaFilter,
            peRatio,
            marketCap,
            movingAverageCrossover,
            sector,
            moneynessRange,
            impliedVolatility,
            minSelectedExpiration
          ).catch(console.error);
          setHasSearched(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Track filter changes
  useEffect(() => {
    // console.log(hasSearched)
    // Only track changes after initial load and if we've already searched once
    // if (isFromCache && hasSearched) {
      // Compare current filter values with the last search values
      const hasChanged = 
        selectedStocks.join(',') !== activeFilters.searchTerm ||
        yieldRange[0] !== activeFilters.yieldRange[0] ||
        yieldRange[1] !== activeFilters.yieldRange[1] ||
        minPrice !== activeFilters.minPrice ||
        maxPrice !== activeFilters.maxPrice ||
        volumeRange[0] !== activeFilters.volumeRange[0] ||
        volumeRange[1] !== activeFilters.volumeRange[1] ||
        selectedExpiration !== activeFilters.selectedExpiration ||
        deltaFilter[0] !== activeFilters.deltaFilter[0] ||
        deltaFilter[1] !== activeFilters.deltaFilter[1] ||
        peRatio[0] !== activeFilters.peRatio[0] ||
        peRatio[1] !== activeFilters.peRatio[1] ||
        marketCap[0] !== activeFilters.marketCap[0] ||
        marketCap[1] !== activeFilters.marketCap[1] ||
        movingAverageCrossover !== activeFilters.movingAverageCrossover ||
        sector !== activeFilters.sector ||
        impliedVolatility[0] !== activeFilters.impliedVolatility[0] ||
        impliedVolatility[1] !== activeFilters.impliedVolatility[1] || 
        moneynessRange[0] !== activeFilters.moneynessRange[0] ||
        moneynessRange[1] !== activeFilters.moneynessRange[1];
      
      setFiltersChanged(hasChanged);
    // }
  }, [
    selectedStocks, 
    yieldRange, 
    minPrice,
    maxPrice, 
    volumeRange, 
    selectedExpiration, 
    deltaFilter,
    peRatio,
    marketCap,
    movingAverageCrossover,
    sector,
    moneynessRange,
    impliedVolatility,
    hasSearched,
    isFromCache,
    activeFilters // We still need this to compare against the last search values
  ]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


  const [showSaveModal, setShowSaveModal] = useState(false);

  const getCurrentQuery = () => ({
    searchTerm,
    yieldRange,
    maxPrice,
    minPrice,
    volumeRange,
    selectedExpiration,
    moneynessRange,
    deltaFilter,
    peRatio,
    marketCap,
    movingAverageCrossover,
    sector,
    option,
    strikePrice: [minPrice, maxPrice],
    impliedVolatility,
  });

  const [dte, setDte] = useState(Number(searchParams.get(getParamKey('dte'))) || 30);

  useEffect(() => {
    const today = new Date();
    const futureDate = addDays(today, dte);
    const formattedDate = format(futureDate, 'yyyy-MM-dd');
    setSelectedExpiration(formattedDate);
  }, [dte]);

  const getOldestUpdateDate = () => {
    if (!data || data.length === 0) return null;
    
    const dates = data.map(item => new Date(item.lastUpdatedDate));
    const oldestDate = new Date(Math.min(...dates.map(date => date.getTime())));
    
    return oldestDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',      
      timeZoneName: 'short'
    });
  };

  // Get current sort parameters from URL
  const sortColumn = searchParams.get('sortBy') || '';
  const sortDirection = searchParams.get('sortDir') || 'asc';

  // Handle sort change
  const handleSortURL = useCallback((columnId: string) => {     
    const params = new URLSearchParams(searchParams.toString());    
    
    let newSortDir: 'asc' | 'desc';
    if (sortColumn === columnId) {
      // Toggle direction if clicking same column
      newSortDir = sortDirection === 'asc' ? 'desc' : 'asc';      
    } else {
      // Set new column and default to ascending
      newSortDir = 'asc';      
    }
    
    params.set('sortBy', columnId);
    params.set('sortDir', newSortDir);
    router.push(`?${params.toString()}`);


    // Fetch new data with updated sort configuration
    fetchData(
      activeFilters.searchTerm.split(","),
      activeFilters.yieldRange[0],
      activeFilters.yieldRange[1],
      activeFilters.minPrice,
      activeFilters.maxPrice,
      activeFilters.volumeRange[0],
      activeFilters.volumeRange[1],
      activeFilters.selectedExpiration,
      currentPage,
      rowsPerPage,
      { field: columnId as keyof Option, direction: newSortDir },
      strikeFilter !== 'ALL' ? strikeFilter : undefined,
      deltaFilter,
      activeFilters.peRatio,
      activeFilters.marketCap,
      activeFilters.movingAverageCrossover,
      activeFilters.sector,      
      activeFilters.moneynessRange,
      activeFilters.impliedVolatility,
    ).catch(console.error);
  }, [sortColumn, sortDirection, router, searchParams, activeFilters, currentPage, rowsPerPage, strikeFilter, deltaFilter, fetchData]);  

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const { user, userId } = useAuth();

  const handleReset = () => {
    // Reset all filter states to their default values
    setSelectedStocks([]);
    setSearchTerm("");
    setYieldRange([yieldFilterConfig.min, yieldFilterConfig.max]);
    setMinPrice(priceFilterConfig.defaultMin);
    setMaxPrice(priceFilterConfig.defaultMax);
    setVolumeRange([volumeFilterConfig.min, volumeFilterConfig.max]);
    setDeltaFilter([deltaFilterConfig.defaultMin, deltaFilterConfig.defaultMax]);
    setMinDte(dteFilterConfig.defaultMin);
    setMaxDte(dteFilterConfig.defaultMax);
    setImpliedVolatility([impliedVolatilityFilterConfig.defaultMin, impliedVolatilityFilterConfig.defaultMax]);
    setPeRatio([peRatioFilterConfig.defaultMin, peRatioFilterConfig.defaultMax]);
    setMarketCap([marketCapFilterConfig.defaultMin, marketCapFilterConfig.defaultMax]);
    setMovingAverageCrossover(movingAverageCrossoverOptions[0]);
    setSector(sectorOptions[0]);
    setMoneynessRange([moneynessFilterConfig.defaultMin, moneynessFilterConfig.defaultMax]);
    
    // Reset active filters
    setActiveFilters({
      searchTerm: "",
      yieldRange: [yieldFilterConfig.min, yieldFilterConfig.max] as [number, number],
      maxPrice: priceFilterConfig.defaultMax,
      minPrice: priceFilterConfig.defaultMin,
      volumeRange: [volumeFilterConfig.min, volumeFilterConfig.max] as [number, number],
      selectedExpiration: "",
      minSelectedExpiration: "",
      pageNo: 1,
      peRatio: [peRatioFilterConfig.defaultMin, peRatioFilterConfig.defaultMax] as [number, number],
      marketCap: [marketCapFilterConfig.defaultMin, marketCapFilterConfig.defaultMax] as [number, number],
      movingAverageCrossover: movingAverageCrossoverOptions[0],
      sector: sectorOptions[0],
      moneynessRange: [moneynessFilterConfig.defaultMin, moneynessFilterConfig.defaultMax] as [number, number],
      impliedVolatility: [impliedVolatilityFilterConfig.defaultMin, impliedVolatilityFilterConfig.defaultMax] as [number, number],
      deltaFilter: [deltaFilterConfig.defaultMin, deltaFilterConfig.defaultMax] as [number, number]
    });
    
    // Reset URL parameters
    const params = new URLSearchParams();
    router.push(`?${params.toString()}`);
    
    setCurrentPage(1);
  };

  return (
    <div className="w-full">      
      {/* Filter Controls */}
      <div className="space-y-2 mb-2">
        {/* All Rows - 2 columns on mobile, 4 on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <MultiStockSelect
            id="input_screener_symbol"
            label="Search Symbol"
            selectedStocks={selectedStocks}
            onChange={(stocks) => {
              setSelectedStocks(stocks);
              if (stocks.length === 1) {
                setSearchTerm(stocks[0]);
              } else {
                setSearchTerm(stocks.join(','));
              }
            }}
            placeholder="Enter symbols..."
            onKeyPress={handleKeyPress}
            suggestions={symbols}
            showSuggestions={true}
            tooltip="Enter stock symbols (e.g., AAPL, MSFT) to filter options"
          />
          <RangeSlider
            id="input_screener_yield_range"
            label="Premium Yield %"
            minValue={yieldRange[0]}
            maxValue={yieldRange[1]}
            value={yieldRange}
            onChange={(value) => {
              setYieldRange(value);
            }}
            min={yieldFilterConfig.min}
            max={yieldFilterConfig.max}
            step={yieldFilterConfig.step}
            tooltip={yieldFilterConfig.tooltip}
            formatValue={(val) => `${val}%`}
          />
        </div>
        
        {/* Advanced Filters */}
        <div className="mt-4">
          <AdvancedFilters
            peRatio={peRatio}
            onPeRatioChange={setPeRatio}
            marketCap={marketCap}
            onMarketCapChange={setMarketCap}
            movingAverageCrossover={movingAverageCrossover}
            onMovingAverageCrossoverChange={setMovingAverageCrossover}
            sector={sector}
            onSectorChange={setSector}
            deltaFilter={deltaFilter}
            onDeltaFilterChange={setDeltaFilter}
            volumeRange={volumeRange}
            onVolumeRangeChange={setVolumeRange}
            handleKeyPress={handleKeyPress}
            strikePrice={[minPrice, maxPrice]}
            onStrikePriceChange={(value) => {
              setMinPrice(value[0]);
              setMaxPrice(value[1]);
            }}
            impliedVolatility={impliedVolatility}
            onImpliedVolatilityChange={setImpliedVolatility}
            moneynessRange={moneynessRange}
            onMoneynessRangeChange={setMoneynessRange}
            minDte={minDte}
            maxDte={maxDte}
            onDteChange={(value) => {
              setMinDte(value[0]);
              setMaxDte(value[1]);
            }}
            autoSearch={false}
            onSearch={handleSearch}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-1">
          <Button
            id="btn_screener_reset"
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
          <div className="grid grid-cols-[35%_65%] sm:flex sm:gap-1 w-full sm:w-auto">
            <Button
              id="btn_screener_save"
              variant="outline"
              onClick={() => setShowSaveModal(true)}
              className="bg-orange-600 text-white hover:text-black"
            >
              <BellRing className="h-4 w-4 mr-2" />
              Get Alerts
            </Button>
            <Button 
              id="btn_screener_search"
              onClick={handleSearch}
              className={`${filtersChanged ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
            >
              <Search className="h-4 w-4 mr-2" />
              {filtersChanged ? 'Search (Updated Filters)' : 'Search'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {!hasSearched && !activeFilters.searchTerm && 
       activeFilters.yieldRange[0] === yieldFilterConfig.min && 
       activeFilters.yieldRange[1] === yieldFilterConfig.max && 
       activeFilters.maxPrice === 1000 && 
       activeFilters.volumeRange[0] === volumeFilterConfig.min && 
       activeFilters.volumeRange[1] === volumeFilterConfig.max && 
       !activeFilters.selectedExpiration && 
       strikeFilter === 'ONE_OUT' ? (
        <div className="text-center py-8 text-gray-600">
          Run a search to view results
        </div>
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <div>          
          <BlurredTable hasSearched={hasSearched && !user}>
            <OptionsTable 
              data={data}              
              onSort={handleSortURL}
            />
          </BlurredTable>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-0.5 md:mt-1 px-0.5 md:px-1 text-xs">
            <div className="text-gray-600">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount} results
            </div>
            <div className="flex gap-1">
              <Button 
                onClick={() => {
                  const prevPage = Math.max(1, currentPage - 1);
                  setCurrentPage(prevPage);
                  setActiveFilters(prev => ({ ...prev, pageNo: prevPage }));
                  fetchData(
                    activeFilters.searchTerm.split(","),
                    activeFilters.yieldRange[0],
                    activeFilters.yieldRange[1],
                    activeFilters.minPrice,
                    activeFilters.maxPrice,
                    activeFilters.volumeRange[0],
                    activeFilters.volumeRange[1],
                    activeFilters.selectedExpiration,
                    prevPage,
                    rowsPerPage,
                    sortConfig.direction ? sortConfig : undefined,
                    strikeFilter !== 'ALL' ? strikeFilter : undefined,
                    deltaFilter,
                    activeFilters.peRatio,
                    activeFilters.marketCap,
                    activeFilters.movingAverageCrossover,
                    activeFilters.sector,
                    activeFilters.moneynessRange,
                    activeFilters.impliedVolatility,
                    activeFilters.minSelectedExpiration                    
                  ).catch(console.error); 
                }}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="px-1.5 py-0.5 text-xs"
              >
                Previous
              </Button>
              <Button
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  setActiveFilters(prev => ({ ...prev, pageNo: nextPage }));
                  fetchData(
                    activeFilters.searchTerm.split(","),
                    activeFilters.yieldRange[0],
                    activeFilters.yieldRange[1],
                    activeFilters.minPrice,
                    activeFilters.maxPrice,
                    activeFilters.volumeRange[0],
                    activeFilters.volumeRange[1],
                    activeFilters.selectedExpiration,
                    nextPage,
                    rowsPerPage,
                    sortConfig.direction ? sortConfig : undefined,
                    strikeFilter !== 'ALL' ? strikeFilter : undefined,
                    deltaFilter,
                    activeFilters.peRatio,
                    activeFilters.marketCap,
                    activeFilters.movingAverageCrossover,
                    activeFilters.sector,
                    activeFilters.moneynessRange,
                    activeFilters.impliedVolatility,
                    activeFilters.minSelectedExpiration    
                  ).catch(console.error);
                }}
                disabled={currentPage * rowsPerPage >= totalCount}
                variant="outline"
                size="sm"
                className="px-1.5 py-0.5 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
          
          {/* Add footnote */}
          <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <div className="text-xs text-gray-500 mt-2">
        {loading ? (
          <span>Loading update information...</span>
        ) : (
          <span>* Data last updated on {getOldestUpdateDate()}</span>
        )}
      </div>
            <Button
              id="btn_buy_coffee_bottom"
              variant="outline"
              size="sm"
              onClick={() => window.open('https://buymeacoffee.com/wheelstrategyoptions', '_blank')}
              className="text-gray-500 hover:text-gray-700"
            >
              Support
            </Button>
          </div>
        </div>
      )}
      <SaveQueryModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        currentQuery={getCurrentQuery()}
      />
    </div>
  );
}