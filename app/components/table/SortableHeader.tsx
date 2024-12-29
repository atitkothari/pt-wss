"use client";

import { ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSort: { field: string; direction: 'asc' | 'desc' | null };
  onSort: (field: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  field,
  currentSort,
  onSort,
  className
}: SortableHeaderProps) {
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </TableHead>
  );
}