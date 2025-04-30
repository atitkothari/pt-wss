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
}

export function MultiStockSelect({
  id,
  label,
  selectedStocks,
  onChange,
  placeholder,
  onKeyPress,
  suggestions = [],
  showSuggestions = false,
  tooltip,
  className,
  onInputChange
}: MultiStockSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  
  const filteredSuggestions = suggestions
    .filter(symbol => 
      symbol.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedStocks.includes(symbol)
    );

  const handleSuggestionClick = (suggestion: string) => {
    if (!selectedStocks.includes(suggestion)) {
      onChange([...selectedStocks, suggestion]);
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const handleRemoveStock = (stockToRemove: string) => {
    onChange(selectedStocks.filter(stock => stock !== stockToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      
      if (selectedIndex >= 0 && filteredSuggestions.length > 0) {
        // If an item is selected from suggestions
        handleSuggestionClick(filteredSuggestions[selectedIndex]);
      } else if (suggestions.includes(inputValue.toUpperCase())) {
        // If input exactly matches a valid stock symbol
        handleSuggestionClick(inputValue.toUpperCase());
      } else {
        // Pass the event to parent if needed
        onKeyPress?.(e);
      }
      return;
    }
    
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
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className={`flex-1 relative ${className || ''}`}>
      <div className="flex items-center gap-1 mb-1">
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
      
      <div className="relative">
        <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-background min-h-10">
          {selectedStocks.map(stock => (
            <Badge 
              key={stock} 
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {stock}
              <X 
                size={14} 
                className="cursor-pointer hover:text-destructive" 
                onClick={() => handleRemoveStock(stock)}
              />
            </Badge>
          ))}
          
          <Input
            id={id}
            type="text"
            className={`border-0 shadow-none flex-grow min-w-[100px] h-6 p-0 focus-visible:ring-0 ${isFocused ? 'outline-none' : ''}`}
            placeholder={selectedStocks.length === 0 ? placeholder : ''}
            value={inputValue}
            onChange={(e) => {              
              setInputValue(e.target.value);
              setShowDropdown(true);
              setSelectedIndex(-1);
              onInputChange?.(e.target.value);
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
            onKeyDown={handleKeyDown}
            style={{ fontSize: '16px' }}
          />
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

        {showSuggestions && showDropdown && inputValue && filteredSuggestions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-2 text-center text-gray-500">
            No matches found
          </div>
        )}
      </div>
    </div>
  );
}