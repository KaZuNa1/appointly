export default function AvailabilityList() {
  const mockSlots = [
    "2025-02-20 — 10:00",
    "2025-02-20 — 12:00",
    "2025-02-20 — 15:00",
    "2025-02-21 — 09:30"
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4">Чөлөөт цагууд</h2>

      <ul className="list-disc ml-6 text-gray-700 space-y-1">
        {mockSlots.map((slot, i) => (
          <li key={i}>{slot}</li>
        ))}
      </ul>
    </div>
  );
}
