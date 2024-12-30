"use client";

import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Option } from "@/app/types/option";
import { SortableHeader } from "./SortableHeader";
import { OptionRow } from "./OptionRow";

interface OptionsTableProps {
  data: Option[];
  sortConfig: { field: keyof Option | ''; direction: 'asc' | 'desc' | null };
  onSort: (field: keyof Option|string) => void;
}

export function OptionsTable({ data, sortConfig, onSort }: OptionsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader label="Symbol" field="symbol" currentSort={sortConfig} onSort={onSort} />
            <SortableHeader label="Price" field="stockPrice" currentSort={sortConfig} onSort={onSort} />
            <SortableHeader label="Strike" field="strike" currentSort={sortConfig} onSort={onSort} />
            <SortableHeader label="Expected Premium" field="expectedPremium" currentSort={sortConfig} onSort={onSort} />
            <SortableHeader 
              label="Yield %" 
              field="yieldPercent" 
              currentSort={sortConfig} 
              onSort={onSort}
              className="text-right"
            />
            <SortableHeader label="Bid" field="bidPrice" currentSort={sortConfig} onSort={onSort} />
            <SortableHeader label="Ask" field="askPrice" currentSort={sortConfig} onSort={onSort} />            
            <SortableHeader 
              label="Volume" 
              field="volume" 
              currentSort={sortConfig} 
              onSort={onSort}
              className="text-right"
            />
            <SortableHeader 
              label="Open Interest" 
              field="openInterest" 
              currentSort={sortConfig} 
              onSort={onSort}
              className="text-right"
            />
            <SortableHeader 
              label="Expiration" 
              field="expiration" 
              currentSort={sortConfig} 
              onSort={onSort}
              className="text-right"
            />
            <SortableHeader 
              label="Earnings Date" 
              field="earningsDate" 
              currentSort={sortConfig} 
              onSort={onSort}
              className="text-right"
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((option, index) => (
            <OptionRow key={index} option={option} index={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}