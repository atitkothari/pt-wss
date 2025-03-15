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
  strikeFilterOptions,
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
  const [minYield, setMinYield] = useState(Number(searchParams.get(getParamKey('minYield'))) || yieldFilterConfig.default);
  const [minPrice, setMinPrice] = useState(Number(searchParams.get(getParamKey('minPrice'))) || priceFilterConfig.defaultMin);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get(getParamKey('maxPrice'))) || priceFilterConfig.defaultMax);
  const [minVol, setMinVol] = useState(Number(searchParams.get(getParamKey('minVol'))) || volumeFilterConfig.default);
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
  const [sortConfig, setSortConfig] = useState<{ field: keyof Option; direction: 'asc' | 'desc' | null }>({ 
    field: "symbol", 
    direction: null 
  });
  
  const [activeFilters, setActiveFilters] = useState({
    searchTerm: "",
    minYield: yieldFilterConfig.default,
    maxPrice: priceFilterConfig.defaultMax,
    minVol: volumeFilterConfig.default,
    selectedExpiration: "",
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
    (searchParams.get(getParamKey('strikeFilter')) as StrikeFilter) || 'ONE_OUT'
  );
  const rowsPerPage = 50;

  const { data, loading, error, totalCount, fetchData } = useOptionsData(
    activeFilters.searchTerm.split(","),
    activeFilters.minYield,
    activeFilters.maxPrice,
    activeFilters.minVol,
    activeFilters.selectedExpiration,
    option
  );

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

  const [searchCount, setSearchCount] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('searchCount') || '0');
    }
    return 0;
  });

  const handleSearch = () => {
    setHasSearched(true);
    setIsFromCache(false);
    
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem('searchCount', newCount.toString());
    
    // if (newCount >= 3) {
    //   setShowSaveModal(true);
    //   setSearchCount(0)
    // }

    setActiveFilters({
      searchTerm: selectedStocks.join(','),
      minYield,
      maxPrice,
      minVol,
      selectedExpiration,
      pageNo: 1,
      peRatio,
      marketCap,
      movingAverageCrossover,
      sector,
      moneynessRange
    });

    updateURL({
      search: selectedStocks.join(','),
      minYield,
      maxPrice,
      minVol,
      expiration: selectedExpiration,
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
      minYield, 
      maxPrice, 
      minVol, 
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
      moneynessRange
    ).catch(console.error);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (Array.from(searchParams.entries()).length > 0 && !isFromCache) {
      handleSearch();
      setIsFromCache(true);
    }
  }, []);

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
      activeFilters.minYield,
      activeFilters.maxPrice,
      activeFilters.minVol,
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
      minYield,
      maxPrice,
      minVol,
      expiration: selectedExpiration,
      strikeFilter,
      min_delta: deltaFilter[0],
      max_delta: deltaFilter[1]
    });

    fetchData(
      newSelectedStocks,
      minYield,
      maxPrice,
      minVol,
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
    minYield,
    maxPrice,
    minVol,
    selectedExpiration,
    moneynessRange,
    deltaFilter,
    peRatio,
    marketCap,
    movingAverageCrossover,
    sector,
    option
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
      activeFilters.minYield,
      activeFilters.maxPrice,
      activeFilters.minVol,
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
          <SingleValueSlider
            id="input_screener_min_yield"
            label="Yield %"
            value={minYield}
            onChange={setMinYield}
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
            }}
            min={dteFilterConfig.min}
            max={dteFilterConfig.max}
            step={dteFilterConfig.step}
            tooltip={dteFilterConfig.tooltip}
            formatValue={(val) => `${val} days`}
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
            minVol={minVol}
            onMinVolChange={setMinVol}
            handleKeyPress={handleKeyPress}
            strikePrice={[minPrice, maxPrice]}
            onStrikePriceChange={(value) => {
              setMinPrice(value[0]);
              setMaxPrice(value[1]);
            }}
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
            className="w-full sm:w-auto"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Results Section */}
      {!hasSearched && !activeFilters.searchTerm && 
       activeFilters.minYield === 0 && 
       activeFilters.maxPrice === 1000 && 
       activeFilters.minVol === 0 && 
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
                    activeFilters.minYield,
                    activeFilters.maxPrice,
                    activeFilters.minVol,
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
                    activeFilters.minYield,
                    activeFilters.maxPrice,
                    activeFilters.minVol,
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