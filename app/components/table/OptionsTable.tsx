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
import { OptionRow } from "./OptionRow";
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
  { key: "yieldPercent", label: "Yield %" },
  { key: "expiration", label: "Expiration" },
  { key: "annualizedReturn", label: "Ann %" },
  { key: "bidPrice", label: "Bid" },
  { key: "askPrice", label: "Ask" },
  { key: "volume", label: "Volume" },
  { key: "openInterest", label: "Open Interest" },
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
        return format(parseISO(value), 'MMM d, yyyy');
      } catch {
        return value;
      }
    
    case 'earningsDate':
      if (!value) return '-';
      try {
        return format(parseISO(value), 'MMM d, yyyy');
      } catch {
        return value;
      }
    
    case 'volume':
    case 'openInterest':
      return value.toLocaleString();
    case 'symbol':
      let link = "https://screenwich.com/stock-details/"+value      
      return <a href={link} target="_blank">{String(value)}</a>
    
    default:
      return String(value);
  }
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

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    DEFAULT_COLUMNS.map(col => col.key)
  );

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(current => {
      if (current.includes(columnKey)) {
        if (current.length === 1) return current;
        return current.filter(key => key !== columnKey);
      }
      return [...current, columnKey].sort(
        (a, b) => 
          DEFAULT_COLUMNS.findIndex(col => col.key === a) - 
          DEFAULT_COLUMNS.findIndex(col => col.key === b)
      );
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
                      key={column} 
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