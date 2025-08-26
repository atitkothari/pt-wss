"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Trade } from "@/app/types/trade";
import { useSymbols } from "@/app/hooks/useSymbols";
import { useAuth } from "@/app/context/AuthContext";
import { FormErrorBoundary } from "../FormErrorBoundary";

interface AddTradeFormProps {
  onSubmit: (
    trade: Omit<Trade, "id" | "status" | "openDate" | "closeDate">
  ) => void;
}

export function AddTradeForm({ onSubmit }: AddTradeFormProps) {
  const [symbol, setSymbol] = useState("");
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [selectedExpiration, setSelectedExpiration] = useState<
    Date | undefined
  >(undefined);
  const [manualExpiration, setManualExpiration] = useState<string>("");
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  const [manualStrike, setManualStrike] = useState<string>("");
  const [showStrikeDropdown, setShowStrikeDropdown] = useState(false);
  const [premium, setPremium] = useState<number | "">(0);
  const [optionKey, setOptionKey] = useState<string | undefined>(undefined);
  const [numContracts, setNumContracts] = useState<number | "">(1);
  const [selectedType, setSelectedType] = useState<"call" | "put">("call");
  const { symbols: allSymbols } = useSymbols();
  const { user } = useAuth();
  const userId = user?.uid;

  // Helper function to format date to yyyy-mm-dd
  const formatDateToYYYYMMDD = (date: string | Date): string => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return "";
      }
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      return "";
    }
  };

  // Helper function to format partial date input in real-time
  const formatPartialDate = (input: string): string => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, "");

    if (numbers.length === 0) return "";
    if (numbers.length <= 4) return numbers; // Just year
    if (numbers.length <= 6)
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`; // Year-month
    if (numbers.length <= 8)
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(
        6
      )}`; // Year-month-day

    // If more than 8 digits, truncate to 8
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(
      6,
      8
    )}`;
  };

  // Function to generate option key in format: SYMBOL + EXPIRATION + TYPE + STRIKE
  const generateOptionKey = (
    symbol: string,
    expiration: string, // "YYYY-MM-DD"
    type: "call" | "put",
    strike: number
  ): string => {
    const [year, month, day] = expiration.split("-");
    const formattedExpiration = year.slice(-2) + month + day;

    // Universal OCC-style: always keep 3 decimals
    const formattedStrike = Math.round(strike * 1000)
      .toString()
      .padStart(8, "0");

    const optionType = type === "call" ? "C" : "P";

    return `${symbol}${formattedExpiration}${optionType}${formattedStrike}`;
  };

  useEffect(() => {
    if (symbol.length > 0) {
      setFilteredSymbols(
        allSymbols.filter((s) =>
          s.toLowerCase().startsWith(symbol.toLowerCase())
        )
      );
      setShowSymbolDropdown(true);
    } else {
      setFilteredSymbols([]);
      setShowSymbolDropdown(false);
    }
    // Reset all fields when symbol changes
    setSelectedExpiration(undefined);
    setManualExpiration("");
    setSelectedStrike(null);
    setManualStrike("");
    setPremium("");
  }, [symbol, allSymbols]);

  // Reset all fields when type changes
  useEffect(() => {
    setSymbol("");
    setFilteredSymbols([]);
    setShowSymbolDropdown(false);
    setSelectedExpiration(undefined);
    setSelectedStrike(null);
    setPremium("");
  }, [selectedType]);

  const handleSymbolSelect = async (selectedSymbol: string) => {
    setSymbol(selectedSymbol);

    setFilteredSymbols([]);
    setShowSymbolDropdown(false);
    // Reset all fields when symbol is selected
    setSelectedExpiration(undefined);
    setManualExpiration("");
    setSelectedStrike(null);
    setManualStrike("");
    setPremium("");
    // const response = await fetch(`/api/options?symbol=${selectedSymbol}&userId=${userId}`);
    // const data = await response.json();
    // setContracts(data.options);
  };

  useEffect(() => {
    if (
      (selectedStrike || manualStrike) &&
      (selectedExpiration || manualExpiration)
    ) {
      const currentExpiration = selectedExpiration || manualExpiration;
      const currentStrike =
        selectedStrike || (manualStrike ? parseFloat(manualStrike) : null);

      if (currentStrike) {
        // Ensure we're working with formatted dates
        const formattedExpiration = formatDateToYYYYMMDD(currentExpiration);

        const generatedKey = generateOptionKey(
          symbol,
          formattedExpiration,
          selectedType,
          currentStrike
        );

        setOptionKey(generatedKey);
      }
    } else {
      setPremium("");
      setOptionKey(undefined);
    }
  }, [
    selectedStrike,
    manualStrike,
    selectedExpiration,
    manualExpiration,
    selectedType,
    symbol,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (selectedStrike || manualStrike) &&
      (selectedExpiration || manualExpiration)
    ) {
      const currentExpiration = selectedExpiration || manualExpiration;
      const currentStrike =
        selectedStrike || (manualStrike ? parseFloat(manualStrike) : null);

      if (currentStrike) {
        // Ensure expiration date is formatted as yyyy-mm-dd
        const formattedExpiration = formatDateToYYYYMMDD(currentExpiration);
        onSubmit({
          symbol,
          type: selectedType,
          strike: currentStrike,
          expiration: formattedExpiration,
          premium: typeof premium === "number" ? premium : 0,
          contracts: typeof numContracts === "number" ? numContracts : 1,
          optionKey: optionKey,
        });
      }
    }
  };

  return (
    <FormErrorBoundary errorMessage="There was an error with the trade form. Please check your input and try again.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Type</Label>
          <Select
            value={selectedType}
            onValueChange={(val) => setSelectedType(val as "call" | "put")}
          >
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
          {showSymbolDropdown && filteredSymbols.length > 0 ? (
            <ul className="border rounded-md mt-1 max-h-60 overflow-y-auto">
              {filteredSymbols.slice(0, 10).map((s) => (
                <li
                  key={s}
                  onClick={() => handleSymbolSelect(s)}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                >
                  {s}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <Label>Expiration Date</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Select or enter expiration date (YYYY-MM-DD)"
              value={
                selectedExpiration
                  ? format(selectedExpiration, "yyyy-MM-dd")
                  : manualExpiration
              }
              onChange={(e) => {
                const value = e.target.value;
                //format it as I type
                const formattedValue = formatPartialDate(value);
                setManualExpiration(formattedValue);
                setSelectedExpiration(undefined);
              }}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedExpiration}
                  onSelect={(date) => {
                    setSelectedExpiration(date);
                    setManualExpiration("");
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label>Strike Price</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Select or enter strike price"
              value={selectedStrike ? String(selectedStrike) : manualStrike}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length === 0) {
                  setShowStrikeDropdown(true);
                } else {
                  setShowStrikeDropdown(false);
                }
                setManualStrike(value);
                setSelectedStrike(null);
              }}
              onFocus={() => setShowStrikeDropdown(true)}
              onBlur={() => setTimeout(() => setShowStrikeDropdown(false), 200)}
            />
          </div>
        </div>
        <>
          <div>
            <Label htmlFor="numContracts">Number of Contracts</Label>
            <Input
              id="numContracts"
              type="number"
              min="1"
              step="1"
              value={numContracts}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setNumContracts("");
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
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setPremium("");
                } else {
                  setPremium(Number(value));
                }
              }}
            />
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total Premium:</span> $
            {(typeof premium === "number"
              ? premium * (typeof numContracts === "number" ? numContracts : 0)
              : 0
            ).toFixed(2)}
          </div>
        </>

        <Button
          type="submit"
          disabled={
            !(
              (selectedStrike && selectedStrike > 0) ||
              (manualStrike && parseFloat(manualStrike) > 0)
            ) ||
            !(
              selectedExpiration ||
              (manualExpiration && manualExpiration.trim() !== "")
            ) ||
            typeof numContracts !== "number" ||
            numContracts < 1
          }
        >
          Add Trade
        </Button>
      </form>
    </FormErrorBoundary>
  );
}
