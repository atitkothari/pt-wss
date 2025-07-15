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

interface TradesTableProps {
  trades: Trade[];
  onRequestCloseTrade: (trade: Trade) => void;
  onRequestEditTrade: (trade: Trade) => void;
  onRequestDeleteTrade: (trade: Trade) => void;
}

export function TradesTable({ trades, onRequestCloseTrade, onRequestEditTrade, onRequestDeleteTrade }: TradesTableProps) {
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
            <TableHead>Closing Cost</TableHead>
            <TableHead>Final Premium Collected</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Open Date</TableHead>
            <TableHead>Close Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>{trade.symbol}</TableCell>
              <TableCell>{trade.type}</TableCell>
              <TableCell>${trade.strike.toFixed(2)}</TableCell>
              <TableCell>{format(parseISO(trade.expiration), 'MMM d, yyyy')}</TableCell>
              <TableCell>{trade.contracts ?? 1}</TableCell>
              <TableCell>
                {trade.status === 'closed' && typeof trade.closingCost === 'number' && trade.closingCost > 0 ? (
                  <span className="text">${trade.premium.toFixed(2)}</span>
                ) : (
                  <>${trade.premium.toFixed(2)}</>
                )}
              </TableCell>
              <TableCell>
                {typeof trade.closingCost === 'number' ? `$${trade.closingCost.toFixed(2)}` : '-'}
              </TableCell>
              <TableCell>
                ${(
                  (trade.premium - (typeof trade.closingCost === 'number' ? trade.closingCost : 0)) * (trade.contracts ?? 1)
                ).toFixed(2)}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trade.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {trade.status}
                </span>
              </TableCell>
              <TableCell>{format(parseISO(trade.openDate), 'MMM d, yyyy')}</TableCell>
              <TableCell>{trade.closeDate ? format(parseISO(trade.closeDate), 'MMM d, yyyy') : '-'}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
