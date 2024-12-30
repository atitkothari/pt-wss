"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Option } from "@/app/types/option";
import { format } from "date-fns";

interface OptionRowProps {
  option: Option;
  index: number;
}

export function OptionRow({ option, index }: OptionRowProps) {
  return (
    <TableRow key={`${option.symbol}-${option.strike}-${index}`}>
      <TableCell className="font-medium">{option.symbol}</TableCell>
      <TableCell>${option.stockPrice.toFixed(2)}</TableCell>
      <TableCell>${option.strike.toFixed(2)}</TableCell>
      <TableCell>${((option.askPrice + option.askPrice)/2 * 100).toFixed(2)}</TableCell>
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
        {format(new Date(`${option.earningsDate}T00:00:00Z`), "MMM d, yyyy")}
      </TableCell>
    </TableRow>
  );
}