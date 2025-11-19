import React from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}

export default function BusinessSelect({ label, value, onChange, options }: Props) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 px-3 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
      >
        <option value="">Сонгох...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
