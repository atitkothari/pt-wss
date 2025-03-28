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
  formatValue = (val) => {
    if (Math.abs(val - min) < Number.EPSILON) return `< ${val}`;
    if (Math.abs(val - max) < Number.EPSILON) return `> ${val}`;
    return val.toString();
  },
  className
}: SingleValueSliderProps) {
  const [localValue, setLocalValue] = useState<number>(value);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  
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
            <TooltipProvider delayDuration={0}>
              <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
                <TooltipTrigger asChild>
                  <Info 
                    size={14} 
                    className="text-gray-400 cursor-help touch-manipulation" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTooltipOpen(!isTooltipOpen);
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="max-w-[300px] z-[9999] bg-white text-gray-900 border border-gray-200 shadow-lg"
                  sideOffset={5}
                  align="start"
                >
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {formatValue(localValue)}
        </div>
      </div>
      
      <div className="pt-4 pb-1 px-1">
        <Slider
          id={id}
          value={[localValue]}
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