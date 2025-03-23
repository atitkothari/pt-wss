"use client";

import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RangeSliderProps {
  id?: string;
  label: string;
  minValue: number;
  maxValue: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
  formatValue?: (value: number) => string;
  className?: string;
  isExponential?: boolean;
  toExponential?: (linearValue: number) => number;
  fromExponential?: (exponentialValue: number) => number;
}

export function RangeSlider({
  id,
  label,
  minValue,
  maxValue,
  value,
  onChange,
  step = 0.1,
  min = 0,
  max = 100,
  tooltip,
  formatValue = (val) => {
    if (Math.abs(val - min) < Number.EPSILON) return `< ${val}`;
    if (Math.abs(val - max) < Number.EPSILON) return `> ${val}`;
    return val.toString();
  },
  className,
  isExponential = false,
  toExponential = (val) => val,
  fromExponential = (val) => val
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  
  // Update local state when props change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    let typedValue: [number, number];
    
    if (isExponential) {
      // Convert from linear slider position to exponential value
      typedValue = [toExponential(newValue[0]), toExponential(newValue[1])];
    } else {
      typedValue = [newValue[0], newValue[1]];
    }
    
    setLocalValue(typedValue);
    
    // Handle edge cases for min/max bounds with comparison operators
    const finalValue: [number, number] = [
      Math.abs(typedValue[0] - min) < Number.EPSILON ? min : typedValue[0],
      Math.abs(typedValue[1] - max) < Number.EPSILON ? max : typedValue[1]
    ];
    
    onChange(finalValue);
  };
  
  // We don't need to debounce here since the parent component (AdvancedFilters)
  // already implements debouncing for all filter changes
  
  // Convert exponential values back to linear for slider position
  const sliderValue = isExponential 
    ? [fromExponential(localValue[0]), fromExponential(localValue[1])] 
    : localValue;

  return (
    <div className={`flex-1 relative ${className || ''}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <label htmlFor={id} className="block text-sm font-medium">{label}</label>
          {/* {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )} */}
        </div>
        <div className="text-xs text-gray-500">
          {formatValue(localValue[0])} to {formatValue(localValue[1])}
        </div>
      </div>
      
      <div className="pt-4 pb-1 px-1">
        <Slider
          id={id}
          value={sliderValue}
          min={min}
          max={max}
          step={step}
          onValueChange={handleSliderChange}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-0.5">
          <span>{`< ${min}`}</span>
          <span>{`> ${max}`}</span>
        </div>
      </div>
    </div>
  );
}