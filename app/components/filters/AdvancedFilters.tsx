"use client";

import { useState, useMemo, useEffect } from 'react';
import { FilterInput } from "./FilterInput";
import { RangeSlider } from "./RangeSlider";
import { SingleValueSlider } from "./SingleValueSlider";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
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
  marketCapCategories,
  movingAverageCrossoverOptions,
  sectorOptions,
  impliedVolatilityFilterConfig,
  moneynessFilterConfig,
  dteFilterConfig,
  yieldFilterConfig
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
  // Add implied volatility filter props
  impliedVolatility: [number, number];
  onImpliedVolatilityChange: (value: [number, number]) => void;
  // Add moneyness range filter props
  moneynessRange: [number, number];
  onMoneynessRangeChange: (value: [number, number]) => void;
  // Add days to expiration filter props
  minDte: number;
  maxDte: number;
  onDteChange: (value: [number, number]) => void;
  // Add yield range filter props
  yieldRange: [number, number];
  onYieldRangeChange: (value: [number, number]) => void;
  // Optional prop to trigger search automatically
  autoSearch?: boolean;
  onSearch?: () => void;
  // Add isExpanded prop
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
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
  // Add implied volatility filter props
  impliedVolatility,
  onImpliedVolatilityChange,
  // Add moneyness range filter props
  moneynessRange,
  onMoneynessRangeChange,
  // Add days to expiration filter props
  minDte,
  maxDte,
  onDteChange,
  // Add yield range filter props
  yieldRange,
  onYieldRangeChange,
  // Auto search props
  autoSearch = true,
  onSearch,
  // Add isExpanded props
  isExpanded: controlledIsExpanded,
  onExpandedChange
}: AdvancedFiltersProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  
  // Use controlled or uncontrolled state
  const isExpanded = controlledIsExpanded ?? internalIsExpanded;
  const setIsExpanded = (value: boolean) => {
    if (onExpandedChange) {
      onExpandedChange(value);
    } else {
      setInternalIsExpanded(value);
    }
  };
  
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
    impliedVolatility,
    moneynessRange,
    minDte,
    maxDte,
    autoSearch,
    debouncedSearch
  ]);

  // Check individual filter modifications
  const modifiedFilters = useMemo(() => {
    return {
      strikePrice: strikePrice[0] !== priceFilterConfig.defaultMin || 
                   strikePrice[1] !== priceFilterConfig.defaultMax,
      moneyness: moneynessRange[0] !== moneynessFilterConfig.defaultMin || 
                 moneynessRange[1] !== moneynessFilterConfig.defaultMax,
      dte: minDte !== dteFilterConfig.defaultMin || 
           maxDte !== dteFilterConfig.defaultMax,
      delta: deltaFilter[0] !== deltaFilterConfig.defaultMin || 
             deltaFilter[1] !== deltaFilterConfig.defaultMax,
      volume: volumeRange[0] !== volumeFilterConfig.min || 
              volumeRange[1] !== volumeFilterConfig.max,
      iv: impliedVolatility[0] !== impliedVolatilityFilterConfig.defaultMin || 
          impliedVolatility[1] !== impliedVolatilityFilterConfig.defaultMax,
      peRatio: peRatio[0] !== peRatioFilterConfig.defaultMin || 
               peRatio[1] !== peRatioFilterConfig.defaultMax,
      marketCap: marketCap[0] !== marketCapFilterConfig.defaultMin || 
                 marketCap[1] !== marketCapFilterConfig.defaultMax,
      movingAverage: movingAverageCrossover !== movingAverageCrossoverOptions[0],
      sector: sector !== sectorOptions[0],
      yieldRange: yieldRange[0] !== yieldFilterConfig.defaultMin || 
                  yieldRange[1] !== yieldFilterConfig.defaultMax
    };
  }, [
    strikePrice, moneynessRange, minDte, maxDte, deltaFilter, volumeRange,
    impliedVolatility, peRatio, marketCap, movingAverageCrossover, sector, yieldRange
  ]);

  const hasModifiedFilters = useMemo(() => {
    return Object.values(modifiedFilters).some(modified => modified);
  }, [modifiedFilters]);

  const getModifiedCount = useMemo(() => {
    return Object.values(modifiedFilters).filter(modified => modified).length;
  }, [modifiedFilters]);

  return (
    <div className="w-full border rounded-md p-2 mb-3 transition-all hover:border-gray-400">
      <div className="flex justify-between items-center mb-1">
        <Button
          variant="ghost"
          className="flex-1 flex justify-between items-center p-0 h-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-primary">Advanced Filters</span>
            {hasModifiedFilters && !isExpanded && (
              <Badge variant="secondary" className="bg-blue-500 text-white px-2 py-0.5 text-xs">
                {getModifiedCount} active
              </Badge>
            )}
          </div>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3 mt-2 animate-in fade-in-50 duration-300">
          {/* Modified Filters Summary */}
          {hasModifiedFilters && (
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(modifiedFilters).map(([key, isModified]) => {
                if (!isModified) return null;
                const filterNames: { [key: string]: string } = {
                  strikePrice: 'Strike Price',
                  moneyness: 'Strike Filter',
                  dte: 'Expiration',
                  delta: 'Delta',
                  volume: 'Volume',
                  iv: 'IV',
                  peRatio: 'P/E',
                  marketCap: 'Market Cap',
                  movingAverage: 'MA',
                  sector: 'Sector',
                  yieldRange: 'Yield Range'
                };
                return (
                  <Badge 
                    key={key}
                    variant="outline" 
                    className="bg-blue-100 text-blue-800 text-xs"
                  >
                    {filterNames[key]}
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
            {/* Strike Price Range */}
            <RangeSlider
              id="input_screener_price_range"
              label="Strike Price Range"
              minValue={strikePrice[0]}
              maxValue={strikePrice[1]}
              value={strikePrice}
              onChange={onStrikePriceChange}
              min={priceFilterConfig.min}
              max={priceFilterConfig.max}
              step={priceFilterConfig.step}
              tooltip={priceFilterConfig.tooltip}
              formatValue={(val) => `$${val}`}
              isExponential={priceFilterConfig.isExponential}
              toExponential={priceFilterConfig.toExponential}
              fromExponential={priceFilterConfig.fromExponential}
              className="col-span-1"
            />

            {/* Volume Range */}
            <RangeSlider
              id="input_screener_volume_range"
              label="Volume Range"
              minValue={volumeRange[0]}
              maxValue={volumeRange[1]}
              value={volumeRange}
              onChange={onVolumeRangeChange}
              min={volumeFilterConfig.min}
              max={volumeFilterConfig.max}
              step={volumeFilterConfig.step}
              tooltip={volumeFilterConfig.tooltip}
              formatValue={(val) => val.toLocaleString()}
              className="col-span-1"
            />

            {/* Yield Range */}
            <RangeSlider
              id="input_screener_yield_range"
              label="Premium Yield %"
              minValue={yieldRange[0]}
              maxValue={yieldRange[1]}
              value={yieldRange}
              onChange={onYieldRangeChange}
              min={yieldFilterConfig.min}
              max={yieldFilterConfig.max}
              step={yieldFilterConfig.step}
              tooltip={yieldFilterConfig.tooltip}
              formatValue={(val) => `${val}%`}
              className="col-span-1"
            />

            {/* Moneyness Range */}
            <RangeSlider
              id="input_screener_moneyness_range"
              label="Strike Filter %"
              minValue={moneynessRange[0]}
              maxValue={moneynessRange[1]}
              value={moneynessRange}
              onChange={onMoneynessRangeChange}
              min={moneynessFilterConfig.min}
              max={moneynessFilterConfig.max}
              step={moneynessFilterConfig.step}
              tooltip={moneynessFilterConfig.tooltip}
              formatValue={(val) => `${val}%`}
              className="col-span-1"
            />
            
            {/* Days to Expiration */}
            <RangeSlider
              id="input_screener_expiration"
              label="Days to Expiration"
              minValue={minDte}
              maxValue={maxDte}
              value={[minDte, maxDte]}
              onChange={(value) => {
                onDteChange(value);
              }}
              min={dteFilterConfig.min}
              max={dteFilterConfig.max}
              step={dteFilterConfig.step}
              tooltip={dteFilterConfig.tooltip}
              formatValue={(val) => `${val} days`}
              isExponential={dteFilterConfig.isExponential}
              toExponential={dteFilterConfig.toExponential}
              fromExponential={dteFilterConfig.fromExponential}
              className="col-span-1"
            />
            
            {/* Delta */}
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
            
            {/* Implied Volatility */}
            <RangeSlider
              id="input_screener_implied_volatility"
              label="Implied Volatility (%)"
              value={impliedVolatility}
              minValue={impliedVolatility[0]}
              maxValue={impliedVolatility[1]}
              onChange={onImpliedVolatilityChange}
              min={impliedVolatilityFilterConfig.min}
              max={impliedVolatilityFilterConfig.max}
              step={impliedVolatilityFilterConfig.step}
              tooltip={impliedVolatilityFilterConfig.tooltip}
              formatValue={(val) => `${val}%`}
              className="col-span-1"
            />
            
            {/* P/E Ratio */}
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

            {/* Market Cap */}
            <div className="relative col-span-1">
              <label className="block text-sm font-medium mb-1">Market Cap</label>
              <Select 
                value={marketCap.join('-')} 
                onValueChange={(value) => {
                  const [min, max] = value.split('-').map(Number);
                  onMarketCapChange([min, max]);
                }}
              >
                <SelectTrigger id="input_screener_market_cap" className="h-10">
                  <SelectValue placeholder="Select Market Cap Range" />
                </SelectTrigger>
                <SelectContent>
                  {marketCapCategories.map((category, index) => {
                    let value;
                    switch(index) {
                      case 0: // All Market Caps
                        value = `${marketCapFilterConfig.defaultMin}-${marketCapFilterConfig.defaultMax}`;
                        break;
                      case 1: // Mega Cap (>$200B)
                        value = `200-${marketCapFilterConfig.defaultMax}`;
                        break;
                      case 2: // Large Cap ($10B-$200B)
                        value = '10-200';
                        break;
                      case 3: // Mid Cap ($2B-$10B)
                        value = '2-10';
                        break;
                      case 4: // Small Cap ($300M-$2B)
                        value = '0.3-2';
                        break;
                      case 5: // Micro Cap (<$300M)
                        value = `${marketCapFilterConfig.defaultMin}-0.3`;
                        break;
                      default:
                        value = `${marketCapFilterConfig.defaultMin}-${marketCapFilterConfig.defaultMax}`;
                    }
                    return (
                      <SelectItem key={category} value={value}>
                        {category}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Sector */}
            <div className="col-span-1">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}