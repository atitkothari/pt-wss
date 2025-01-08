"use client";

import { useState } from "react";
import { FilterInput } from "../filters/FilterInput";
import { useOptionsData } from "../../hooks/useOptionsData";
import { LoadingSpinner } from "../LoadingSpinner";
import { Option, OptionType, StrikeFilter } from "../../types/option";
import { OptionsTable } from "../table/OptionsTable";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Search, Mail } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useSymbols } from '../../hooks/useSymbols';

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
  'yieldPercent',
  'delta',
  'volume',
  'openInterest',
  'expiration',
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

  const handleSearch = () => {
    setHasSearched(true);
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
      strikeFilter
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

  const [deltaFilter, setDeltaFilter] = useState<[number, number]>([-1, 1]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFeedback}
          className="text-gray-600 hover:text-gray-800"
        >
          <Mail className="h-4 w-4 mr-2" />
          Provide Feedback
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FilterInput
          label="Search Symbol"
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Enter symbol..."
          onKeyPress={handleKeyPress}
          suggestions={symbols}
          showSuggestions={true}
          onSelect={handleSearch}
        />
        <FilterInput
          label="Min Yield %"
          value={minYield}
          onChange={setMinYield}
          placeholder="Min yield..."
          type="number"
          onKeyPress={handleKeyPress}
        />
        <FilterInput
          label="Max Strike Price"
          value={maxPrice}
          onChange={setMaxPrice}
          placeholder="Max strike price..."
          type="number"
          onKeyPress={handleKeyPress}
        />
        <div className="grid grid-cols-2 gap-4">
          <FilterInput
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
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Strike Filter</label>
            <select
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
            label="Min Volume"
            value={minVol}
            onChange={setMinVol}
            placeholder="Min vol..."
            type="number"
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Expiration</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={selectedExpiration}
              onChange={(e) => setSelectedExpiration(e.target.value)}
            >
              <option value="">All Dates</option>
              {getNext4Fridays.map((date) => {
                const formattedDate = format(date, "yyyy-MM-dd");
                return (
                  <option key={formattedDate} value={formattedDate}>
                    {format(date, "MMM d, yyyy")}
                  </option>
                )
              })}
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleSearch}
              className="mb-0"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
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
          <div className="text-sm text-gray-600 mb-4">
            Showing {totalCount} contracts
          </div>
          <OptionsTable 
            data={data}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4 px-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount} results
            </div>
            <div className="flex gap-2">
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
              >
                Next
              </Button>
            </div>
          </div>
          
          {/* Add footnote */}
          <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
            <div className="italic">
              * Data is updated everyday end of day
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFeedback}
              className="text-gray-500 hover:text-gray-700"
            >
              <Mail className="h-4 w-4 mr-2" />
              Provide Feedback
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 