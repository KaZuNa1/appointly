import { Scissors, Sparkles, Leaf, Car, Stethoscope } from "lucide-react";

const categories = [
  { value: "haircut", label: "Үсчин", icon: Scissors },
  { value: "nails", label: "Хумс", icon: Sparkles },
  { value: "spa", label: "Спа & Массаж", icon: Leaf },
  { value: "carwash", label: "Машин угаалга", icon: Car },
  { value: "dentist", label: "Шүдний эмнэлэг", icon: Stethoscope },
];

export default function BusinessCategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">
        Бизнесийн төрөл
      </label>

      <select
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Сонгох...</option>

        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
}
