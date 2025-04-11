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
import { DEFAULT_COLUMNS, OptionsTable } from "../table/OptionsTable";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Search, Mail, Save, Coffee, RotateCcw, BellRing, FolderOpen } from "lucide-react";
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
import { SaveScreenerModal } from "../modals/SaveScreenerModal";
import { LoadScreenerModal } from "../modals/LoadScreenerModal";
import { LoginPromptModal } from "../modals/LoginPromptModal";
import { SavedScreener, EmailFrequency } from "@/app/types/screener";
import { defaultScreeners } from '@/app/config/defaultScreeners';
import { ColumnCustomizer } from "../table/ColumnCustomizer";
import { screenerService } from "@/app/services/screenerService";

interface Filter {
  field: string;
  operation: string;
  value: string | number;
}

interface SaveFilterPayload {
  user_id: string;
  email_id: string;
  frequency: EmailFrequency;
  filter_name: string;
  filters: Filter[];
  is_alerting: boolean;
}

interface OptionsTableComponentProps {
  option: OptionType;
}


function convertUtcToEst(utcDate: string): Date {
  // Parse the UTC date string into a Date object
  const utcDateObj = new Date(utcDate);

  // Get the UTC offset for Eastern Time Zone (Daylight Saving Time: UTC-4)
  const estOffset = -4 * 60 * 60 * 1000; // Offset in milliseconds (-4 hours)

  // Adjust the UTC date by adding the offset (in milliseconds)
  const estDateObj = new Date(utcDateObj.getTime() + estOffset);

  // Return the adjusted Date object
  return estDateObj;
}

// Using the centralized default visible columns from filterConfig
const DEFAULT_VISIBLE_COLUMNS = configDefaultVisibleColumns;

export function OptionsTableComponent({ option }: OptionsTableComponentProps) {  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { symbols } = useSymbols();
  const { user, userId } = useAuth();
  const [savedScreeners, setSavedScreeners] = useState<SavedScreener[]>([]);

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
  
  const [selectedExpiration, setSelectedExpiration] = useState(searchParams.get(getParamKey('max_expiration')) || "");
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
    activeFilters.minSelectedExpiration,
    option === 'call' ? 'covered_call_screener' : 'cash_secured_put_screener'
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

  // Track filter changes
  useEffect(() => {
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
      sector !== activeFilters.sector ||
      impliedVolatility[0] !== activeFilters.impliedVolatility[0] ||
      impliedVolatility[1] !== activeFilters.impliedVolatility[1] || 
      moneynessRange[0] !== activeFilters.moneynessRange[0] ||
      moneynessRange[1] !== activeFilters.moneynessRange[1];
    
    if (hasChanged) {
      setFiltersChanged(true);
    }
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
    activeFilters
  ]);

  const handleSearch = () => {
    setHasSearched(true);
    setIsFromCache(false);
    setFiltersChanged(false); // Reset the filters changed flag when search is performed
    
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem('searchCount', newCount.toString());

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
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    // Try to get saved columns from localStorage
    if (typeof window !== 'undefined') {
      const savedColumns = localStorage.getItem('visibleColumns');
      if (savedColumns) {
        try {
          return JSON.parse(savedColumns);
        } catch (e) {
          console.error('Error parsing localStorage value for visibleColumns:', e);
        }
      }
    }
    // Fall back to default visible columns from config
    return configDefaultVisibleColumns;
  });

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(current => {
      let newColumns;
      if (current.includes(columnKey)) {
        if (current.length === 1) return current;
        newColumns = current.filter(key => key !== columnKey);
      } else {
        newColumns = [...current, columnKey].sort(
          (a, b) => 
            DEFAULT_COLUMNS.findIndex(col => col.key === a) - 
            DEFAULT_COLUMNS.findIndex(col => col.key === b)
        );
      }
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('visibleColumns', JSON.stringify(newColumns));
      }
      
      return newColumns;
    });
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
    
    const dates = data.map(item => convertUtcToEst(item.lastUpdatedDate));
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
      activeFilters.sector,      
      activeFilters.moneynessRange,
      activeFilters.impliedVolatility,
    ).catch(console.error);
  }, [sortColumn, sortDirection, router, searchParams, activeFilters, currentPage, rowsPerPage, strikeFilter, deltaFilter, fetchData]);  

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

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const handleSaveScreener = async (screener: SavedScreener) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Convert SavedScreener to SaveFilterPayload
      const payload = {
        user_id: userId || '',
        email_id: screener.emailNotifications?.email || '',
        frequency: screener.emailNotifications?.frequency??'daily' as const,
        filter_name: screener.name,
        filters: JSON.stringify(screener.filters),
        is_alerting: screener.emailNotifications?.enabled??false
      };

      // Save to backend
      await screenerService.saveFilter(payload);
      
      // Fetch updated list of screeners
      const fetchScreener = await screenerService.fetchFilter({user_id: userId||''});
      
      // Convert API response to SavedScreener format
      const convertedScreeners = fetchScreener.map((screener: any) => {
        const parsedFilters = JSON.parse(screener.filter);
        return {
          id: screener.id.toString(),
          name: screener.filter_name,
          filters: {
            ...parsedFilters,
            optionType: parsedFilters.optionType || 'call' // Default to call if not specified
          },
          createdAt: screener.created_date,
          updatedAt: screener.last_updated_date,
          emailNotifications: screener.is_alerting ? {
            enabled: true,
            email: user?.email ?? '',
            frequency: screener.frequency || 'daily' as EmailFrequency
          } : undefined
        };
      });

      // Update local state with the fresh data
      setSavedScreeners(convertedScreeners);

      // Close the modal
      setIsSaveModalOpen(false);
    } catch (e) {
      console.error('Error saving screener:', e);
    }
  };

  const handleLoadScreener = (screener: SavedScreener) => {
    // Update filters based on the loaded screener
    setActiveFilters({
      searchTerm: screener.filters.searchTerm || '',
      yieldRange: screener.filters.yieldRange || [yieldFilterConfig.min, yieldFilterConfig.max],
      maxPrice: screener.filters.maxPrice || priceFilterConfig.defaultMax,
      minPrice: screener.filters.minPrice || priceFilterConfig.defaultMin,
      volumeRange: screener.filters.volumeRange || [volumeFilterConfig.min, volumeFilterConfig.max],
      selectedExpiration: "",
      minSelectedExpiration: "",
      pageNo: 1,
      peRatio: screener.filters.peRatio || [peRatioFilterConfig.defaultMin, peRatioFilterConfig.defaultMax],
      marketCap: screener.filters.marketCap || [marketCapFilterConfig.defaultMin, marketCapFilterConfig.defaultMax],
      sector: Array.isArray(screener.filters.sector) ? screener.filters.sector[0] : (screener.filters.sector || sectorOptions[0]),
      moneynessRange: screener.filters.moneynessRange || [moneynessFilterConfig.defaultMin, moneynessFilterConfig.defaultMax],
      impliedVolatility: screener.filters.impliedVolatility || [impliedVolatilityFilterConfig.defaultMin, impliedVolatilityFilterConfig.defaultMax],
      deltaFilter: screener.filters.deltaFilter || [deltaFilterConfig.defaultMin, deltaFilterConfig.defaultMax]
    });

    // Update individual states
    setSearchTerm(screener.filters.searchTerm || '');
    setSelectedStocks(screener.filters.selectedStocks || []);
    setYieldRange(screener.filters.yieldRange || [yieldFilterConfig.min, yieldFilterConfig.max]);
    setMinPrice(screener.filters.minPrice || priceFilterConfig.defaultMin);
    setMaxPrice(screener.filters.maxPrice || priceFilterConfig.defaultMax);
    setVolumeRange(screener.filters.volumeRange || [volumeFilterConfig.min, volumeFilterConfig.max]);
    setDeltaFilter(screener.filters.deltaFilter || [deltaFilterConfig.defaultMin, deltaFilterConfig.defaultMax]);
    setMinDte(screener.filters.minDte || dteFilterConfig.defaultMin);
    setMaxDte(screener.filters.maxDte || dteFilterConfig.defaultMax);
    setImpliedVolatility(screener.filters.impliedVolatility || [impliedVolatilityFilterConfig.defaultMin, impliedVolatilityFilterConfig.defaultMax]);
    setPeRatio(screener.filters.peRatio || [peRatioFilterConfig.defaultMin, peRatioFilterConfig.defaultMax]);
    setMarketCap(screener.filters.marketCap || [marketCapFilterConfig.defaultMin, marketCapFilterConfig.defaultMax]);
    setMoneynessRange(screener.filters.moneynessRange || [moneynessFilterConfig.defaultMin, moneynessFilterConfig.defaultMax]);
    setSector(Array.isArray(screener.filters.sector) ? screener.filters.sector[0] : (screener.filters.sector || sectorOptions[0]));
  };

  // Update the Save Screener button click handlers
  const handleSaveScreenerClick = () => {
    if (!user) {
      setIsLoginPromptOpen(true);
      return;
    }
    setIsSaveModalOpen(true);
  };

  // Move error check here, after all hooks are declared
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const [showColumnSelector, setShowColumnSelector] = useState(false);

  useEffect(() => {
    const loadSavedScreeners = async () => {
      if (!userId) return;
      
      try {
        const fetchScreener = await screenerService.fetchFilter({user_id: userId});
        
        // Convert API response to SavedScreener format
        const convertedScreeners = fetchScreener.map((screener: any) => {
          const parsedFilters = JSON.parse(screener.filter);
          return {
            id: screener.id.toString(),
            name: screener.filter_name,
            filters: {
              ...parsedFilters,
              optionType: parsedFilters.optionType || 'call' // Default to call if not specified
            },
            createdAt: screener.created_date,
            updatedAt: screener.last_updated_date,
            emailNotifications: screener.is_alerting ? {
              enabled: true,
              email: user?.email ?? '',
              frequency: 'daily' as EmailFrequency
            } : undefined
          };
        });

        setSavedScreeners(convertedScreeners);
      } catch (e) {
        console.error('Error loading saved screeners:', e);
        setSavedScreeners([]);
      }
    };

    loadSavedScreeners();
  }, [userId, user?.email]);

  return (
    <div className="w-full">      
      {/* Filter Controls */}
      <div className="space-y-2 mb-2">
        {/* Screener Dropdown */}
        <div className="mb-4">
          <Select
            onValueChange={(value) => {
              if (value === "manage") {
                window.location.href = '/saved-screeners';
                return;
              }
              if (value === "default") return;
              const allScreeners = [...defaultScreeners, ...savedScreeners];
              const selectedScreener = allScreeners.find((s: SavedScreener) => s.id === value);
              if (selectedScreener) {
                handleLoadScreener(selectedScreener);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a saved screener" />
            </SelectTrigger>
            <SelectContent>
              {/* Predefined Screeners Section */}
              <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                Predefined Screeners
              </div>
              {(() => {
                if (typeof window === 'undefined') return null;
                const predefinedScreeners = defaultScreeners.filter((s: SavedScreener) => s.filters.optionType === option);
                return predefinedScreeners.map((screener: SavedScreener) => (
                  <SelectItem key={screener.id} value={screener.id}>
                    {screener.name}
                  </SelectItem>
                ));
              })()}

              {/* Custom Screeners Section - Only show if user is logged in */}
              {user && (() => {
                if (typeof window === 'undefined') return null;
                const customScreeners = savedScreeners.filter((s: SavedScreener) => s.filters.optionType === option);
                if (customScreeners.length === 0) return null;
                return (
                  <>
                    <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                      Custom Screeners
                    </div>
                    {customScreeners.map((screener: SavedScreener) => (
                      <SelectItem key={screener.id} value={screener.id}>
                        {screener.name}
                      </SelectItem>
                    ))}
                  </>
                );
              })()}

              {/* Manage Saved Screeners Option - Only show if user is logged in */}
              {user && (
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 border-t">
                  <SelectItem 
                    value="manage" 
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Manage Saved Screeners
                  </SelectItem>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* All Rows - 2 columns on mobile, 4 on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
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
            </div>
          </div>
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
            onStrikePriceChange={([min, max]) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            impliedVolatility={impliedVolatility}
            onImpliedVolatilityChange={setImpliedVolatility}
            moneynessRange={moneynessRange}
            onMoneynessRangeChange={setMoneynessRange}
            minDte={minDte}
            maxDte={maxDte}
            onDteChange={([min, max]) => {
              setMinDte(min);
              setMaxDte(max);
            }}
            yieldRange={yieldRange}
            onYieldRangeChange={setYieldRange}
            autoSearch={false}
            onSearch={handleSearch}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {/* Desktop buttons */}
          <div className="hidden md:flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSaveScreenerClick}
                className="flex items-center gap-2 relative"
              >
                <Save className="h-4 w-4" />
                <span>Save Screener</span>
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  New
                </span>
              </Button>
              <Button
                onClick={handleSearch}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </Button>
              <ColumnCustomizer
                columns={DEFAULT_COLUMNS}
                visibleColumns={visibleColumns}
                onColumnToggle={handleColumnToggle}
              />
            </div>
          </div>
          
          {/* Mobile buttons */}
          <div className="md:hidden flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </Button>
            <ColumnCustomizer
              columns={DEFAULT_COLUMNS}
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
            />
          </div>
        </div>
      </div>

      {/* Results Section - Fixed height container */}
      <div className="relative flex-1 min-h-[400px] bg-white rounded-lg shadow-sm overflow-hidden">
        {!hasSearched && !activeFilters.searchTerm && 
         activeFilters.yieldRange[0] === yieldFilterConfig.min && 
         activeFilters.yieldRange[1] === yieldFilterConfig.max && 
         activeFilters.maxPrice === 1000 && 
         activeFilters.volumeRange[0] === volumeFilterConfig.min && 
         activeFilters.volumeRange[1] === volumeFilterConfig.max && 
         !activeFilters.selectedExpiration && 
         strikeFilter === 'ONE_OUT' ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
            Run a search to view results
          </div>
        ) : filtersChanged ? (
          <div className="absolute inset-0 flex justify-center text-gray-600">
            Filters have been updated. Click the Search button to view updated results.
          </div>
        ) : loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="h-full flex flex-col">          
            <div className="flex-grow">
              <BlurredTable hasSearched={hasSearched && !user}>
                <OptionsTable 
                  data={data}              
                  onSort={handleSortURL}
                  visibleColumns={visibleColumns}
                />
              </BlurredTable>
            </div>
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
      </div>

      {/* Mobile Sticky Save and Search buttons */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleSaveScreenerClick}
            className="flex items-center gap-2 relative"
          >
            <Save className="h-4 w-4" />
            <span>Save Screener</span>
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              New
            </span>
          </Button>
          <Button
            onClick={handleSearch}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Add padding to the bottom to account for the sticky button on mobile only */}
      <div className="h-20 md:h-0" />

      {/* Save Screener Modal */}
      {isSaveModalOpen && (
        <SaveScreenerModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSaveScreener}
          optionType={option}
          filters={{
            searchTerm,
            selectedStocks,
            yieldRange,
            minPrice,
            maxPrice,
            volumeRange,
            deltaFilter,
            minDte,
            maxDte,
            impliedVolatility,
            peRatio,
            marketCap,
            movingAverageCrossover,
            sector,
            moneynessRange
          }}
        />
      )}
      <SaveQueryModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        currentQuery={getCurrentQuery()}
      />
      <LoadScreenerModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoad={handleLoadScreener}
        optionType={option}
      />
      <LoginPromptModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
      />
    </div>
  );
}