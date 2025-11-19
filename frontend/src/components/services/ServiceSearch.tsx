import React from "react";
import { Search } from "lucide-react";

interface ServiceSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const ServiceSearch: React.FC<ServiceSearchProps> = ({ value, onChange }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Үйлчилгээ хайх..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
        />
      </div>
    </div>
  );
};

export default ServiceSearch;
