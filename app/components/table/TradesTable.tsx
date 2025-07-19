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

interface TradesTableProps {
  trades: Trade[];
  onRequestCloseTrade: (trade: Trade) => void;
  onRequestEditTrade: (trade: Trade) => void;
  onRequestDeleteTrade: (trade: Trade) => void;
}

export function TradesTable({ trades, onRequestCloseTrade, onRequestEditTrade, onRequestDeleteTrade }: TradesTableProps) {
  const isClosedTradesTable = trades.length > 0 && trades[0].status === 'closed';

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Strike</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Contracts</TableHead>
            <TableHead>Premium (per contract)</TableHead>
            {isClosedTradesTable && <TableHead>Closing Cost</TableHead>}
            <TableHead>
              {isClosedTradesTable ? 'Final Premium Collected' : 'Potential Premium'}
            </TableHead>
            {isClosedTradesTable && <TableHead>Profit/Loss</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Open Date</TableHead>
            {isClosedTradesTable && <TableHead>Close Date</TableHead>}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const finalPremium = trade.premium - (typeof trade.closingCost === 'number' ? trade.closingCost : 0);
            const totalFinalPremium = finalPremium * (trade.contracts ?? 1);
            const isProfitable = finalPremium > 0;
            
            return (
              <TableRow key={trade.id}>
                <TableCell className="font-medium">{trade.symbol}</TableCell>
                <TableCell>{trade.type}</TableCell>
                <TableCell>${trade.strike.toFixed(2)}</TableCell>
                <TableCell>{format(parseISO(trade.expiration), 'MMM d, yyyy')}</TableCell>
                <TableCell>{trade.contracts ?? 1}</TableCell>
                <TableCell>${trade.premium.toFixed(2)}</TableCell>
                {isClosedTradesTable && (
                  <TableCell>
                    {typeof trade.closingCost === 'number' ? `$${trade.closingCost.toFixed(2)}` : '-'}
                  </TableCell>
                )}
                <TableCell>
                  <span className={`font-medium ${
                    isClosedTradesTable 
                      ? (isProfitable ? 'text-green-600' : 'text-red-600')
                      : 'text-gray-900'
                  }`}>
                    ${totalFinalPremium.toFixed(2)}
                  </span>
                </TableCell>
                {isClosedTradesTable && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {isProfitable ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        isProfitable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${finalPremium.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trade.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {trade.status}
                  </span>
                </TableCell>
                <TableCell>{format(parseISO(trade.openDate), 'MMM d, yyyy')}</TableCell>
                {isClosedTradesTable && (
                  <TableCell>{trade.closeDate ? format(parseISO(trade.closeDate), 'MMM d, yyyy') : '-'}</TableCell>
                )}
                <TableCell className="flex items-center justify-end gap-2 min-w-[200px]">
                  {trade.status === 'open' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRequestCloseTrade(trade)}
                    >
                      Close
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRequestEditTrade(trade)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRequestDeleteTrade(trade)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
