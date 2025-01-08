"use client";

import { useState } from 'react';

interface FilterInputProps {
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
}

export function FilterInput({
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
  showSuggestions = false
}: FilterInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const filteredSuggestions = suggestions
    .filter(symbol => 
      symbol.toLowerCase().includes(String(value).toLowerCase())
    )
    .slice(0, 10);

  return (
    <div className="flex-1 relative">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        className="w-full px-3 py-2 border rounded-md"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          if (type === 'number') {
            if (val === '' || !isNaN(Number(val))) {
              onChange(val === '' ? '' : Number(val));
            }
          } else {
            onChange(val);
            setShowDropdown(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => setShowDropdown(false), 200);
        }}
        onFocus={() => {
          if (showSuggestions) setShowDropdown(true);
        }}
        onKeyPress={onKeyPress}
        step={step}
        min={min}
        max={max}
      />
      
      {showSuggestions && showDropdown && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(suggestion);
                setShowDropdown(false);
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}