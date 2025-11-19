import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSection from "@/components/dashboard/DashboardSection";
import BookingCard from "@/components/dashboard/BookingCard";

export default function Dashboard() {
  // ❗ For now: mock user until backend OK
  const user = {
    name: "Хэрэглэгч",
    email: "user@example.com",
  };

  // ❗ Mock booking data (will come from backend actually)
  const upcoming = [
    { service: "Үс засуулах", provider: "Salon Pro", date: "2025-03-10", time: "14:00" },
    { service: "Хумс арчилгаа", provider: "Nail Studio", date: "2025-03-12", time: "10:30" },
  ];

  const history = [
    { service: "Цэвэрлэгээ", provider: "CleanHome", date: "2025-02-10", time: "09:00" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <DashboardHeader user={user} />

        {/* Upcoming Bookings */}
        <DashboardSection title="Тун удахгүй болох захиалгууд">
          <div className="grid md:grid-cols-2 gap-4">
            {upcoming.length === 0 ? (
              <p className="text-gray-600">Ирээдүйд хийх захиалга байхгүй байна</p>
            ) : (
              upcoming.map((item, i) => (
                <BookingCard key={i} {...item} />
              ))
            )}
          </div>
        </DashboardSection>

        {/* Booking History */}
        <DashboardSection title="Өмнөх захиалгууд">
          <div className="grid md:grid-cols-2 gap-4">
            {history.length === 0 ? (
              <p className="text-gray-600">Өнгөрсөн захиалга алга</p>
            ) : (
              history.map((item, i) => (
                <BookingCard key={i} {...item} />
              ))
            )}
          </div>
        </DashboardSection>

        {/* Profile Info */}
        <DashboardSection title="Хувийн мэдээлэл">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-800 font-medium">Нэр: {user.name}</p>
            <p className="text-gray-800 mt-1">Имэйл: {user.email}</p>

            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Мэдээлэл засах
            </button>
          </div>
        </DashboardSection>

      </div>

      <Footer />
    </div>
  );
}
