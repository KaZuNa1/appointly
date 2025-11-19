// /src/components/provider-profile/DaySelector.tsx

interface DaySelectorProps {
  days: Record<string, string>;
  selectedDay: string;
  onSelectDay: (day: string) => void;
}

export default function DaySelector({
  days,
  selectedDay,
  onSelectDay,
}: DaySelectorProps) {
  return (
    <div className="flex gap-3 flex-wrap mb-10">
      {Object.entries(days).map(([key, label]) => (
        <button
          key={key}
          onClick={() => onSelectDay(key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              selectedDay === key
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
