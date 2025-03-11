"use client";

import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
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
  const [inputValue, setInputValue] = useState<string>(value.toString());
  
  // Update local state when props change
  useEffect(() => {
    setLocalValue(value);
    setInputValue(value.toString());
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    const singleValue = newValue[0];
    setLocalValue(singleValue);
    setInputValue(singleValue.toString());
    onChange(singleValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue === '' || isNaN(Number(newValue))) return;
    
    const numValue = Number(newValue);
    setLocalValue(numValue);
    onChange(numValue);
  };

  const handleInputBlur = () => {
    if (inputValue === '' || isNaN(Number(inputValue))) {
      setInputValue(localValue.toString());
      return;
    }
    
    const numValue = Number(inputValue);
    const validValue = Math.max(min, Math.min(numValue, max));
    
    setLocalValue(validValue);
    setInputValue(validValue.toString());
    onChange(validValue);
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
          Range: {formatValue(min)} to {formatValue(max)}
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
      </div>
      
      <div className="flex items-center">
        <div className="flex-1">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="text-center text-sm"
            aria-label={`${label} value`}
          />
        </div>
      </div>
    </div>
  );
}