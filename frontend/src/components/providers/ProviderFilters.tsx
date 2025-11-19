import { Search } from "lucide-react";

const ProviderFilters: React.FC<{
  search: string;
  onSearchChange: (v: string) => void;
}> = ({ search, onSearchChange }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-10">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Бизнес хайх..."
          className="w-full h-14 pl-12 pr-4 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};

export default ProviderFilters;
