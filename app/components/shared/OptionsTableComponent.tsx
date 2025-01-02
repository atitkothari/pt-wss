"use client";

import { useState } from "react";
import { FilterInput } from "../filters/FilterInput";
import { useOptionsData } from "../../hooks/useOptionsData";
import { LoadingSpinner } from "../LoadingSpinner";
import { Option } from "../../types/option";
import { OptionsTable } from "../table/OptionsTable";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type StrikeFilter = 'ITM' | 'ONE_OUT' | 'THREE_PERCENT' | 'ALL';

interface OptionsTableComponentProps {
  option: 'call' | 'put';
}

function getNextFriday(date: Date): Date {
  const dayOfWeek = date.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  const nextFriday = new Date(date);
  nextFriday.setDate(date.getDate() + daysUntilFriday);
  return nextFriday;
}

export function OptionsTableComponent({ option }: OptionsTableComponentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minYield, setMinYield] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minVol, setMinVol] = useState(0);
  const [selectedExpiration, setSelectedExpiration] = useState("");
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
  const [strikeFilter, setStrikeFilter] = useState<StrikeFilter>('ALL');
  const rowsPerPage = 50;

  const { data, loading, error, totalCount, fetchData } = useOptionsData(
    activeFilters.searchTerm,
    activeFilters.minYield,
    activeFilters.maxPrice,
    activeFilters.minVol,
    activeFilters.selectedExpiration,
    option,
    activeFilters.pageNo
  );

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
    fetchData(
      searchTerm, 
      minYield, 
      maxPrice, 
      minVol, 
      selectedExpiration,
      1,
      rowsPerPage,
      sortConfig.direction ? sortConfig : undefined,
      strikeFilter !== 'ALL' ? strikeFilter : undefined
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
      strikeFilter !== 'ALL' ? strikeFilter : undefined
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

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="w-full">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FilterInput
          label="Search Symbol"
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Enter symbol..."
          onKeyPress={handleKeyPress}
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
        <FilterInput
          label="Min Volume"
          value={minVol}
          onChange={setMinVol}
          placeholder="Min vol..."
          type="number"
          onKeyPress={handleKeyPress}
        />
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
       !activeFilters.selectedExpiration ? (
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
                    strikeFilter !== 'ALL' ? strikeFilter : undefined
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
                    strikeFilter !== 'ALL' ? strikeFilter : undefined
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
        </div>
      )}
    </div>
  );
} 