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
  formatValue = (val) => val.toString(),
  className
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [inputMin, setInputMin] = useState<string>(value[0].toString());
  const [inputMax, setInputMax] = useState<string>(value[1].toString());
  
  // Update local state when props change
  useEffect(() => {
    setLocalValue(value);
    setInputMin(value[0].toString());
    setInputMax(value[1].toString());
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    const typedValue: [number, number] = [newValue[0], newValue[1]];
    setLocalValue(typedValue);
    setInputMin(typedValue[0].toString());
    setInputMax(typedValue[1].toString());
    onChange(typedValue);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = e.target.value;
    setInputMin(newMin);
    
    if (newMin === '' || isNaN(Number(newMin))) return;
    
    const numValue = Number(newMin);
    if (numValue <= localValue[1]) {
      const newValue: [number, number] = [numValue, localValue[1]];
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = e.target.value;
    setInputMax(newMax);
    
    if (newMax === '' || isNaN(Number(newMax))) return;
    
    const numValue = Number(newMax);
    if (numValue >= localValue[0]) {
      const newValue: [number, number] = [localValue[0], numValue];
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  const handleMinInputBlur = () => {
    if (inputMin === '' || isNaN(Number(inputMin))) {
      setInputMin(localValue[0].toString());
      return;
    }
    
    const numValue = Number(inputMin);
    const validValue = Math.max(min, Math.min(numValue, localValue[1]));
    const newValue: [number, number] = [validValue, localValue[1]];
    
    setLocalValue(newValue);
    setInputMin(validValue.toString());
    onChange(newValue);
  };

  const handleMaxInputBlur = () => {
    if (inputMax === '' || isNaN(Number(inputMax))) {
      setInputMax(localValue[1].toString());
      return;
    }
    
    const numValue = Number(inputMax);
    const validValue = Math.min(max, Math.max(numValue, localValue[0]));
    const newValue: [number, number] = [localValue[0], validValue];
    
    setLocalValue(newValue);
    setInputMax(validValue.toString());
    onChange(newValue);
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
          value={[localValue[0], localValue[1]]}
          min={min}
          max={max}
          step={step}
          onValueChange={handleSliderChange}
          className="mb-4"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={inputMin}
            onChange={handleMinInputChange}
            onBlur={handleMinInputBlur}
            className="text-center text-sm"
            aria-label={`Minimum ${label}`}
          />
        </div>
        <span className="text-gray-400">to</span>
        <div className="flex-1">
          <Input
            type="text"
            value={inputMax}
            onChange={handleMaxInputChange}
            onBlur={handleMaxInputBlur}
            className="text-center text-sm"
            aria-label={`Maximum ${label}`}
          />
        </div>
      </div>
    </div>
  );
}