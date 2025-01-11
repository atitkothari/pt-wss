"use client";

import { useState } from 'react';

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
  onSelect
}: FilterInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const filteredSuggestions = suggestions
    .filter(symbol => 
      symbol.includes(String(value).toUpperCase())
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

  return (
    <div className="flex-1 relative">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        id={id}
        type={type}
        className="w-full px-3 py-2 border rounded-md"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const val = e.target.value.toUpperCase();
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
          }, 200);
        }}
        onFocus={() => {
          if (showSuggestions) setShowDropdown(true);
        }}
        onKeyDown={handleKeyDown}  // Add keyDown handler
        step={step}
        min={min}
        max={max}
      />
      
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
    </div>
  );
}