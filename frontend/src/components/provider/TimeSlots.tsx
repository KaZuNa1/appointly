// /src/components/provider-profile/TimeSlots.tsx

interface TimeSlotsProps {
  times: string[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

export default function TimeSlots({
  times,
  selectedTime,
  onSelectTime,
}: TimeSlotsProps) {
  if (times.length === 0) {
    return (
      <p className="text-gray-500 text-lg py-10">
        Энэ өдөр үйлчилгээ ажиллахгүй байна.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {times.map((time) => (
        <button
          key={time}
          onClick={() => onSelectTime(time)}
          className={`px-4 py-3 rounded-lg text-sm border transition-all
            ${
              selectedTime === time
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
        >
          {time}
        </button>
      ))}
    </div>
  );
}
