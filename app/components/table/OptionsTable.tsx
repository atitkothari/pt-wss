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

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: "symbol", label: "Symbol" },
  { key: "expectedPremium", label: "Premium" },
  { key: "yieldPercent", label: "Yield %" },
  { key: "stockPrice", label: "Stock Price" },
  { key: "strike", label: "Strike" },  
  { key: "bidPrice", label: "Bid" },
  { key: "askPrice", label: "Ask" },
  { key: "volume", label: "Volume" },
  { key: "openInterest", label: "Open Interest" },
  { key: "expiration", label: "Expiration" },
  { key: "earningsDate", label: "Earnings" },
];

interface OptionsTableProps {
  data: Option[];
  sortConfig: {
    field: keyof Option;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (field: keyof Option) => void;
}

export function OptionsTable({ data, sortConfig, onSort }: OptionsTableProps) {
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
      <div className="flex justify-end mb-4">
        <ColumnCustomizer
          columns={DEFAULT_COLUMNS}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((columnKey) => {
                const column = DEFAULT_COLUMNS.find(col => col.key === columnKey);
                return (
                  <TableHead key={columnKey}>
                    <Button
                      variant="ghost"
                      onClick={() => onSort(columnKey as keyof Option)}
                      className="flex items-center gap-1"
                    >
                      {column?.label}
                      {/* <ArrowUpDown className="h-4 w-4" /> */}
                      {sortConfig.field === columnKey && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((option, index) => (
              <OptionRow 
                key={`${option.symbol}-${option.strike}-${index}`}
                option={option}
                index={index}
                visibleColumns={visibleColumns}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}