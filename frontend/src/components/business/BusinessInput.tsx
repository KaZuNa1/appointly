import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function BusinessInput({ label, ...props }: Props) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="h-11 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
      />
    </div>
  );
}
