"use client";

import { useState, useMemo, useEffect } from 'react';
import { FilterInput } from "./FilterInput";
import { RangeSlider } from "./RangeSlider";
import { SingleValueSlider } from "./SingleValueSlider";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { debounce } from "@/app/lib/debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  priceFilterConfig,
  volumeFilterConfig,
  deltaFilterConfig,
  peRatioFilterConfig,
  marketCapFilterConfig,
  movingAverageCrossoverOptions,
  sectorOptions
} from "@/app/config/filterConfig";

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
  volumeRange: [number, number];
  onVolumeRangeChange: (value: [number, number]) => void;
  handleKeyPress?: (e: React.KeyboardEvent) => void;
  // Add strike price filter props
  strikePrice: [number, number];
  onStrikePriceChange: (value: [number, number]) => void;
  // Optional prop to trigger search automatically
  autoSearch?: boolean;
  onSearch?: () => void;
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
  volumeRange,
  onVolumeRangeChange,
  handleKeyPress,
  // Add strike price filter props
  strikePrice,
  onStrikePriceChange,
  // Auto search props
  autoSearch = true,
  onSearch
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Create debounced search function
  const debouncedSearch = useMemo(
    () => onSearch && debounce(onSearch, 800),
    [onSearch]
  );

  // Trigger search when filters change
  useEffect(() => {
    if (autoSearch && debouncedSearch) {
      debouncedSearch();
    }
  }, [
    peRatio,
    marketCap,
    movingAverageCrossover,
    sector,
    deltaFilter,
    volumeRange,
    strikePrice,
    autoSearch,
    debouncedSearch
  ]);

  // Check if any filter has been modified from default values
  const hasModifiedFilters = useMemo(() => {
    // Check if PE Ratio has been modified
    const isPeRatioModified = 
      peRatio[0] !== peRatioFilterConfig.defaultMin || 
      peRatio[1] !== peRatioFilterConfig.defaultMax;
    
    // Check if Market Cap has been modified
    const isMarketCapModified = 
      marketCap[0] !== marketCapFilterConfig.defaultMin || 
      marketCap[1] !== marketCapFilterConfig.defaultMax;
    
    // Check if Moving Average Crossover has been modified
    const isMovingAverageModified = 
      movingAverageCrossover !== movingAverageCrossoverOptions[0];
    
    // Check if Sector has been modified
    const isSectorModified = 
      sector !== sectorOptions[0];
    
    // Check if Delta Filter has been modified
    const isDeltaModified = 
      deltaFilter[0] !== deltaFilterConfig.defaultMin || 
      deltaFilter[1] !== deltaFilterConfig.defaultMax;
    
    // Check if Volume Range has been modified
    const isVolumeModified = 
      volumeRange[0] !== volumeFilterConfig.min || 
      volumeRange[1] !== volumeFilterConfig.max;
    
    // Check if Strike Price has been modified
    const isStrikePriceModified = 
      strikePrice[0] !== priceFilterConfig.defaultMin || 
      strikePrice[1] !== priceFilterConfig.defaultMax;
    
    return isPeRatioModified || isMarketCapModified || isMovingAverageModified || 
           isSectorModified || isDeltaModified || isVolumeModified || isStrikePriceModified;
  }, [peRatio, marketCap, movingAverageCrossover, sector, deltaFilter, volumeRange, strikePrice]);

  return (
    <div className="w-full border rounded-md p-3 mb-4 transition-all hover:border-gray-400">
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center p-0 h-auto mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-primary">Advanced Filters</span>
          {hasModifiedFilters && !isExpanded && (
            <Badge variant="secondary" className="bg-blue-500 text-white h-2 w-2 p-0 rounded-full" />
          )}
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Button>

      {isExpanded && (
        <div className="space-y-4 mt-4 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Add Strike Price filter before P/E Ratio */}
            <RangeSlider
              id="input_screener_strike_price"
              label="Strike Price ($)"
              value={strikePrice}
              minValue={strikePrice[0]}
              maxValue={strikePrice[1]}
              onChange={onStrikePriceChange}
              min={priceFilterConfig.min}
              max={priceFilterConfig.max}
              step={priceFilterConfig.step}
              tooltip={priceFilterConfig.tooltip}
              formatValue={(val) => `$${val}`}
              className="col-span-1"
            />
            
            <RangeSlider
              id="input_screener_pe_ratio"
              label="P/E Ratio"
              value={peRatio}
              minValue={peRatio[0]}
              maxValue={peRatio[1]}
              onChange={onPeRatioChange}
              min={peRatioFilterConfig.min}
              max={peRatioFilterConfig.max}
              step={peRatioFilterConfig.step}
              tooltip={peRatioFilterConfig.tooltip}
              className="col-span-1"
            />
            
            <RangeSlider
              id="input_screener_market_cap"
              label="Market Cap ($B)"
              value={marketCap}
              minValue={marketCap[0]}
              maxValue={marketCap[1]}
              onChange={onMarketCapChange}
              min={marketCapFilterConfig.min}
              max={marketCapFilterConfig.max}
              step={marketCapFilterConfig.step}
              tooltip={marketCapFilterConfig.tooltip}
              formatValue={(val) => `${val}B`}
              className="col-span-1"
            />
            
            <RangeSlider
              id="input_screener_delta"
              label="Delta"
              value={deltaFilter}
              minValue={deltaFilter[0]}
              maxValue={deltaFilter[1]}
              onChange={onDeltaFilterChange}
              min={deltaFilterConfig.min}
              max={deltaFilterConfig.max}
              step={deltaFilterConfig.step}
              tooltip={deltaFilterConfig.tooltip}
              formatValue={(val) => val.toFixed(2)}
              className="col-span-1"
            />
            
            <RangeSlider
              id="input_screener_volume_range"
              label="Volume"
              value={volumeRange}
              minValue={volumeRange[0]}
              maxValue={volumeRange[1]}
              onChange={onVolumeRangeChange}
              min={volumeFilterConfig.min}
              max={volumeFilterConfig.max}
              step={volumeFilterConfig.step}
              tooltip={volumeFilterConfig.tooltip}
              formatValue={(val) => val.toLocaleString()}
              className="col-span-1"
            />            
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
                  {sectorOptions.map((sectorOption) => (
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