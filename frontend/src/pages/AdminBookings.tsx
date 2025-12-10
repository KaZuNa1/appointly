import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar, Search, ChevronLeft, ChevronRight, X, Ban } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  appointmentTime: string;
  status: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  provider: {
    id: string;
    businessName: string;
    nickname: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
}

export default function AdminBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      toast.error("Админ эрх шаардлагатай");
      navigate("/");
      return;
    }

    if (user && user.role === "ADMIN") {
      fetchBookings();
    }
  }, [user, navigate, currentPage, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const res = await api.get(`/admin/bookings?${params.toString()}`);
      setBookings(res.data.bookings);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch bookings:", err);
      toast.error(err.response?.data?.msg || "Захиалгууд татахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancellationReason.trim()) {
      toast.error("Цуцлах шалтгаанаа оруулна уу");
      return;
    }

    try {
      setCancelling(true);
      await api.post(`/admin/bookings/${selectedBooking.id}/cancel`, {
        reason: cancellationReason,
      });
      toast.success("Захиалга амжилттай цуцлагдлаа");
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancellationReason("");
      fetchBookings();
    } catch (err: any) {
      console.error("Failed to cancel booking:", err);
      toast.error(err.response?.data?.msg || "Алдаа гарлаа");
    } finally {
      setCancelling(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Буцах
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            Захиалгууд
          </h1>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Төлөвөөр шүүх</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Бүгд</option>
            <option value="PENDING">Хүлээгдэж буй</option>
            <option value="CONFIRMED">Баталгаажсан</option>
            <option value="CANCELLED">Цуцлагдсан</option>
            <option value="COMPLETED">Дууссан</option>
          </select>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Уншиж байна...</p>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Захиалга олдсонгүй</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Хэрэглэгч
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Бизнес
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Үйлчилгээ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Цаг
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Төлөв
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Үйлдэл
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customer.fullName}
                            </div>
                            <div className="text-sm text-gray-500">{booking.customer.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.provider.businessName}
                            </div>
                            <div className="text-sm text-gray-500">{booking.provider.nickname}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.service.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.service.duration} мин • {booking.service.price.toLocaleString()}₮
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.appointmentTime).toLocaleString("mn-MN")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === "CONFIRMED"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : booking.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.status === "CONFIRMED"
                              ? "Баталгаажсан"
                              : booking.status === "CANCELLED"
                              ? "Цуцлагдсан"
                              : booking.status === "COMPLETED"
                              ? "Дууссан"
                              : "Хүлээгдэж буй"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {booking.status !== "CANCELLED" && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCancelModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Хуудас {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Захиалга цуцлах</h2>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancellationReason("");
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Админаар захиалга цуцлаж байна. Хэрэглэгч болон бизнес хоёуланд нь мэдэгдэл явна.
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Захиалга</p>
                <p className="font-medium text-gray-900">
                  {selectedBooking.customer.fullName} → {selectedBooking.provider.businessName}
                </p>
                <p className="text-sm text-gray-500">{selectedBooking.service.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цуцлах шалтгаан *
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Шалтгаанаа бичнэ үү..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancellationReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={cancelling}
              >
                Буцах
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling || !cancellationReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-red-400"
              >
                {cancelling ? "Цуцлаж байна..." : "Цуцлах"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
