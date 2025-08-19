'use client';

import { Trade } from '@/app/types/trade';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TableErrorBoundary } from '../TableErrorBoundary';

interface TradeWithUnrealizedPL extends Trade {
  unrealizedPL?: number;
  currentPrice?: number;
  unrealizedPLPercent?: number;
  currentStockPrice?:number;
}

interface TradesTableProps {
  trades: TradeWithUnrealizedPL[];
  onRequestCloseTrade: (trade: Trade) => void;
  onRequestEditTrade: (trade: Trade) => void;
  onRequestDeleteTrade: (trade: Trade) => void;
}

export function TradesTable({ trades, onRequestCloseTrade, onRequestEditTrade, onRequestDeleteTrade }: TradesTableProps) {
  const isClosedTradesTable = trades.length > 0 && (trades[0].status === 'closed' || trades[0].status === 'assigned' || trades[0].status === 'expired');

  return (
    <TableErrorBoundary tableName="Trades Table">
      <div className="rounded-md border overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[70px] text-xs sm:text-sm">Symbol</TableHead>
            {!isClosedTradesTable &&<TableHead className="w-[70px] text-xs sm:text-sm">Current Price</TableHead>}
            <TableHead className="w-[50px] text-xs sm:text-sm">Qty</TableHead>
            {!isClosedTradesTable && <TableHead className="w-[70px] text-xs sm:text-sm">Contract price when bought</TableHead>}
            {!isClosedTradesTable && <TableHead className="w-[80px] text-xs sm:text-sm">Current Contract Price</TableHead>}
            {/* {!isClosedTradesTable && <TableHead className="w-[80px] text-xs sm:text-sm">P/L</TableHead>} */}
            {isClosedTradesTable && <TableHead className="w-[70px] text-xs sm:text-sm">Premium Collected</TableHead>}
            {isClosedTradesTable && <TableHead className="w-[70px] text-xs sm:text-sm">Close Cost</TableHead>}
            <TableHead className="w-[80px] text-xs sm:text-sm">
              P/L
            </TableHead>
            {!isClosedTradesTable && <TableHead className="w-[70px] text-xs sm:text-sm">Premium Collected</TableHead>}

            {/* {isClosedTradesTable && <TableHead className="w-[60px] text-xs sm:text-sm">P/L</TableHead>} */}
            <TableHead className="w-[60px] text-xs sm:text-sm">Status</TableHead>
            <TableHead className="w-[60px] text-xs sm:text-sm">Exp</TableHead>
            {isClosedTradesTable && <TableHead className="w-[60px] text-xs sm:text-sm">Closed On</TableHead>}
            
            <TableHead className="w-[100px] text-xs sm:text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const finalPremium = (trade.premium - (typeof trade.closingCost === 'number' ? trade.closingCost : 0));
            const totalFinalPremium = finalPremium * (trade.contracts ?? 1);
            const isProfitable = finalPremium > 0;
            
            return (
              <TableRow key={trade.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-xs sm:text-sm">{trade.symbol} (${trade.strike.toFixed(2)}{trade.type=="call"?"C":"P"})</TableCell>                                
                {!isClosedTradesTable &&<TableCell className="text-xs sm:text-sm">${trade.currentStockPrice??'-'}</TableCell>}
                <TableCell className="text-xs sm:text-sm">{trade.contracts ?? 1}</TableCell>
                {isClosedTradesTable && <TableCell className="text-xs sm:text-sm">${(trade.premium*(trade.contracts??1)).toFixed(2)}</TableCell>}
                {!isClosedTradesTable && <TableCell className="text-xs sm:text-sm">${trade.premium.toFixed(2)}</TableCell>}
                {!isClosedTradesTable && (
                  <TableCell className="text-xs sm:text-sm">
                    {trade.currentPrice !== undefined ? (
                      <span className="font-medium">${trade.currentPrice.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                )}                
                {!isClosedTradesTable && (
                  <TableCell className="text-xs sm:text-sm">
                    {trade.unrealizedPL !== undefined ? (
                      <div className="flex items-center gap-1">
                        {trade.unrealizedPL >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`font-medium ${trade.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${trade.unrealizedPL.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                )}
                {!isClosedTradesTable && <TableCell className="text-xs sm:text-sm">${(trade.premium*(trade.contracts??1)).toFixed(2)}</TableCell>}
                {isClosedTradesTable && (
                  <TableCell className="text-xs sm:text-sm">
                    {typeof trade.closingCost === 'number' ? `$${(trade.closingCost*(trade.contracts??1)).toFixed(2)}` : '-'}
                  </TableCell>
                )}
                {isClosedTradesTable && (<TableCell className="text-xs sm:text-sm">
                  <span className={`font-medium ${
                    isClosedTradesTable 
                      ? (isProfitable ? 'text-green-600' : 'text-red-600')
                      : 'text-gray-900'
                  }`}>
                    ${totalFinalPremium.toFixed(2)}
                  </span>
                </TableCell>)}
                 {/* {isClosedTradesTable && ( 
                  <TableCell className="text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      {isProfitable ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        isProfitable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${finalPremium.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                )} */}
                <TableCell>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    trade.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : trade.status === 'assigned'
                      ? 'bg-purple-100 text-purple-800'
                      : trade.status === 'expired'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {trade.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs sm:text-sm">{format(parseISO(trade.expiration), 'MM/dd')}</TableCell>
                {isClosedTradesTable && trade.closeDate && <TableCell className="text-xs sm:text-sm">{format(parseISO(trade.closeDate), 'MM/dd')}</TableCell>}
                <TableCell className="flex items-center gap-1">
                  {trade.status === 'open' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRequestCloseTrade(trade)}
                      className="h-6 px-1.5 text-xs"
                    >
                      Close
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRequestEditTrade(trade)}
                    className="h-6 px-1.5 text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRequestDeleteTrade(trade)}
                    className="h-6 px-1.5 text-xs"
                  >
                    Del
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </TableErrorBoundary>
  );
}
