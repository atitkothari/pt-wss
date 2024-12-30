"use client";

import { useState } from "react";
import { FilterInput } from "./filters/FilterInput";
import { useOptionsData } from "../hooks/useOptionsData";
import { LoadingSpinner } from "./LoadingSpinner";
import { Option } from "../types/option";
import { OptionsTable } from "./table/OptionsTable";
import { format } from "date-fns";

type SortConfig = {
  field: keyof Option;
  direction: 'asc' | 'desc' | null;
};

type Tab = {
  option: 'call' | 'put'
}

export function CoveredCallTable({option}:Tab) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minYield, setMinYield] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minVol, setMinVol] = useState(0);
  const [selectedExpiration, setSelectedExpiration] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "symbol", direction: null });

  const { data, loading, error } = useOptionsData(
    searchTerm,
    minYield,
    maxPrice,
    minVol,
    selectedExpiration,
    option
  );

  const handleSort = (field: keyof Option) => {            
    setSortConfig(current => ({
      field,
      direction: 
        current.field === field && current.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.field || !sortConfig.direction) return 0;
    
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const getNextFriday = (date: Date): Date => {
    const dayOfWeek = date.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7; // 5 is Friday
    date.setDate(date.getDate() + daysUntilFriday);
    return date;
  };
  
  const getNext4Fridays = (()=>{
    const nextFridays: Date[] = [];
    let currentDate = new Date();
    
    // Get the next Friday and add it to the array
    for (let i = 0; i < 8; i++) {
      currentDate = getNextFriday(new Date(currentDate));
      nextFridays.push(new Date(currentDate));
      // Move to the next Friday
      currentDate.setDate(currentDate.getDate() + 7);
    }
  
    return nextFridays;
  })();
  
  // const uniqueExpirations = [...new Set(data.map(option => option.expiration))].sort();
  const uniqueExpirations = (() => {
    const expirations: string[] = [];
    for (let i = 0; i < data.length; i++) {
      const expiration = data[i].expiration;
      if (expirations.indexOf(expiration) === -1) {
        expirations.push(expiration);
      }
    }
  
    expirations.sort();
    // expirations.unshift('All');
    return expirations;
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
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Expiration</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={selectedExpiration}
            onChange={(e) => e.target.value==""?setSelectedExpiration(""):setSelectedExpiration("\""+format(new Date(e.target.value),"yyyy-MM-dd")+"\"")}
          >
            <option value="">All Dates</option>
            {getNext4Fridays.map((date) => (
              <option key={date.toString()} value={"\""+format(new Date(date.toString()),"yyyy-MM-dd")+"\""}>
                {format(new Date(date), "MMM d, yyyy")}
              </option>
            ))}
          </select>
        </div>
      </div>
      {!searchTerm && minYield === 0 && maxPrice === 1000 && minVol === 0 && !selectedExpiration ? (
        <div className="text-center py-8 text-gray-600">
          Run a search to view results
        </div>
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <OptionsTable 
          data={sortedData}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      )}
    </div>
  );
}