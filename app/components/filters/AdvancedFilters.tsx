"use client";

import { useState } from 'react';
import { FilterInput } from "./FilterInput";
import { RangeSlider } from "./RangeSlider";
import { SingleValueSlider } from "./SingleValueSlider";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdvancedFiltersProps {
  peRatio: [number, number];
  onPeRatioChange: (value: [number, number]) => void;
  marketCap: [number, number];
  onMarketCapChange: (value: [number, number]) => void;
  movingAverageCrossover: string;
  onMovingAverageCrossoverChange: (value: string) => void;
  sector: string;
  onSectorChange: (value: string) => void;
  deltaFilter: [number, number];
  onDeltaFilterChange: (value: [number, number]) => void;
  minVol: number;
  onMinVolChange: (value: number) => void;
  handleKeyPress?: (e: React.KeyboardEvent) => void;
}

export function AdvancedFilters({
  peRatio,
  onPeRatioChange,
  marketCap,
  onMarketCapChange,
  movingAverageCrossover,
  onMovingAverageCrossoverChange,
  sector,
  onSectorChange,
  deltaFilter,
  onDeltaFilterChange,
  minVol,
  onMinVolChange,
  handleKeyPress
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sectors = [
    "All Sectors",
    "Basic Materials",
    "Communication Services",
    "Consumer Cyclical",
    "Consumer Defensive",
    "Energy",
    "Financial Services",
    "Healthcare",
    "Industrials",
    "Real Estate",
    "Technology",
    "Utilities"
  ];

  const movingAverageCrossoverOptions = [
    "Any",
    "200 > 50",
    "50 > 200"
  ];

  return (
    <div className="w-full border rounded-md p-3 mb-4 transition-all hover:border-gray-400">
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center p-0 h-auto mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-medium">Advanced Filters</span>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Button>

      {isExpanded && (
        <div className="space-y-4 mt-4 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <RangeSlider
              id="input_screener_pe_ratio"
              label="P/E Ratio"
              value={peRatio}
              minValue={peRatio[0]}
              maxValue={peRatio[1]}
              onChange={onPeRatioChange}
              min={0}
              max={100}
              step={0.1}
              tooltip="Price-to-Earnings ratio to filter stocks"
              className="col-span-1"
            />
            
            <RangeSlider
              id="input_screener_market_cap"
              label="Market Cap (B)"
              value={marketCap}
              minValue={marketCap[0]}
              maxValue={marketCap[1]}
              onChange={onMarketCapChange}
              min={0}
              max={1000}
              step={0.1}
              tooltip="Market capitalization in billions of dollars"
              formatValue={(val) => `$${val}B`}
              className="col-span-1"
            />
            
            <RangeSlider
              id="input_screener_delta"
              label="Delta"
              value={deltaFilter}
              minValue={deltaFilter[0]}
              maxValue={deltaFilter[1]}
              onChange={onDeltaFilterChange}
              min={-1}
              max={1}
              step={0.01}
              tooltip="Delta value (-1 to 1). Delta measures the rate of change of option price with respect to the underlying asset's price."
              className="col-span-1"
            />
            
            <SingleValueSlider
              id="input_screener_min_volume"
              label="Volume"
              value={minVol}
              onChange={onMinVolChange}
              min={0}
              max={10000}
              step={10}
              tooltip="Minimum trading volume to ensure liquidity"
              formatValue={(val) => val.toString()}
              className="col-span-1"
            />
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Moving Average</label>
              <Select 
                value={movingAverageCrossover} 
                onValueChange={onMovingAverageCrossoverChange}
              >
                <SelectTrigger id="input_screener_ma_crossover" className="h-10">
                  <SelectValue placeholder="Select MA Crossover" />
                </SelectTrigger>
                <SelectContent>
                  {movingAverageCrossoverOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-1">
                Filter by moving average crossover patterns
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Sector</label>
              <Select 
                value={sector} 
                onValueChange={onSectorChange}
              >
                <SelectTrigger id="input_screener_sector" className="h-10">
                  <SelectValue placeholder="Select Sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sectorOption) => (
                    <SelectItem key={sectorOption} value={sectorOption}>
                      {sectorOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-1">
                Filter stocks by industry sector
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}