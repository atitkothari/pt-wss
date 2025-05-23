"use client";

import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Info, Crown } from "lucide-react";
import { useRouter } from 'next/navigation';
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
  disabled?:boolean
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
  className = "",
  isExponential = false,
  toExponential = (val) => val,
  fromExponential = (val) => val,
  disabled = false
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const router = useRouter();
  
  // Update local state when props change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    if (disabled) return;
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

  const handleCrownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/pricing');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {disabled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCrownClick}
                    className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Upgrade to Pro to use this feature
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative">
        <Slider
          id={id}
          value={sliderValue}
          min={min}
          max={max}
          step={step}
          onValueChange={handleSliderChange}
          className={`mb-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatValue(sliderValue[0])}</span>
          <span>{formatValue(sliderValue[1])}</span>
        </div>
      </div>
    </div>
  );
}