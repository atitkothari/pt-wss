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
  yieldFilterConfig,
  probabilityFilterConfig,
  annualizedReturnFilterConfig
} from "@/app/config/filterConfig";
import { useUserAccess } from '@/app/hooks/useUserAccess';
import { MultiStockSelect } from "./MultiStockSelect";
import { usePlausibleTracker } from '@/app/utils/plausible';
import { PlausibleEvents } from '@/app/utils/plausible';

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
  // Add probability range filter props
  probabilityRange: [number, number];
  onProbabilityRangeChange: (value: [number, number]) => void;
  // Add annualized return filter props
  annualizedReturn: [number, number];
  onAnnualizedReturnChange: (value: [number, number]) => void;
  // Optional prop to trigger search automatically
  autoSearch?: boolean;
  onSearch?: () => void;
  // Add isExpanded prop
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disabled?: boolean;
  excludedStocks: string[];
  onExcludedStocksChange: (stocks: string[]) => void;
  symbols: string[];
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
  // Add probability range filter props
  probabilityRange,
  onProbabilityRangeChange,
  // Add annualized return filter props
  annualizedReturn,
  onAnnualizedReturnChange,
  // Auto search props
  autoSearch = true,
  onSearch,
  // Add isExpanded props
  isExpanded: controlledIsExpanded,
  onExpandedChange,  
  excludedStocks,
  onExcludedStocksChange,
  symbols,
}: AdvancedFiltersProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const { canAccessFeature } = useUserAccess();
  const { trackEvent } = usePlausibleTracker();
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
                  yieldRange[1] !== yieldFilterConfig.defaultMax,
      probabilityRange: probabilityRange[0] !== probabilityFilterConfig.defaultMin || 
                        probabilityRange[1] !== probabilityFilterConfig.defaultMax,
      annualizedReturn: annualizedReturn[0] !== annualizedReturnFilterConfig.defaultMin || 
                         annualizedReturn[1] !== annualizedReturnFilterConfig.defaultMax,
      excludedStocks: excludedStocks.length > 0,
    };
  }, [
    strikePrice, moneynessRange, minDte, maxDte, deltaFilter, volumeRange,
    impliedVolatility, peRatio, marketCap, movingAverageCrossover, sector, yieldRange,
    probabilityRange, annualizedReturn, excludedStocks
  ]);

  const hasModifiedFilters = useMemo(() => {
    return Object.values(modifiedFilters).some(modified => modified);
  }, [modifiedFilters]);

  const getModifiedCount = useMemo(() => {
    return Object.values(modifiedFilters).filter(modified => modified).length;
  }, [modifiedFilters]);

  return (
    <div className="w-full border border-blue-300 rounded-md p-2 mb-3 transition-all hover:border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <Button
          variant="ghost"
          className="flex-1 flex justify-between items-center p-0 h-auto hover:bg-blue-100/50"
          onClick={() => setIsExpanded(!isExpanded)}          
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-blue-700">Advanced Filters</span>
            {hasModifiedFilters && !isExpanded && (
              <Badge variant="secondary" className="bg-blue-600 text-white px-2 py-0.5 text-xs font-medium">
                {getModifiedCount} active
              </Badge>
            )}
          </div>
          {isExpanded ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-blue-600" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3 mt-2 animate-in fade-in-50 duration-300 border-t border-blue-200 pt-3">
          {/* Modified Filters Summary */}
          {hasModifiedFilters && (
            <div className="flex flex-wrap gap-2 mb-3 p-2 bg-blue-100/50 rounded-md border border-blue-200">
              <div className="w-full text-xs font-medium text-blue-700 mb-1">Active Filters:</div>
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
                  // sector: 'Sector',
                  yieldRange: 'Yield Range',
                  probabilityRange: 'Probability of Profit',
                  annualizedReturn: 'Annualized Return',
                  excludedStocks: 'Excluded Stocks',
                };
                return (
                  <Badge 
                    key={key}
                    variant="outline" 
                    className="bg-blue-200 text-blue-800 border-blue-300 text-xs font-medium"
                  >
                    {filterNames[key]}
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 p-2 bg-blue-50/50 rounded-md">
            {/* Strike Price Range */}
            <RangeSlider
              id="input_screener_price_range"
              label="Strike Price Range"
              minValue={strikePrice[0]}
              maxValue={strikePrice[1]}
              value={strikePrice}
              onChange={onStrikePriceChange}
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'strikePrice', value });
              }}
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

            {/* Yield Range */}
            <RangeSlider
              id="input_screener_yield_range"
              label="Premium Yield %"
              minValue={yieldRange[0]}
              maxValue={yieldRange[1]}
              value={yieldRange}
              onChange={onYieldRangeChange}
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'yieldRange', value });
              }}
              min={yieldFilterConfig.min}
              max={yieldFilterConfig.max}
              step={yieldFilterConfig.step}
              tooltip={yieldFilterConfig.tooltip}
              formatValue={(val) => `${val}%`}
              className="col-span-1"
              disabled={!canAccessFeature()}
            />

            {/* Annualized Return */}
            <RangeSlider
              id="input_screener_annualized_return"
              label="Annualized Return %"
              minValue={annualizedReturn[0]}
              maxValue={annualizedReturn[1]}
              value={annualizedReturn}
              onChange={onAnnualizedReturnChange}
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'annualizedReturn', value });
              }}
              min={annualizedReturnFilterConfig.min}
              max={annualizedReturnFilterConfig.max}
              step={annualizedReturnFilterConfig.step}
              tooltip={annualizedReturnFilterConfig.tooltip}
              formatValue={(val) => `${val}%`}
              isExponential={annualizedReturnFilterConfig.isExponential}
              toExponential={annualizedReturnFilterConfig.toExponential}
              fromExponential={annualizedReturnFilterConfig.fromExponential}
              className="col-span-1"
              disabled={!canAccessFeature()}
            />

            {/* Delta */}
            <RangeSlider
              id="input_screener_delta"
              label="Delta"
              value={deltaFilter}
              minValue={deltaFilter[0]}
              maxValue={deltaFilter[1]}
              onChange={onDeltaFilterChange}
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'deltaFilter', value });
              }}
              min={deltaFilterConfig.min}
              max={deltaFilterConfig.max}
              step={deltaFilterConfig.step}
              tooltip={deltaFilterConfig.tooltip}
              formatValue={(val) => val.toFixed(2)}
              className="col-span-1"
              disabled={!canAccessFeature()}
            />
            {/* Moneyness Range */}
            <RangeSlider
              id="input_screener_moneyness_range"
              label="Strike Filter %"
              minValue={moneynessRange[0]}
              maxValue={moneynessRange[1]}
              value={moneynessRange}
              onChange={onMoneynessRangeChange}
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'moneynessRange', value });
              }}
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
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'dte', value });
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
            
            

              {/* Volume Range */}
              <RangeSlider
              id="input_screener_volume_range"
              label="Volume Range"
              minValue={volumeRange[0]}
              maxValue={volumeRange[1]}
              value={volumeRange}
              onChange={onVolumeRangeChange}
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'volumeRange', value });
              }}
              min={volumeFilterConfig.min}
              max={volumeFilterConfig.max}
              step={volumeFilterConfig.step}
              tooltip={volumeFilterConfig.tooltip}
              formatValue={(val) => val.toLocaleString()}
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
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'impliedVolatility', value });
              }}
              min={impliedVolatilityFilterConfig.min}
              max={impliedVolatilityFilterConfig.max}
              step={impliedVolatilityFilterConfig.step}
              tooltip={impliedVolatilityFilterConfig.tooltip}
              formatValue={(val) => `${val}%`}
              className="col-span-1"
              disabled={!canAccessFeature()}
            />

             {/* Probability Range */}
             <RangeSlider
              id="input_screener_probability_range"
              label="Probability of Profit"
              minValue={probabilityRange[0]}
              maxValue={probabilityRange[1]}
              value={probabilityRange}
              onChange={onProbabilityRangeChange}
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'probabilityRange', value });
              }}
              min={probabilityFilterConfig.min}
              max={probabilityFilterConfig.max}
              step={probabilityFilterConfig.step}
              tooltip={probabilityFilterConfig.tooltip}
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
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'peRatio', value });
              }}
              min={peRatioFilterConfig.min}
              max={peRatioFilterConfig.max}
              step={peRatioFilterConfig.step}
              tooltip={peRatioFilterConfig.tooltip}
              className="col-span-1"
              disabled={!canAccessFeature()}
            />

            {/* Market Cap */}
            <RangeSlider
              id="input_screener_market_cap"
              label="Market Cap (Billions)"
              minValue={marketCap[0]}
              maxValue={marketCap[1]}
              value={marketCap}
              onChange={onMarketCapChange}
              onValueCommit={(value) => {
                trackEvent(PlausibleEvents.FilterChange, { filter: 'marketCap', value });
              }}
              min={marketCapFilterConfig.min}
              max={marketCapFilterConfig.max}
              step={marketCapFilterConfig.step}
              tooltip={marketCapFilterConfig.tooltip}
              formatValue={(val) => `$${val}B`}
              isExponential={marketCapFilterConfig.isExponential}
              toExponential={marketCapFilterConfig.toExponential}
              fromExponential={marketCapFilterConfig.fromExponential}
              className="col-span-1"
              disabled={!canAccessFeature()}
            />

            {/* Sector */}
            {/* <div className="col-span-1">
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
            </div> */}

            {/* Exclude Stocks */}
            <div className="col-span-1">
              <MultiStockSelect
                id="input_screener_exclude_symbol"
                label="Exclude Symbol"
                selectedStocks={excludedStocks}
                onChange={(value) => {
                  onExcludedStocksChange(value);
                  // trackEvent(PlausibleEvents.FilterChange, { filter: 'excludedStocks', value });
                }}
                placeholder="Enter symbols to exclude..."
                suggestions={symbols}
                showSuggestions={true}
                tooltip="Enter stock symbols to exclude from the results"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}