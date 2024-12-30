"use client";

import { useState } from "react";
import { FilterInput } from "./filters/FilterInput";
import { useOptionsData } from "../hooks/useOptionsData";
import { LoadingSpinner } from "./LoadingSpinner";
import { Option } from "../types/option";
import { OptionsTable } from "./table/OptionsTable";
import { format } from "date-fns";

type SortConfig = {
  field: keyof Option | '';
  direction: 'asc' | 'desc' | null;
};

export function CoveredCallTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [minYield, setMinYield] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minBid, setMinBid] = useState(0);
  const [selectedExpiration, setSelectedExpiration] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: '', direction: null });

  const { data, loading, error } = useOptionsData(
    searchTerm,
    minYield,
    maxPrice,
    minBid,
    selectedExpiration
  );

  const handleSort = (field: string) => {    
    const validKey = field as keyof Option;
    // setSortConfig(current => ({
    //   validKey,
    //   direction: 
    //     current.field === field && current.direction === 'asc' 
    //       ? 'desc' 
    //       : 'asc'
    // }));
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.field || !sortConfig.direction) return 0;
    
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

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
          label="Max Price"
          value={maxPrice}
          onChange={setMaxPrice}
          placeholder="Max price..."
          type="number"
        />
        <FilterInput
          label="Min Bid"
          value={minBid}
          onChange={setMinBid}
          placeholder="Min bid..."
          type="number"
        />
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Expiration</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={selectedExpiration}
            onChange={(e) => setSelectedExpiration(e.target.value)}
          >
            <option value="">All Dates</option>
            {uniqueExpirations.map((date) => (
              <option key={date} value={date}>
                {format(new Date(date), "MMM d, yyyy")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <OptionsTable 
        data={sortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
    </div>
  );
}