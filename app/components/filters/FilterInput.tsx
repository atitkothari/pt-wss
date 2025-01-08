"use client";

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
  max
}: FilterInputProps) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        className="w-full px-3 py-2 border rounded-md"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          // Allow empty string or valid numbers
          if (val === '' || !isNaN(Number(val))) {
            onChange(val === '' ? '' : Number(val));
          }
        }}
        onKeyPress={onKeyPress}
        step={step}
        min={min}
        max={max}
      />
    </div>
  );
}