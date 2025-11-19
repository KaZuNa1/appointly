export default function AppointmentsList() {
  const mockAppointments = [
    {
      id: 1,
      client: "Балжинням",
      service: "Массаж",
      date: "2025-02-20",
      time: "14:00",
      status: "Баталгаажсан"
    },
    {
      id: 2,
      client: "Сувдаа",
      service: "Фитнесс зөвлөгөө",
      date: "2025-02-21",
      time: "11:00",
      status: "Хүлээгдэж байна"
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4">Ирэх цагийн захиалгууд</h2>

      <div className="space-y-4">
        {mockAppointments.map((a) => (
          <div 
            key={a.id}
            className="p-4 border rounded-lg bg-gray-50"
          >
            <p><strong>Хэрэглэгч:</strong> {a.client}</p>
            <p><strong>Үйлчилгээ:</strong> {a.service}</p>
            <p><strong>Өдөр:</strong> {a.date} — {a.time}</p>
            <p><strong>Төлөв:</strong> {a.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
