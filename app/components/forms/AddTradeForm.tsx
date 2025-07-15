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
import { useAuth } from '@/app/context/AuthContext';

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
  const [selectedType, setSelectedType] = useState<'call' | 'put'>('call');
  const { symbols: allSymbols } = useSymbols();
  const { user } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    if (symbol.length > 0) {
      setFilteredSymbols(
        allSymbols.filter(s => s.toLowerCase().startsWith(symbol.toLowerCase()))
      );
    } else {
      setFilteredSymbols([]);
    }
    // Reset all fields when symbol changes
    setContracts([]);
    setSelectedExpiration('');
    setAvailableStrikePrices([]);
    setSelectedStrike(null);
    setPremium(0);
  }, [symbol, allSymbols]);

  // Reset all fields when type changes
  useEffect(() => {
    setContracts([]);
    setSymbol('');
    setFilteredSymbols([]);
    setSelectedExpiration('');
    setAvailableStrikePrices([]);
    setSelectedStrike(null);
    setPremium(0);
  }, [selectedType]);

  const handleSymbolSelect = async (selectedSymbol: string) => {
    setSymbol(selectedSymbol);
    setFilteredSymbols([]);
    // Reset all fields when symbol is selected
    setContracts([]);
    setSelectedExpiration('');
    setAvailableStrikePrices([]);
    setSelectedStrike(null);
    setPremium(0);
    const response = await fetch(`/api/options?symbol=${selectedSymbol}&userId=${userId}`);
    const data = await response.json();
    setContracts(data.options);
  };

  useEffect(() => {
    if (selectedExpiration) {
      const strikes = contracts
        .filter(c => c.expiration === selectedExpiration)
        .map(c => c.strike);
      setAvailableStrikePrices([...new Set(strikes)] as number[]);
      // Reset strike and premium when expiration changes
      setSelectedStrike(null);
      setPremium(0);
    } else {
      setAvailableStrikePrices([]);
      setSelectedStrike(null);
      setPremium(0);
    }
  }, [selectedExpiration, contracts]);

  useEffect(() => {
    if (selectedStrike && selectedExpiration) {
      const contract = contracts.find(c => c.expiration === selectedExpiration && c.strike === selectedStrike && c.type === selectedType);
      if (contract) {
        setPremium(contract.bidPrice * 100);
      } else {
        setPremium(0);
      }
    } else {
      setPremium(0);
    }
  }, [selectedStrike, selectedExpiration, contracts, selectedType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStrike && selectedExpiration) {
        const contract = filteredContracts.find(c => c.expiration === selectedExpiration && c.strike === selectedStrike);
      onSubmit({
        symbol,
        type: selectedType,
        strike: selectedStrike,
        expiration: selectedExpiration,
        premium,
      });
    }
  };

  const filteredContracts = contracts.filter(c => c.type === selectedType);
  const expirationDates = [...new Set(filteredContracts.map(c => c.expiration))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

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

      <div>
        <Label>Type</Label>
        <Select value={selectedType} onValueChange={val => setSelectedType(val as 'call' | 'put')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="put">Put</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredContracts.length > 0 && (
        <div>
          <Label>Expiration Date</Label>
          <Select onValueChange={setSelectedExpiration} value={selectedExpiration}>
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
      )}

      {availableStrikePrices.length > 0 && (
        <div>
          <Label>Strike Price</Label>
          <Select onValueChange={(value) => setSelectedStrike(Number(value))} value={selectedStrike ? String(selectedStrike) : undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select a strike price" />
            </SelectTrigger>
            <SelectContent>
              {availableStrikePrices.sort((a, b) => a - b).map(strike => {
                const contract = filteredContracts.find(c => c.expiration === selectedExpiration && c.strike === strike && c.type=== selectedType);
                const currentPrice = contract?.stockPrice;                
                return (
                  <SelectItem key={strike} value={String(strike)}>
                    ${strike}                    
                  </SelectItem>
                );
              })}
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
