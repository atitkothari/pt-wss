"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Info, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
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
  onValueCommit?: (value: [number, number]) => void;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
  formatValue?: (value: number) => string;
  className?: string;
  isExponential?: boolean;
  toExponential?: (val: number) => number;
  fromExponential?: (val: number) => number;
  disabled?: boolean;
}

export function RangeSlider({
  id,
  label,
  minValue,
  maxValue,
  value,
  onChange,
  onValueCommit,
  step = 0.1,
  min = 0,
  max = 100,
  tooltip,
  formatValue = (val) => {
    // if (Math.abs(val - min) < Number.EPSILON) return `< ${val}`;
    // if (Math.abs(val - max) < Number.EPSILON) return `> ${val}`;
    return val.toString();
  },
  className = "",
  isExponential = false,
  toExponential = (val) => val,
  fromExponential = (val) => val,
  disabled = false,
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const router = useRouter();

  // Update local state when props change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    if (disabled) {
      setIsTooltipOpen(true);
      return;
    }
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
      Math.abs(typedValue[1] - max) < Number.EPSILON ? max : typedValue[1],
    ];

    onChange(finalValue);
  };

  const handleSliderCommit = (newValue: number[]) => {
    if (disabled) return;
    
    let typedValue: [number, number];

    if (isExponential) {
      // Convert from linear slider position to exponential value
      typedValue = [toExponential(newValue[0]), toExponential(newValue[1])];
    } else {
      typedValue = [newValue[0], newValue[1]];
    }

    // Handle edge cases for min/max bounds with comparison operators
    const finalValue: [number, number] = [
      Math.abs(typedValue[0] - min) < Number.EPSILON ? min : typedValue[0],
      Math.abs(typedValue[1] - max) < Number.EPSILON ? max : typedValue[1],
    ];

    // Call onValueCommit when user finishes dragging
    if (onValueCommit) {
      onValueCommit(finalValue);
    }
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
    router.push("/pricing");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Same line info and label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>                 
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}</div>
        
      <div className="text-xs text-gray-500 text-right">
        {localValue[0] === min ? `< ${formatValue(localValue[0])}` : formatValue(localValue[0])} to {localValue[1] === max ? `> ${formatValue(localValue[1])}` : formatValue(localValue[1])}       
      </div>  
      </div>    

      <div className="relative">
        <TooltipProvider>
          <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
            <TooltipTrigger asChild>
              <div className={`relative ${disabled ? 'cursor-not-allowed' : ''}`}>
                <Slider
                  id={id}
                  value={sliderValue}
                  min={min}
                  max={max}
                  step={step}
                  onValueChange={handleSliderChange}
                  onValueCommit={handleSliderCommit}
                  className={`mb-2 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={disabled}
                />  
                {disabled && (
                <span className="absolute h-full w-full top-5 left-0 flex items-center justify-center ">
                <button
                    onClick={handleCrownClick}
                    className="p-0.5 hover:bg-gray-100 rounded-full transition-colors flex gap-1"
                  >
                    <Crown className="h-4 w-4 text-yellow-500" /> <span className="text-xs">Upgrade to Pro to use this filter</span>                    
                  </button>
                  </span>              
                )}
              </div>              
            </TooltipTrigger>
            {disabled && (
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span>Upgrade to Pro to use this filter</span>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <div className="flex justify-between text-sm text-gray-600">
          <span title="No lower bound - shows all values below this threshold">{`< ${min}`}</span>
          <span title="No upper bound - shows all values above this threshold">{`> ${max}`}</span>
        </div>
      </div>
    </div>
  );
}
