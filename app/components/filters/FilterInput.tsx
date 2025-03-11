"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FilterInputProps {
  id?: string;
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  type?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  step?: string;
  min?: string;
  max?: string;
  suggestions?: string[];
  showSuggestions?: boolean;
  onSelect?: (value: string) => void;
  tooltip?: string;
  className?: string;
}

export function FilterInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  onKeyPress,
  step,
  min,
  max,
  suggestions = [],
  showSuggestions = false,
  onSelect,
  tooltip,
  className
}: FilterInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  
  const filteredSuggestions = suggestions
    .filter(symbol => 
      symbol.toLowerCase().includes(String(value).toLowerCase())
    );

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);  // Update the input value
    setShowDropdown(false);
    if (onSelect) {
      onSelect(suggestion);  // Pass the selected value to parent
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !showSuggestions || !filteredSuggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        } else {
          onKeyPress?.(e);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Format the value for display if it's a number
  const displayValue = () => {
    if (type === 'number' && value !== '') {
      return value;
    }
    return value;
  };

  return (
    <div className={`flex-1 relative ${className || ''}`}>
      <div className="flex items-center gap-1 mb-1">
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
      <div className="relative">
        <Input
          id={id}
          type={type}
          className={`w-full transition-all ${isFocused ? 'ring-2 ring-primary ring-offset-1' : ''}`}
          placeholder={placeholder}
          value={displayValue()}
          onChange={(e) => {
            const val = e.target.value;
            if (type === 'number') {
              if (val === '' || !isNaN(Number(val))) {
                onChange(val === '' ? '' : Number(val));
              }
            } else {
              onChange(val);
              setShowDropdown(true);
              setSelectedIndex(-1);  // Reset selection on type
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setShowDropdown(false);
              setSelectedIndex(-1);
              setIsFocused(false);
            }, 200);
          }}
          onFocus={() => {
            if (showSuggestions) setShowDropdown(true);
            setIsFocused(true);
          }}
          onKeyDown={handleKeyDown}  // Add keyDown handler
          step={step}
          min={min}
          max={max}
        />
        
        {/* Show min/max range for number inputs */}
        {type === 'number' && min && max && (
          <div className="text-xs text-gray-500 mt-1">
            Range: {min} to {max}
          </div>
        )}
      </div>
      
      {showSuggestions && showDropdown && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[400px] overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-3 py-2 cursor-pointer ${
                index === selectedIndex 
                  ? 'bg-blue-100 hover:bg-blue-100' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Show no results message */}
      {showSuggestions && showDropdown && value && filteredSuggestions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-2 text-center text-gray-500">
          No matches found
        </div>
      )}
    </div>
  );
}