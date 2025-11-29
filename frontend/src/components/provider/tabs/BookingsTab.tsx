import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Calendar, Clock, User, Phone, Mail, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface Booking {
  id: string;
  appointmentTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  customer: {
    fullName: string;
    email: string;
  };
}

export default function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed">("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/provider");
      setBookings(res.data.appointments || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      // Update local state
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus as any } : b
        )
      );
      alert("Статус амжилттай шинэчлэгдлээ");
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Статус шинэчлэхэд алдаа гарлаа");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status.toLowerCase() === filter;
  });

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeFormatted = date.toLocaleTimeString("mn-MN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateFormatted} ${timeFormatted}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-50 border-green-200 text-green-800";
      case "COMPLETED":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "CANCELLED":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <AlertCircle size={20} />;
      case "CONFIRMED":
        return <CheckCircle size={20} />;
      case "COMPLETED":
        return <CheckCircle size={20} />;
      case "CANCELLED":
        return <XCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Хүлээгдэж байна";
      case "CONFIRMED":
        return "Баталгаажсан";
      case "COMPLETED":
        return "Дууссан";
      case "CANCELLED":
        return "Цуцлагдсан";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Уншиж байна...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Цаг авалт</h1>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          🔄 Шинэчлэх
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { id: "all", label: "Бүгд", count: bookings.length },
          {
            id: "pending",
            label: "Хүлээгдэж байна",
            count: bookings.filter((b) => b.status === "PENDING").length,
          },
          {
            id: "confirmed",
            label: "Баталгаажсан",
            count: bookings.filter((b) => b.status === "CONFIRMED").length,
          },
          {
            id: "completed",
            label: "Дууссан",
            count: bookings.filter((b) => b.status === "COMPLETED").length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              filter === tab.id
                ? "text-indigo-600 border-indigo-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-sm text-gray-500">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium mb-2">Цаг авалт байхгүй байна</p>
            <p className="text-sm text-gray-500">
              Одоогоор {filter !== "all" && "энэ төрлийн"} цаг авалт байхгүй байна
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className={`bg-white rounded-xl border-2 p-6 transition-all hover:shadow-md ${getStatusColor(
                booking.status
              )}`}
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0">{getStatusIcon(booking.status)}</div>

                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.service.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {getStatusLabel(booking.status)}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-indigo-600">
                      {booking.service.price.toLocaleString()}₮
                    </span>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-white bg-opacity-50 rounded-lg">
                    {/* Date & Time */}
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Цаг</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDateTime(booking.appointmentTime)}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Үргэлжлэх хугацаа</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.service.duration} минут
                        </p>
                      </div>
                    </div>

                    {/* Customer Name */}
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Үйлчлүүлэгч</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.customer.fullName}
                        </p>
                      </div>
                    </div>

                    {/* Customer Email */}
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Имэйл</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.customer.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium mb-1">Тэмдэглэл</p>
                      <p className="text-sm text-gray-900">{booking.notes}</p>
                    </div>
                  )}

                  {/* Status Actions */}
                  {booking.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                      >
                        ✓ Баталгаажуулах
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        ✕ Цуцлах
                      </button>
                    </div>
                  )}

                  {booking.status === "CONFIRMED" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBookingStatus(booking.id, "COMPLETED")}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        ✓ Дуусгасан гэж тэмдэглэх
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        ✕ Цуцлах
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
