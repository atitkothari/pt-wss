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

interface SingleValueSliderProps {
  id?: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function SingleValueSlider({
  id,
  label,
  value,
  onChange,
  step = 0.1,
  min = 0,
  max = 100,
  tooltip,
  formatValue = (val) => val.toString(),
  className
}: SingleValueSliderProps) {
  const [localValue, setLocalValue] = useState<number>(value);
  
  // Update local state when props change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    const singleValue = newValue[0];
    setLocalValue(singleValue);
    onChange(singleValue);
  };

  return (
    <div className={`flex-1 relative ${className || ''}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <label htmlFor={id} className="block text-sm font-medium">{label}</label>
          {tooltip && (
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
          )}
        </div>
        <div className="text-xs text-gray-500">
          Current: {formatValue(localValue)}
        </div>
      </div>
      
      <div className="pt-6 pb-2 px-1">
        <Slider
          id={id}
          value={[localValue]}
          min={min}
          max={max}
          step={step}
          onValueChange={handleSliderChange}
          className="mb-4"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
}