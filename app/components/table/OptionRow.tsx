"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Option } from "@/app/types/option";
import { format } from "date-fns";

interface OptionRowProps {
  option: Option;
  index: number;
  visibleColumns: string[];
}

export function OptionRow({ option, index, visibleColumns }: OptionRowProps) {
  const formatEarningsDate = (date: string | null) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(`${date}T00:00:00Z`), "MMM d, yyyy");
    } catch (error) {
      return 'N/A';
    }
  };

  const renderCell = (columnKey: string) => {
    switch (columnKey) {
      case 'symbol':
        return <TableCell className="font-medium">{option.symbol}</TableCell>;
      case 'stockPrice':
        return <TableCell>${option.stockPrice.toFixed(2)}</TableCell>;
      case 'strike':
        return <TableCell>${option.strike.toFixed(2)}</TableCell>;
      case 'premium':
        return <TableCell>${option.premium?.toFixed(2) ?? 'N/A'}</TableCell>;
      case 'yieldPercent':
        return <TableCell className="text-right">{option.yieldPercent?.toFixed(2) ?? 'N/A'}%</TableCell>;
      case 'bidPrice':
        return <TableCell>${option.bidPrice.toFixed(2)}</TableCell>;
      case 'askPrice':
        return <TableCell>${option.askPrice.toFixed(2)}</TableCell>;
      case 'volume':
        return <TableCell className="text-right">{option.volume}</TableCell>;
      case 'openInterest':
        return <TableCell className="text-right">{option.openInterest}</TableCell>;
      case 'expiration':
        return <TableCell className="text-right">
          {format(new Date(option.expiration), "MMM d, yyyy")}
        </TableCell>;
      case 'earningsDate':
        return <TableCell className="text-right">
          {formatEarningsDate(option.earningsDate)}
        </TableCell>;
      case 'impliedVolatility':
        return <TableCell className="text-right">{option.impliedVolatility.toFixed(1)}%</TableCell>;
      default:
        return null;
    }
  };

  return (
    <TableRow key={`${option.symbol}-${option.strike}-${index}`}>
      {visibleColumns.map(columnKey => renderCell(columnKey))}
    </TableRow>
  );
}