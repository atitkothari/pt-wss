'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trade } from '@/app/types/trade';
import { useSymbols } from '@/app/hooks/useSymbols';

interface AddTradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'status' | 'openDate' | 'closeDate'>) => void;
}

export function AddTradeForm({ onSubmit }: AddTradeFormProps) {
  const [symbol, setSymbol] = useState('');
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedExpiration, setSelectedExpiration] = useState<string>('');
  const [availableStrikePrices, setAvailableStrikePrices] = useState<number[]>([]);
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  const [premium, setPremium] = useState(0);
  const { symbols: allSymbols } = useSymbols();

  useEffect(() => {
    if (symbol.length > 0) {
      setFilteredSymbols(
        allSymbols.filter(s => s.toLowerCase().startsWith(symbol.toLowerCase()))
      );
    } else {
      setFilteredSymbols([]);
    }
  }, [symbol, allSymbols]);

  const handleSymbolSelect = async (selectedSymbol: string) => {
    setSymbol(selectedSymbol);
    setFilteredSymbols([]);
    const response = await fetch(`/api/options?symbol=${selectedSymbol}`);
    const data = await response.json();
    setContracts(data.options);
  };

  useEffect(() => {
    if (selectedExpiration) {
      const strikes = contracts
        .filter(c => c.expiration === selectedExpiration)
        .map(c => c.strike);
      setAvailableStrikePrices([...new Set(strikes)] as number[]);
    } else {
      setAvailableStrikePrices([]);
    }
  }, [selectedExpiration, contracts]);

  useEffect(() => {
    if (selectedStrike && selectedExpiration) {
      const contract = contracts.find(c => c.expiration === selectedExpiration && c.strike === selectedStrike);
      if (contract) {
        setPremium(contract.bidPrice * 100);
      }
    }
  }, [selectedStrike, selectedExpiration, contracts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStrike && selectedExpiration) {
        const contract = contracts.find(c => c.expiration === selectedExpiration && c.strike === selectedStrike);
      onSubmit({
        symbol,
        type: contract.type,
        strike: selectedStrike,
        expiration: selectedExpiration,
        premium,
      });
    }
  };

  const expirationDates = [...new Set(contracts.map(c => c.expiration))];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="symbol">Stock Symbol</Label>
        <Input
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          autoComplete="off"
        />
        {filteredSymbols.length > 0 && (
          <ul className="border rounded-md mt-1 max-h-60 overflow-y-auto">
            {filteredSymbols.slice(0, 10).map(s => (
              <li
                key={s}
                onClick={() => handleSymbolSelect(s)}
                className="p-2 cursor-pointer hover:bg-gray-100"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {contracts.length > 0 && (
        <>
          <div>
            <Label>Expiration Date</Label>
            <Select onValueChange={setSelectedExpiration}>
              <SelectTrigger>
                <SelectValue placeholder="Select an expiration date" />
              </SelectTrigger>
              <SelectContent>
                {expirationDates.map(date => (
                  <SelectItem key={date as string} value={date as string}>
                    {date as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {availableStrikePrices.length > 0 && (
          <div>
            <Label>Strike Price</Label>
            <Select onValueChange={(value) => setSelectedStrike(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a strike price" />
              </SelectTrigger>
              <SelectContent>
                {availableStrikePrices.map(strike => (
                  <SelectItem key={strike} value={String(strike)}>
                    {strike}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      )}

      {selectedStrike && (
        <div>
          <Label htmlFor="premium">Premium</Label>
          <Input
            id="premium"
            type="number"
            value={premium}
            onChange={(e) => setPremium(Number(e.target.value))}
          />
        </div>
      )}

      <Button type="submit" disabled={!selectedStrike}>Add Trade</Button>
    </form>
  );
}
