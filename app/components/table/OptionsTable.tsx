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
import { ArrowUpDown, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { toast } from 'sonner';
  // Import the defaultVisibleColumns from filterConfig
import { defaultVisibleColumns as configDefaultVisibleColumns } from '@/app/config/filterConfig';
import { sendAnalyticsEvent } from "@/app/utils/analytics";
import { useUserAccess } from "@/app/hooks/useUserAccess";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DEFAULT_COLUMNS: ColumnDef[] = [  
  { key: "rating", label: "Rating" },
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
  { key: "probability", label: "Probability of Profit %" },
];

const formatCell = (value: any, columnKey: string): string|any => {  
  const { canAccessFeature } = useUserAccess();
  const router = useRouter();

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
        return format(date, 'MMM d, yyyy');        
      } catch {
        return value;
      }
    
    case 'earningsDate':
      if (!value) return '-';
      try {
        const date = parseISO(value);
        // const utcDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return format(date, 'MMM d, yyyy');
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
    
    case 'rating':
      const getRatingColor = (rating: string) => {
        if (!rating) return '';
        switch (rating) {
          case 'A+':
          case 'A':
            return 'bg-green-100 text-green-800 border border-green-200';
          case 'A-':
            return 'bg-green-50 text-green-700 border border-green-100';
          case 'B+':
            return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
          case 'B':
            return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
          case 'B-':
            return 'bg-orange-50 text-orange-700 border border-orange-100';
          case 'C+':
          case 'C':
            return 'bg-red-50 text-red-700 border border-red-100';
          case 'C-':
          case 'D':
          case 'F':
            return 'bg-red-100 text-red-800 border border-red-200';
          default:
            return '';
        }
      };
      
        return (
          <div className="flex items-center gap-1">
            <span className={`inline-block px-3 py-1.5 rounded-full font-semibold text-sm ${getRatingColor(value)} ${!canAccessFeature() ? 'blur-sm' : ''} `}>
              {value}
            </span>
            {!canAccessFeature() &&(
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push('/pricing');
                    }}
                    className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Crown className="h-4 w-4 text-yellow-500"/>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">Upgrade to Pro to see ratings</p>
                    <p className="text-sm text-gray-500">Get access to our proprietary rating system that helps identify the best options opportunities</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>)}
          </div>
        );
    
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
    
    case 'probability':
      return value ? `${(value * 100).toFixed(1)}%` : 'N/A';
      
    default:
      return String(value);
  };
};

interface OptionsTableProps {
  data: Option[];
  onSort: (field: string) => void;
  sortConfig?: { field: keyof Option; direction: 'asc' | 'desc' | null };
  visibleColumns: string[];
}

export function OptionsTable({ data, onSort, visibleColumns }: OptionsTableProps) {
  const searchParams = useSearchParams();
  const sortColumn = searchParams.get('sortBy');
  const sortDirection = searchParams.get('sortDir');  

  const handleStarClick = () => {
    toast.success("Watchlist feature is coming soon!");
    sendAnalyticsEvent({
      event_name: 'watchlist',
      event_category: 'Feature',
    });
  };

  return (
    <div>
      <div className="rounded-md border">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b">
                <td className="text-right w-[50px] p-2 md:p-2.5">
                    <Star 
                      className="h-4 w-4 text-yellow-400 mx-auto cursor-pointer hover:text-yellow-500 transition-colors" 
                      onClick={handleStarClick}
                    />
                  </td>
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
                  <td className="text-right w-[50px] p-2 md:p-2.5">
                    <Star 
                      className="h-4 w-4 text-yellow-400 mx-auto cursor-pointer hover:text-yellow-500 transition-colors" 
                      onClick={handleStarClick}
                    />
                  </td>
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