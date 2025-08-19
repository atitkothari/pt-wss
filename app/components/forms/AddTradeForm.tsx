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
import { FormErrorBoundary } from '../FormErrorBoundary';

interface AddTradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'status' | 'openDate' | 'closeDate'>) => void;
}

export function AddTradeForm({ onSubmit }: AddTradeFormProps) {
  const [symbol, setSymbol] = useState('');
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [showExpirationDropdown, setShowExpirationDropdown] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedExpiration, setSelectedExpiration] = useState<string>('');
  const [manualExpiration, setManualExpiration] = useState<string>('');
  const [availableStrikePrices, setAvailableStrikePrices] = useState<number[]>([]);
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  const [manualStrike, setManualStrike] = useState<string>('');
  const [showStrikeDropdown, setShowStrikeDropdown] = useState(false);
  const [premium, setPremium] = useState(0);
  const [optionKey, setOptionKey] = useState<string | undefined>(undefined);
  const [numContracts, setNumContracts] = useState<number | ''>(1);
  const [selectedType, setSelectedType] = useState<'call' | 'put'>('call');
  const { symbols: allSymbols } = useSymbols();
  const { user } = useAuth();
  const userId = user?.uid;

  // Function to generate option key in format: SYMBOL + EXPIRATION + TYPE + STRIKE
  const generateOptionKey = (symbol: string, expiration: string, type: string, strike: number): string => {
    // Format expiration as DDMMYY (e.g., "2024-12-19" becomes "191224")
    const date = new Date(expiration);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const formattedExpiration = day + month + year;
    
    // Format strike as 8-digit number (e.g., 25.00 becomes 00002500)
    const formattedStrike = Math.round(strike * 100).toString().padStart(8, '0');
    
    // Type is already 'C' for call or 'P' for put
    const optionType = type === 'call' ? 'C' : 'P';
    
    return `${symbol}${formattedExpiration}${optionType}${formattedStrike}`;
  };

  useEffect(() => {
    if (symbol.length > 0) {
      setFilteredSymbols(
        allSymbols.filter(s => s.toLowerCase().startsWith(symbol.toLowerCase()))
      );
      setShowSymbolDropdown(true);
    } else {
      setFilteredSymbols([]);
      setShowSymbolDropdown(false);
    }
    // Reset all fields when symbol changes
    setContracts([]);
    setSelectedExpiration('');
    setManualExpiration('');
    setAvailableStrikePrices([]);
    setSelectedStrike(null);
    setManualStrike('');
    setPremium(0);
  }, [symbol, allSymbols]);

  // Reset all fields when type changes
  useEffect(() => {
    setContracts([]);
    setSymbol('');
    setFilteredSymbols([]);
    setShowSymbolDropdown(false);
    setSelectedExpiration('');
    setAvailableStrikePrices([]);
    setSelectedStrike(null);
    setPremium(0);
  }, [selectedType]);

  const handleSymbolSelect = async (selectedSymbol: string) => {    
    setSymbol(selectedSymbol);

    setFilteredSymbols([]);
    setShowSymbolDropdown(false);
    // Reset all fields when symbol is selected
    setContracts([]);
    setSelectedExpiration('');
    setManualExpiration('');
    setAvailableStrikePrices([]);
    setSelectedStrike(null);
    setManualStrike('');
    setPremium(0);
    const response = await fetch(`/api/options?symbol=${selectedSymbol}&userId=${userId}`);
    const data = await response.json();
    setContracts(data.options);
  };

  useEffect(() => {
    if (selectedExpiration || manualExpiration) {
      const currentExpiration = selectedExpiration || manualExpiration;
      const strikes = contracts
        .filter(c => c.expiration === currentExpiration)
        .map(c => c.strike);
      setAvailableStrikePrices([...new Set(strikes)] as number[]);
      // Reset strike and premium when expiration changes
      setSelectedStrike(null);
      setManualStrike('');
      setPremium(0);
    } else {
      setAvailableStrikePrices([]);
      setSelectedStrike(null);
      setManualStrike('');
      setPremium(0);
    }
  }, [selectedExpiration, manualExpiration, contracts]);

  useEffect(() => {
    if ((selectedStrike || manualStrike) && (selectedExpiration || manualExpiration)) {
      const currentExpiration = selectedExpiration || manualExpiration;
      const currentStrike = selectedStrike || (manualStrike ? parseFloat(manualStrike) : null);
      
      if (currentStrike) {
        const contract = contracts.find(c => c.expiration === currentExpiration && c.strike === currentStrike && c.type === selectedType);
        if (contract) {
          setPremium(contract.bidPrice * 100);
          // Use contract's optionKey if available, otherwise generate one
          if (contract.optionKey) {
            setOptionKey(contract.optionKey);
          } else {
            const generatedKey = generateOptionKey(symbol, currentExpiration, selectedType, currentStrike);
      
            setOptionKey(generatedKey);
          }
        } else {
          setPremium(0);
          // Generate option key even when no contract is found
          const generatedKey = generateOptionKey(symbol, currentExpiration, selectedType, currentStrike);
  
          setOptionKey(generatedKey);
        }
      }
    } else {
      setPremium(0);
      setOptionKey(undefined);
    }
  }, [selectedStrike, manualStrike, selectedExpiration, manualExpiration, contracts, selectedType, symbol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((selectedStrike || manualStrike) && (selectedExpiration || manualExpiration)) {
      const currentExpiration = selectedExpiration || manualExpiration;
      const currentStrike = selectedStrike || (manualStrike ? parseFloat(manualStrike) : null);
      
      if (currentStrike) {
        const contract = filteredContracts.find(c => c.expiration === currentExpiration && c.strike === currentStrike);
        onSubmit({
          symbol,
          type: selectedType,
          strike: currentStrike,
          expiration: currentExpiration,
          premium,
          contracts: typeof numContracts === 'number' ? numContracts : 1,
          optionKey: optionKey
        });
      }
    }
  };

  const filteredContracts = contracts.filter(c => c.type === selectedType);
  const expirationDates = [...new Set(filteredContracts.map(c => c.expiration))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <FormErrorBoundary errorMessage="There was an error with the trade form. Please check your input and try again.">
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Type</Label>
        <Select value={selectedType} onValueChange={val => setSelectedType(val as 'call' | 'put')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">Covered Call</SelectItem>
            <SelectItem value="put">Cash-Secured Put</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="symbol">Stock Symbol</Label>
        <Input
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          autoComplete="off"
        />
        {(showSymbolDropdown && filteredSymbols.length > 0)? (
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
        ): null}
      </div>      
      {filteredContracts.length > 0 && (
        <div>
          <Label>Expiration Date</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Select or enter expiration date (YYYY-MM-DD)"
              value={selectedExpiration || manualExpiration}
              onChange={(e) => {
                const value = e.target.value;
                // If it matches a dropdown option, use selectedExpiration
                if (expirationDates.includes(value)) {
                  setSelectedExpiration(value);
                  setManualExpiration('');
                } else {
                  // Otherwise, treat as manual input
                  setManualExpiration(value);
                  setSelectedExpiration('');
                }
              }}
              onFocus={() => setShowExpirationDropdown(true)}
              onBlur={() => setTimeout(() => setShowExpirationDropdown(false), 200)}
            />
            {showExpirationDropdown && expirationDates.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {expirationDates.map(date => (
                  <div
                    key={date as string}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSelectedExpiration(date as string);
                      setManualExpiration('');
                      setShowExpirationDropdown(false);
                    }}
                  >
                    {date as string}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(availableStrikePrices.length > 0 || (selectedExpiration || manualExpiration)) && (
        <div>
          <Label>Strike Price</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Select or enter strike price"
              value={selectedStrike ? String(selectedStrike) : manualStrike}
              onChange={(e) => {
                const value = e.target.value;
                if(value.length === 0) {
                  setShowStrikeDropdown(true)
                }else{
                  setShowStrikeDropdown(false)
                }
                // If it matches a dropdown option, use selectedStrike
                if (availableStrikePrices.includes(parseFloat(value))) {
                  setSelectedStrike(parseFloat(value));
                  setManualStrike('');
                } else {
                  // Otherwise, treat as manual input
                  setManualStrike(value);
                  setSelectedStrike(null);
                }
              }}
              onFocus={() => setShowStrikeDropdown(true)}
              onBlur={() => setTimeout(() => setShowStrikeDropdown(false), 200)}
            />
            {showStrikeDropdown && availableStrikePrices.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {availableStrikePrices.sort((a, b) => a - b).map(strike => {
                  const contract = filteredContracts.find(c => c.expiration === (selectedExpiration || manualExpiration) && c.strike === strike && c.type === selectedType);
                  return (
                    <div
                      key={strike}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSelectedStrike(strike);
                        setManualStrike('');
                        setShowStrikeDropdown(false);
                      }}
                    >
                      ${strike}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {((selectedStrike && selectedStrike > 0) || (manualStrike && parseFloat(manualStrike) > 0)) && (
        <>
          <div>
            <Label htmlFor="numContracts">Number of Contracts</Label>
            <Input
              id="numContracts"
              type="number"
              min="1"
              step="1"
              value={numContracts}
              onChange={e => {
                const value = e.target.value;
                if (value === '') {
                  setNumContracts('');
                } else {
                  const num = parseInt(value);
                  if (!isNaN(num) && num > 0) {
                    setNumContracts(num);
                  }
                }
              }}
              required
            />
          </div>
          <div>
            <Label htmlFor="premium">Premium (per contract)</Label>
            <Input
              id="premium"
              type="number"
              value={premium}
              onChange={(e) => setPremium(Number(e.target.value))}
            />
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total Premium:</span> ${(premium * (typeof numContracts === 'number' ? numContracts : 0)).toFixed(2)}
          </div>
        </>
      )}

      <Button type="submit" disabled={!((selectedStrike && selectedStrike > 0) || (manualStrike && parseFloat(manualStrike) > 0)) || !(selectedExpiration || manualExpiration) || typeof numContracts !== 'number' || numContracts < 1}>Add Trade</Button>
      </form>
    </FormErrorBoundary>
  );
}
