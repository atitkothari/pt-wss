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
  const [selectedContract, setSelectedContract] = useState<any>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContract) {
      onSubmit({
        symbol,
        type: selectedContract.type,
        strike: selectedContract.strike,
        expiration: selectedContract.expiration,
        premium,
      });
    }
  };

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
            <Label>Contract Type</Label>
            <Select onValueChange={(value) => {
              const filtered = contracts.filter(c => c.type === value);
              setContracts(filtered);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="put">Put</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Contract</Label>
            <Select onValueChange={(value) => {
              const contract = contracts.find(c => c.id === value);
              setSelectedContract(contract);
              setPremium(contract.bidPrice * 100);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a contract" />
              </SelectTrigger>
              <SelectContent>
                {contracts.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.strike} {c.type} - Exp: {c.expiration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {selectedContract && (
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

      <Button type="submit" disabled={!selectedContract}>Add Trade</Button>
    </form>
  );
}
