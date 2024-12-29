"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CashSecuredPut } from "../types/cash-secured-put";
import { format } from "date-fns";
import { FilterInput } from "./filters/FilterInput";
import { SortableHeader } from "./table/SortableHeader";

interface CashSecuredPutTableProps {
  data: CashSecuredPut[];
}

type SortConfig = {
  field: keyof CashSecuredPut | '';
  direction: 'asc' | 'desc' | null;
};

export function CashSecuredPutTable({ data }: CashSecuredPutTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minYield, setMinYield] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minBid, setMinBid] = useState(0);
  const [selectedExpiration, setSelectedExpiration] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: '', direction: null });

  const handleSort = (field: keyof CashSecuredPut) => {
    setSortConfig(current => ({
      field,
      direction: 
        current.field === field && current.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const sortedAndFilteredData = data
    .filter((put) => {
      return (
        put.symbol.toLowerCase().includes(searchTerm.toLowerCase()) &&
        put.yield_percent >= minYield &&
        put.stock_price <= maxPrice &&
        put.bid_price >= minBid &&
        (selectedExpiration ? put.expiration === selectedExpiration : true)
      );
    })
    .sort((a, b) => {
      if (!sortConfig.field || !sortConfig.direction) return 0;
      
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const uniqueExpirations = [...new Set(data.map(put => put.expiration))].sort();

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Symbol" field="symbol" currentSort={sortConfig} onSort={handleSort} />
              <SortableHeader label="Price" field="stock_price" currentSort={sortConfig} onSort={handleSort} />
              <SortableHeader label="Strike" field="strike" currentSort={sortConfig} onSort={handleSort} />
              <SortableHeader label="Bid" field="bid_price" currentSort={sortConfig} onSort={handleSort} />
              <SortableHeader label="Ask" field="ask_price" currentSort={sortConfig} onSort={handleSort} />
              <SortableHeader 
                label="Yield %" 
                field="yield_percent" 
                currentSort={sortConfig} 
                onSort={handleSort}
                className="text-right"
              />
              <SortableHeader 
                label="Volume" 
                field="volume" 
                currentSort={sortConfig} 
                onSort={handleSort}
                className="text-right"
              />
              <SortableHeader 
                label="Open Interest" 
                field="open_interest" 
                currentSort={sortConfig} 
                onSort={handleSort}
                className="text-right"
              />
              <SortableHeader 
                label="Expiration" 
                field="expiration" 
                currentSort={sortConfig} 
                onSort={handleSort}
                className="text-right"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredData.map((put, index) => (
              <TableRow key={`${put.symbol}-${put.strike}-${index}`}>
                <TableCell className="font-medium">{put.symbol}</TableCell>
                <TableCell>${put.stock_price.toFixed(2)}</TableCell>
                <TableCell>${put.strike.toFixed(2)}</TableCell>
                <TableCell>${put.bid_price.toFixed(2)}</TableCell>
                <TableCell>${put.ask_price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {put.yield_percent.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right">{put.volume}</TableCell>
                <TableCell className="text-right">{put.open_interest}</TableCell>
                <TableCell className="text-right">
                  {format(new Date(put.expiration), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}