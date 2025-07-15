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
  onCloseTrade: (id: string) => void;
}

export function TradesTable({ trades, onCloseTrade }: TradesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Strike</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Premium</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Open Date</TableHead>
            <TableHead>Close Date</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>{trade.symbol}</TableCell>
              <TableCell>{trade.type}</TableCell>
              <TableCell>${trade.strike.toFixed(2)}</TableCell>
              <TableCell>{format(parseISO(trade.expiration), 'MMM d, yyyy')}</TableCell>
              <TableCell>${trade.premium.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trade.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {trade.status}
                </span>
              </TableCell>
              <TableCell>{format(parseISO(trade.openDate), 'MMM d, yyyy')}</TableCell>
              <TableCell>{trade.closeDate ? format(parseISO(trade.closeDate), 'MMM d, yyyy') : '-'}</TableCell>
              <TableCell>
                {trade.status === 'open' && (
                  <Button variant="outline" size="sm" onClick={() => onCloseTrade(trade.id)}>
                    Close
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
