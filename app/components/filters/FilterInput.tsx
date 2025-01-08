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
  onKeyPress
}: FilterInputProps) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        className="w-full px-3 py-2 border rounded-md"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        onKeyPress={onKeyPress}
      />
    </div>
  );
}