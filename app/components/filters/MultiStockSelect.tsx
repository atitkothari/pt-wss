'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Info, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface MultiStockSelectProps {
  id?: string;
  label: string;
  selectedStocks: string[];
  onChange: (stocks: string[]) => void;
  placeholder?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  suggestions?: string[];
  showSuggestions?: boolean;
  tooltip?: string;
  className?: string;
  onInputChange?: (value: string) => void;
  disabled?: boolean;
}

export function MultiStockSelect({
  id,
  label,
  selectedStocks,
  onChange,
  onInputChange,
  placeholder = "Enter symbols...",
  onKeyPress,
  suggestions = [],
  showSuggestions = false,
  tooltip,
  disabled = false
}: MultiStockSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onInputChange?.(value);
    setIsOpen(true);
  };

  const handleSelect = (stock: string) => {
    if (disabled) return;
    if (!selectedStocks.includes(stock)) {
      onChange([...selectedStocks, stock]);
    }
    setInputValue('');
    setIsOpen(false);
  };

  const handleRemove = (stock: string) => {
    if (disabled) return;
    onChange(selectedStocks.filter(s => s !== stock));
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
        />
        {tooltip && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
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
          </div>
        )}
      </div>
      {showSuggestions && isOpen && inputValue && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions
            .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))
            .map(suggestion => (
              <div
                key={suggestion}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(suggestion)}
              >
                {suggestion}
              </div>
            ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedStocks.map(stock => (
          <div
            key={stock}
            className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
              disabled ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-800'
            }`}
          >
            <span>{stock}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(stock)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}