"use client";

import { useEffect, useState, useCallback } from "react";
import { FilterInput } from "../filters/FilterInput";
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

const DEFAULT_VISIBLE_COLUMNS = [
  'symbol',
  'stockPrice',
  'strike',
  'premium',
  'delta',
  'yieldPercent',
  'expiration',
  'volume',
  'openInterest',
  'earningsDate',
  'impliedVolatility'
];

export function OptionsTableComponent({ option }: OptionsTableComponentProps) {  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { symbols } = useSymbols();

  const getParamKey = (key: string) => `${option}_${key}`;
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get(getParamKey('search')) || "");
  const [minYield, setMinYield] = useState(Number(searchParams.get(getParamKey('minYield'))) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get(getParamKey('maxPrice'))) || 1000);
  const [minVol, setMinVol] = useState(Number(searchParams.get(getParamKey('minVol'))) || 0);
  const [deltaFilter, setDeltaFilter] = useState<[number, number]>([Number(searchParams.get(getParamKey('min_delta'))) || -1, Number(searchParams.get(getParamKey('max_delta'))) || 1]);

  const [selectedExpiration, setSelectedExpiration] = useState(searchParams.get(getParamKey('expiration')) || "");
  const [sortConfig, setSortConfig] = useState<{ field: keyof Option; direction: 'asc' | 'desc' | null }>({ 
    field: "symbol", 
    direction: null 
  });
  
  const [activeFilters, setActiveFilters] = useState({
    searchTerm: "",
    minYield: 0,
    maxPrice: 1000,
    minVol: 0,
    selectedExpiration: "",
    pageNo: 1
  });

  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [strikeFilter, setStrikeFilter] = useState<StrikeFilter>(
    (searchParams.get(getParamKey('strikeFilter')) as StrikeFilter) || 'ONE_OUT'
  );
  const rowsPerPage = 50;

  const { data, loading, error, totalCount, fetchData } = useOptionsData(
    activeFilters.searchTerm,
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
      searchTerm,
      minYield,
      maxPrice,
      minVol,
      selectedExpiration,
      pageNo: 1
    });

    updateURL({
      search: searchTerm,
      minYield,
      maxPrice,
      minVol,
      expiration: selectedExpiration,
      strikeFilter,
      min_delta: deltaFilter[0],
      max_delta: deltaFilter[1]
    });

    fetchData(
      searchTerm, 
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
      activeFilters.searchTerm,
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
    setSearchTerm(symbol);
    setActiveFilters(prev => ({
      ...prev,
      searchTerm: symbol,
      pageNo: 1
    }));

    updateURL({
      search: symbol,
      minYield,
      maxPrice,
      minVol,
      expiration: selectedExpiration,
      strikeFilter,
      min_delta: deltaFilter[0],
      max_delta: deltaFilter[1]
    });

    fetchData(
      symbol,
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
    strikeFilter,
    deltaFilter,
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
      activeFilters.searchTerm,
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

  const { user } = useAuth();

  return (
    <div className="w-full">      
      {/* Filter Controls */}
      <div className="space-y-2 mb-2">
        {/* All Rows - 2 columns on mobile, 4 on large screens */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <FilterInput
            id="input_screener_symbol"
            label="Search Symbol"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Enter symbol..."
            onKeyPress={handleKeyPress}
            suggestions={symbols}
            showSuggestions={true}
            onSelect={(selectedSymbol: string) => handleSymbolSelect(selectedSymbol)}
          />
          <FilterInput
            id="input_screener_min_yield"
            label="Min Yield %"
            value={minYield}
            onChange={setMinYield}
            placeholder="Min yield..."
            type="number"
            onKeyPress={handleKeyPress}
          />
          <FilterInput
            id="input_screener_max_price"
            label="Max Strike Price"
            value={maxPrice}
            onChange={setMaxPrice}
            placeholder="Max strike price..."
            type="number"
            onKeyPress={handleKeyPress}
          />
          <FilterInput
            id="input_screener_expiration"
            label="Days to Expiration"
            value={dte}
            onChange={setDte}
            placeholder="Days to expiration..."
            type="number"
            min="0"
            max="1000"
            onKeyPress={handleKeyPress}
          />
          <FilterInput
            id="input_screener_min_delta"
            label="Min Delta"
            value={deltaFilter[0]}
            onChange={(value) => setDeltaFilter([value, deltaFilter[1]])}
            placeholder="Min delta..."
            type="number"
            step="0.1"
            min="-1"
            max="1"
            onKeyPress={handleKeyPress}
          />
          <FilterInput
            id="input_screener_max_delta"
            label="Max Delta"
            value={deltaFilter[1]}
            onChange={(value) => setDeltaFilter([deltaFilter[0], value])}
            placeholder="Max delta..."
            type="number"
            step="0.1"
            min="-1"
            max="1"
            onKeyPress={handleKeyPress}
          />
          <div>
            <label className="block text-sm font-medium mb-1">Strike Filter</label>
            <select
              id="input_screener_strike_filter"
              className="w-full px-3 py-2 border rounded-md"
              value={strikeFilter}
              onChange={(e) => setStrikeFilter(e.target.value as StrikeFilter)}
            >
              <option value="ALL">All Strikes</option>
              <option value="ONE_OUT">One Strike Out</option>
              <option value="THREE_PERCENT">&gt; 3% Out</option>
            </select>
          </div>
          <FilterInput
            id="input_screener_min_volume"
            label="Min Volume"
            value={minVol}
            onChange={setMinVol}
            placeholder="Min vol..."
            type="number"
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-1">
          {/* <Button 
            id="btn_screener_feedback_top"
            variant="outline"
            onClick={handleFeedback}
            className="text-gray-600 hover:text-gray-800 w-full sm:w-auto"
          >
            <Mail className="h-4 w-4 mr-2" />
            Provide Feedback
          </Button> */}
          
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
                    activeFilters.searchTerm,
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
                    activeFilters.searchTerm,
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