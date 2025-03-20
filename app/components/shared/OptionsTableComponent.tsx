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
import { Search, Mail, Save, Coffee } from "lucide-react";
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
  defaultVisibleColumns as configDefaultVisibleColumns
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
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get(getParamKey('search')) || "");
  const [selectedStocks, setSelectedStocks] = useState<string[]>(() => {
    const searchParam = searchParams.get(getParamKey('search'));
    return searchParam ? searchParam.split(',') : [];
  });
  const [yieldRange, setYieldRange] = useState<[number, number]>([Number(searchParams.get(getParamKey('min_yield'))) || yieldFilterConfig.min, Number(searchParams.get(getParamKey('max_yield'))) || yieldFilterConfig.max]);
  const [minPrice, setMinPrice] = useState(Number(searchParams.get(getParamKey('minPrice'))) || priceFilterConfig.defaultMin);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get(getParamKey('maxPrice'))) || priceFilterConfig.defaultMax);
  const [volumeRange, setVolumeRange] = useState<[number, number]>([Number(searchParams.get(getParamKey('min_vol'))) || volumeFilterConfig.min, Number(searchParams.get(getParamKey('max_vol'))) || volumeFilterConfig.max]);
  const [deltaFilter, setDeltaFilter] = useState<[number, number]>([Number(searchParams.get(getParamKey('min_delta'))) || deltaFilterConfig.defaultMin, Number(searchParams.get(getParamKey('max_delta'))) || deltaFilterConfig.defaultMax]);
  const [minDte, setMinDte] = useState(Number(searchParams.get(getParamKey('min_dte'))) || dteFilterConfig.defaultMin);
  const [maxDte, setMaxDte] = useState(Number(searchParams.get(getParamKey('max_dte'))) || dteFilterConfig.defaultMax);
  
  // Advanced filters
  const [peRatio, setPeRatio] = useState<[number, number]>([Number(searchParams.get(getParamKey('min_pe'))) || peRatioFilterConfig.defaultMin, Number(searchParams.get(getParamKey('max_pe'))) || peRatioFilterConfig.defaultMax]);
  const [marketCap, setMarketCap] = useState<[number, number]>([Number(searchParams.get(getParamKey('min_market_cap'))) || marketCapFilterConfig.defaultMin, Number(searchParams.get(getParamKey('max_market_cap'))) || marketCapFilterConfig.defaultMax]);
  const [movingAverageCrossover, setMovingAverageCrossover] = useState(searchParams.get(getParamKey('ma_crossover')) || movingAverageCrossoverOptions[0]);
  const [sector, setSector] = useState(searchParams.get(getParamKey('sector')) || sectorOptions[0]);
  const [moneynessRange, setMoneynessRange] = useState<[number, number]>([Number(searchParams.get(getParamKey('min_moneyness'))) || moneynessFilterConfig.defaultMin, Number(searchParams.get(getParamKey('max_moneyness'))) || moneynessFilterConfig.defaultMax]);

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
    moneynessRange: [moneynessFilterConfig.defaultMin, moneynessFilterConfig.defaultMax] as [number, number]
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
      moneynessRange
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
      minSelectedExpiration
    ).catch(console.error);
    setCurrentPage(1);
  };

  useEffect(() => {
    // Only perform search on initial load if URL has parameters and we haven't already loaded from cache
    if (Array.from(searchParams.entries()).length > 0 && !isFromCache) {
      // Set isFromCache first to prevent multiple API calls
      setIsFromCache(true);
      // Use a small timeout to prevent immediate API call on page load
      const timer = setTimeout(() => {
        handleSearch();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Track filter changes
  useEffect(() => {
    // Only track changes after initial load and if we've already searched once
    if (isFromCache && hasSearched) {
      // Check if current filter values differ from active filters
      const currentFilters = {
        searchTerm: selectedStocks.join(','),
        yieldRange,
        maxPrice,
        volumeRange,
        selectedExpiration,
        deltaFilter,
        peRatio,
        marketCap,
        movingAverageCrossover,
        sector,
        moneynessRange
      };
      
      // Compare current filters with active filters
      const hasChanged = 
        currentFilters.searchTerm !== activeFilters.searchTerm ||
        currentFilters.yieldRange[0] !== activeFilters.yieldRange[0] ||
        currentFilters.yieldRange[1] !== activeFilters.yieldRange[1] ||
        currentFilters.maxPrice !== activeFilters.maxPrice ||
        currentFilters.volumeRange[0] !== activeFilters.volumeRange[0] ||
        currentFilters.volumeRange[1] !== activeFilters.volumeRange[1] ||
        currentFilters.selectedExpiration !== activeFilters.selectedExpiration ||
        currentFilters.deltaFilter[0] !== deltaFilter[0] ||
        currentFilters.deltaFilter[1] !== deltaFilter[1] ||
        currentFilters.peRatio[0] !== activeFilters.peRatio[0] ||
        currentFilters.peRatio[1] !== activeFilters.peRatio[1] ||
        currentFilters.marketCap[0] !== activeFilters.marketCap[0] ||
        currentFilters.marketCap[1] !== activeFilters.marketCap[1] ||
        currentFilters.movingAverageCrossover !== activeFilters.movingAverageCrossover ||
        currentFilters.sector !== activeFilters.sector ||
        currentFilters.moneynessRange[0] !== activeFilters.moneynessRange[0] ||
        currentFilters.moneynessRange[1] !== activeFilters.moneynessRange[1];
      
      setFiltersChanged(hasChanged);
    }
  }, [
    selectedStocks, 
    yieldRange, 
    maxPrice, 
    volumeRange, 
    selectedExpiration, 
    deltaFilter,
    peRatio,
    marketCap,
    movingAverageCrossover,
    sector,
    moneynessRange,
    hasSearched,
    isFromCache,
    activeFilters
  ]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSort = (field: keyof Option) => {            
    const newDirection = 
      sortConfig.field === field && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    setSortConfig({ field, direction: newDirection });
    
    // Fetch sorted data from server
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
      { field, direction: newDirection },
      strikeFilter !== 'ALL' ? strikeFilter : undefined,
    ).catch(console.error);
  };

  const getNext4Fridays = (()=>{
    const nextFridays: Date[] = [];
    let currentDate = new Date();
    
    for (let i = 0; i < 8; i++) {
      currentDate = getNextFriday(new Date(currentDate));
      nextFridays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }
  
    return nextFridays;
  })();

  const handleFeedback = () => {
    window.location.href = "mailto:theproducttank@gmail.com?subject=Feedback about Wheel Strategy Screener";
  };  

  const handleSymbolSelect = (symbol: string) => {
    setHasSearched(true);
    const newSelectedStocks = [...selectedStocks, symbol];
    setSelectedStocks(newSelectedStocks);
    setSearchTerm(symbol);
    setActiveFilters(prev => ({
      ...prev,
      searchTerm: newSelectedStocks.join(','),
      pageNo: 1
    }));

    updateURL({
      search: newSelectedStocks.join(','),
      min_yield: yieldRange[0],
      max_yield: yieldRange[1],
      maxPrice,
      min_vol: volumeRange[0],
      max_vol: volumeRange[1],
      expiration: selectedExpiration,
      strikeFilter,
      min_delta: deltaFilter[0],
      max_delta: deltaFilter[1]
    });

    fetchData(
      newSelectedStocks,
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
      strikeFilter !== 'ALL' ? strikeFilter : undefined,
      deltaFilter
    ).catch(console.error);
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
    strikePrice: [minPrice, maxPrice]
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
      day: 'numeric'
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
      deltaFilter
    ).catch(console.error);
  }, [sortColumn, sortDirection, router, searchParams, activeFilters, currentPage, rowsPerPage, strikeFilter, deltaFilter, fetchData]);

  // Sort data based on URL parameters
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn as keyof Option];
    const bValue = b[sortColumn as keyof Option];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle string comparison
    return sortDirection === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const { user, userId } = useAuth();

  return (
    <div className="w-full">      
      {/* Filter Controls */}
      <div className="space-y-2 mb-2">
        {/* All Rows - 2 columns on mobile, 4 on large screens */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
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
            label="Yield %"
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
          <RangeSlider
            id="input_screener_moneyness_range"
            label="Strike Filter %"
            minValue={moneynessRange[0]}
            maxValue={moneynessRange[1]}
            value={moneynessRange}
            onChange={(value) => {
              setMoneynessRange(value);
            }}
            min={moneynessFilterConfig.min}
            max={moneynessFilterConfig.max}
            step={moneynessFilterConfig.step}
            tooltip={moneynessFilterConfig.tooltip}
            formatValue={(val) => `${val}%`}
          />
          <RangeSlider
            id="input_screener_expiration"
            label="Days to Expiration"
            minValue={minDte}
            maxValue={maxDte}
            value={[minDte, maxDte]}
            onChange={(value) => {
              setMinDte(value[0]);
              setMaxDte(value[1]);
              // The useEffect will update selectedExpiration based on maxDte
            }}
            min={dteFilterConfig.min}
            max={dteFilterConfig.max}
            step={dteFilterConfig.step}
            tooltip={dteFilterConfig.tooltip}
            formatValue={(val) => `${val} days`}
            isExponential={dteFilterConfig.isExponential}
            toExponential={dteFilterConfig.toExponential}
            fromExponential={dteFilterConfig.fromExponential}
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
            autoSearch={false}
            onSearch={handleSearch}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-1">
          
          <Button
            id="btn_screener_save"
            variant="outline"
            onClick={() => setShowSaveModal(true)}
            className="bg-orange-600 text-white hover:text-black w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save & Set Alerts
          </Button>
          <Button 
            id="btn_screener_search"
            onClick={handleSearch}
            className={`w-full sm:w-auto ${filtersChanged ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
          >
            <Search className="h-4 w-4 mr-2" />
            {filtersChanged ? 'Search (Updated Filters)' : 'Search'}
          </Button>
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
          <div className="text-xs text-gray-600 mb-0.5 md:mb-1">
            Showing {totalCount} contracts
          </div>
          <BlurredTable hasSearched={hasSearched && !user}>
            <OptionsTable 
              data={sortedData}
              sortConfig={sortConfig}
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