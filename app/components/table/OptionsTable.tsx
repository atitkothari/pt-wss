"use client";

import { useState } from "react";
import { Option } from "@/app/types/option";
import { 
  Table, 
  TableHeader, 
  TableHead,
  TableBody,
  TableRow 
} from "@/components/ui/table";
import { ColumnCustomizer, ColumnDef } from "./ColumnCustomizer";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { useSearchParams } from 'next/navigation';

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: "symbol", label: "Symbol" },
  { key: "stockPrice", label: "Stock Price" },
  { key: "strike", label: "Strike" },
  { key: "premium", label: "Premium" },
  { key: "delta", label: "Delta" },
  { key: "yieldPercent", label: "Premium Yield %" },
  { key: "expiration", label: "Expiration" },
  { key: "annualizedReturn", label: "Ann %" },
  { key: "bidPrice", label: "Bid" },
  { key: "askPrice", label: "Ask" },
  { key: "volume", label: "Volume" },
  { key: "openInterest", label: "Open Interest" },
  { key: "peRatio", label: "P/E Ratio" },
  { key: "marketCap", label: "Market Cap" },
  { key: "sector", label: "Sector" },
  { key: "earningsDate", label: "Earnings" },
  { key: "impliedVolatility", label: "IV %" },
];

const formatCell = (value: any, columnKey: string): string|any => {
  if (value === undefined || value === null) return '-';

  switch (columnKey) {
    case 'stockPrice':
    case 'strike':
    case 'premium':
    case 'bidPrice':
    case 'askPrice':
      return `$${Number(value).toFixed(2)}`;
    
    case 'delta':
      return Number(value).toFixed(3);
    
    case 'yieldPercent':
    case 'annualizedReturn':
    case 'impliedVolatility':
      return `${Number(value).toFixed(2)}%`;
    
    case 'expiration':
      try {
        const date = parseISO(value);
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        return format(utcDate, 'MMM d, yyyy');
      } catch {
        return value;
      }
    
    case 'earningsDate':
      if (!value) return '-';
      try {
        const date = parseISO(value);
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        return format(utcDate, 'MMM d, yyyy');
      } catch {
        return value;
      }
    
    case 'volume':
    case 'openInterest':
      return value.toLocaleString();
    case 'symbol':
      let link = "https://screenwich.com/stock-details/"+value      
      return <a href={link} target="_blank">{String(value)}</a>
    
    case 'peRatio':
      return value ? Number(value).toFixed(2) : '-';
      
    case 'marketCap':
      if (!value) return '-';
      const marketCapValue = Number(value);
      if (marketCapValue >= 1000000000000) {    
        return `$${(marketCapValue / 1000000000000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}T`;
      } else if (marketCapValue >= 1000000000) {    
        return `$${(marketCapValue / 1000000000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}B`;
      } else if (marketCapValue >= 1000000) {    
        return `$${(marketCapValue / 1000000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}M`;
      } else if (marketCapValue >= 1000) {    
        return `$${(marketCapValue / 1000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}K`;
      } else if (marketCapValue >= 1) {
        return `$${marketCapValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
      }
      
    default:
      return String(value);
  };
};

interface OptionsTableProps {
  data: Option[];
  onSort: (field: string) => void;
  sortConfig?: { field: keyof Option; direction: 'asc' | 'desc' | null };
}

export function OptionsTable({ data, onSort }: OptionsTableProps) {
  const searchParams = useSearchParams();
  const sortColumn = searchParams.get('sortBy');
  const sortDirection = searchParams.get('sortDir');

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
    // Fall back to default columns
    return DEFAULT_COLUMNS.map(col => col.key);
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

  return (
    <div>
      <div className="flex justify-end mb-1">
        <ColumnCustomizer
          columns={DEFAULT_COLUMNS}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>
      <div className="rounded-md border">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b">
                {visibleColumns.map((column) => {
                  const columnDef = DEFAULT_COLUMNS.find(col => col.key === column);
                  return (
                    <th
                      key={column}
                      onClick={() => onSort(column)}
                      className="text-left p-2 md:p-2.5 font-medium cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        {columnDef?.label}
                        {sortColumn === column && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.map((option, index) => (
                <tr 
                  key={`${option.symbol}-${option.strike}-${index}`}
                  className="border-b hover:bg-gray-50"
                >
                  {visibleColumns.map((column) => (
                    <td 
                      key={`${column}-${index}`}
                      className="p-2 md:p-2.5 whitespace-nowrap"
                    >
                      {formatCell(option[column as keyof Option], column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}