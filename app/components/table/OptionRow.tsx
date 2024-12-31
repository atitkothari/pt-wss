"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Option } from "@/app/types/option";
import { format } from "date-fns";

interface OptionRowProps {
  option: Option;
  index: number;
}

export function OptionRow({ option, index }: OptionRowProps) {
  const formatEarningsDate = (date: string | null) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(`${date}T00:00:00Z`), "MMM d, yyyy");
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <TableRow key={`${option.symbol}-${option.strike}-${index}`}>
      <TableCell className="font-medium">{option.symbol}</TableCell>
      <TableCell>${option.stockPrice.toFixed(2)}</TableCell>
      <TableCell>${option.strike.toFixed(2)}</TableCell>
      <TableCell>${option.expectedPremium.toFixed(2)}</TableCell>
      <TableCell className="text-right">
        {option.yieldPercent.toFixed(2)}%
      </TableCell>
      <TableCell>${option.bidPrice.toFixed(2)}</TableCell>
      <TableCell>${option.askPrice.toFixed(2)}</TableCell>      
      <TableCell className="text-right">{option.volume}</TableCell>
      <TableCell className="text-right">{option.openInterest}</TableCell>
      <TableCell className="text-right">
        {format(new Date(option.expiration), "MMM d, yyyy")}
      </TableCell>
      <TableCell className="text-right">
        {formatEarningsDate(option.earningsDate)}
      </TableCell>
    </TableRow>
  );
}