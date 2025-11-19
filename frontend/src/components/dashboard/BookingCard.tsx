interface BookingCardProps {
  service: string;
  provider: string;
  date: string;
  time: string;
}

export default function BookingCard({ service, provider, date, time }: BookingCardProps) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-gray-900">{service}</h3>
      <p className="text-gray-600 text-sm mt-1">Үйлчилгээ үзүүлэгч: {provider}</p>

      <p className="mt-3 text-sm text-gray-700 font-medium">
        {date} – {time}
      </p>
    </div>
  );
}
