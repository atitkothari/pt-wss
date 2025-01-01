"use client";

import { useState } from "react";
import { FilterInput } from "./filters/FilterInput";
import { useOptionsData } from "../hooks/useOptionsData";
import { LoadingSpinner } from "./LoadingSpinner";
import { Option } from "../types/option";
import { OptionsTable } from "./table/OptionsTable";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

function getNextFriday(date: Date): Date {
  const dayOfWeek = date.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  const nextFriday = new Date(date);
  nextFriday.setDate(date.getDate() + daysUntilFriday);
  return nextFriday;
}

type SortConfig = {
  field: keyof Option;
  direction: 'asc' | 'desc' | null;
};

type Tab = {
  option: 'call' | 'put'
}

type StrikeFilter = 'ITM' | 'ONE_OUT' | 'THREE_PERCENT' | 'ALL';

const filterDataByStrike = (data: Option[], strikeFilter: StrikeFilter, optionType: 'call' | 'put'): Option[] => {
  if (strikeFilter === 'ALL' || !data.length) return data;

  return data.filter(option => {
    if (!option.stockPrice) return false;

    const strike = option.strike;
    const stockPrice = option.stockPrice;

    switch (strikeFilter) {
      case 'ITM':
        return optionType === 'call' 
          ? strike < stockPrice 
          : strike > stockPrice;
      
      case 'ONE_OUT':
        if (optionType === 'call') {
          return strike > stockPrice && strike <= stockPrice * 1.05;
        } else {
          return strike < stockPrice && strike >= stockPrice * 0.95;
        }
      
      case 'THREE_PERCENT':
        return optionType === 'call'
          ? strike >= stockPrice * 1.03
          : strike <= stockPrice * 0.97;
      
      default:
        return true;
    }
  });
};

export function CashSecuredPutTable({option}: Tab) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minYield, setMinYield] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minVol, setMinVol] = useState(0);
  const [selectedExpiration, setSelectedExpiration] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "symbol", direction: null });
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    searchTerm: "",
    minYield: 0,
    maxPrice: 1000,
    minVol: 0,
    selectedExpiration: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const [strikeFilter, setStrikeFilter] = useState<StrikeFilter>('ALL');

  const { data, loading, error, fetchData } = useOptionsData(
    activeFilters.searchTerm,
    activeFilters.minYield,
    activeFilters.maxPrice,
    activeFilters.minVol,
    activeFilters.selectedExpiration,
    option
  );

  const handleSearch = () => {
    setHasSearched(true);
    setActiveFilters({
      searchTerm,
      minYield,
      maxPrice,
      minVol,
      selectedExpiration,
    });
    fetchData(
      searchTerm, 
      minYield, 
      maxPrice, 
      minVol, 
      selectedExpiration
    ).catch(console.error);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Option) => {            
    setSortConfig(current => ({
      field,
      direction: 
        current.field === field && current.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const filteredData = filterDataByStrike(data, strikeFilter, option);
  
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.field || !sortConfig.direction) return 0;
    
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (error) return <div className="text-red-500 p-4">{error}</div>;

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

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FilterInput
          label="Search Symbol"
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Enter symbol..."
        />
        <FilterInput
          label="Min Yield %"
          value={minYield}
          onChange={setMinYield}
          placeholder="Min yield..."
          type="number"
        />
        <FilterInput
          label="Max Strike Price"
          value={maxPrice}
          onChange={setMaxPrice}
          placeholder="Max strike price..."
          type="number"
        />
        <FilterInput
          label="Min Volume"
          value={minVol}
          onChange={setMinVol}
          placeholder="Min vol..."
          type="number"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Strike Filter</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={strikeFilter}
            onChange={(e) => setStrikeFilter(e.target.value as StrikeFilter)}
          >
            <option value="ALL">All Strikes</option>
            <option value="ITM">In The Money</option>
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
            Showing {sortedData.length} contracts
          </div>
          <OptionsTable 
            data={paginatedData}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          <div className="flex justify-between items-center mt-4 px-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * rowsPerPage >= sortedData.length}
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