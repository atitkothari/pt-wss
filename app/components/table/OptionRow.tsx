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

  const getRatingColor = (rating: string | undefined) => {
    if (!rating) return '';
    
    switch (rating) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'A-':
        return 'bg-green-50 text-green-700';
      case 'B+':
        return 'bg-emerald-50 text-emerald-700';
      case 'B':
        return 'bg-yellow-50 text-yellow-700';
      case 'B-':
        return 'bg-orange-50 text-orange-700';
      case 'C+':
      case 'C':
        return 'bg-red-50 text-red-700';
      case 'C-':
      case 'D':
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return '';
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
      case 'delta':
        return <TableCell className="text-right">
          {option.delta?.toFixed(2) ?? 'N/A'}
        </TableCell>;
      case 'annualizedReturn':
        return option.annualizedReturn 
          ? <TableCell className="text-right">{option.annualizedReturn.toFixed(1)}%</TableCell>
          : <TableCell className="text-right">"-"</TableCell>;
      case 'rating':
        const ratingColor = getRatingColor(option.rating);
        return <TableCell className="text-right">
          <span className={`inline-block px-2 py-1 rounded-full ${ratingColor}`}>
            {option.rating ?? 'N/A'}
          </span>
        </TableCell>;
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