import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import {
  Calendar,
  User,
  Settings,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Camera,
} from "lucide-react";

interface Booking {
  id: string;
  appointmentTime: string;
  status: string;
  service: {
    name: string;
    duration: number;
    price: number;
  };
  customer?: {
    fullName: string;
    email: string;
  };
  businessProvider?: {
    id: string;
    businessName: string;
    phone?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    district: "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
      // Load avatar from localStorage
      const savedAvatar = localStorage.getItem("userAvatar");
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setFetchingBookings(true);
      const res = await api.get("/bookings/my");
      setBookings(res.data.appointments || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setFetchingBookings(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingAvatar(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const avatarData = event.target?.result as string;
        setAvatar(avatarData);
        // Save to localStorage for persistence
        localStorage.setItem("userAvatar", avatarData);
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.appointmentTime) > new Date() && b.status === "CONFIRMED"
  );

  const pastBookings = bookings.filter(
    (b) => new Date(b.appointmentTime) <= new Date()
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex h-screen">
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="relative mb-3 inline-block group">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-3 border-indigo-600"
                />
              ) : (
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 cursor-pointer hover:bg-indigo-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{user?.fullName}</h2>
            <p className="text-sm text-gray-600 mt-1 truncate">{user?.email}</p>
          </div>

          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "bookings"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Миний захиалгууд</span>
            </button>

            <button
              onClick={() => setActiveTab("info")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "info"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Хувийн мэдээлэл</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "settings"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Тохиргоо</span>
            </button>
          </nav>

          <div className="p-4 border-t border-gray-200 mt-auto">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Гарах</span>
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Миний захиалгууд</h1>
                  <p className="text-gray-600">Ирээдүйн болон өмнөх захиалгуудыг удирдаарай</p>
                </div>

                {/* Upcoming Bookings */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Ирээдүйн захиалгууд
                  </h2>
                  {fetchingBookings ? (
                    <p className="text-gray-600">Уншиж байна...</p>
                  ) : upcomingBookings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Ирээдүйн захиалга байхгүй байна</p>
                      <a href="/providers" className="text-indigo-600 hover:text-indigo-700 font-medium mt-4 inline-block">
                        Шинэ захиалга үүсгэх →
                      </a>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {upcomingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {booking.service.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {booking.businessProvider?.businessName}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              Баталгаажсан
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(booking.appointmentTime).toLocaleDateString("mn-MN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {booking.service.duration} минут
                            </div>
                            <div className="flex items-center gap-2 text-indigo-600 font-semibold pt-2">
                              {booking.service.price.toLocaleString()}₮
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Дэлгэрэнгүй
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Past Bookings */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Өмнөх захиалгууд
                  </h2>
                  {pastBookings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Өмнөх захиалга байхгүй байна</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {pastBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="bg-gray-50 rounded-xl border border-gray-200 p-6 opacity-75"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {booking.service.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {booking.businessProvider?.businessName}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                              Дуусгасан
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 border-t border-gray-200 pt-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(booking.appointmentTime).toLocaleDateString("mn-MN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {booking.service.duration} минут
                            </div>
                            <div className="flex items-center gap-2 text-indigo-600 font-semibold pt-2">
                              {booking.service.price.toLocaleString()}₮
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PERSONAL INFO TAB */}
            {activeTab === "info" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Хувийн мэдээлэл</h1>
                  <p className="text-gray-600">Таны профайлын мэдээлэл</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-8">
                  <div className="max-w-2xl space-y-6">
                    {/* Basic Info Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Нэр
                        </label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={profileData.fullName}
                            onChange={(e) =>
                              setProfileData({ ...profileData, fullName: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{user?.fullName}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Имэйл
                        </label>
                        {editingProfile ? (
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) =>
                              setProfileData({ ...profileData, email: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-600" />
                            {user?.email}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Утасны дугаар
                        </label>
                        {editingProfile ? (
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({ ...profileData, phone: e.target.value })
                            }
                            placeholder="+976 XXXXXXXXX"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-600" />
                            {profileData.phone || "хоосон"}
                          </p>
                        )}
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Хот/Аймаг
                        </label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) =>
                              setProfileData({ ...profileData, city: e.target.value })
                            }
                            placeholder="Улаанбаатар"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            {profileData.city || "хоосон"}
                          </p>
                        )}
                      </div>

                      {/* District */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Дүүрэг
                        </label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={profileData.district}
                            onChange={(e) =>
                              setProfileData({ ...profileData, district: e.target.value })
                            }
                            placeholder="Сүхбаатар"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">
                            {profileData.district || "хоосон"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address - Full Width */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Хаяг
                      </label>
                      {editingProfile ? (
                        <input
                          type="text"
                          value={profileData.address}
                          onChange={(e) =>
                            setProfileData({ ...profileData, address: e.target.value })
                          }
                          placeholder="Өрөөний дугаар, гудамжны нэр, гэх мэт"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {profileData.address || "хоосон"}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      {editingProfile ? (
                        <>
                          <button
                            onClick={() => setEditingProfile(false)}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                          >
                            Хадгалах
                          </button>
                          <button
                            onClick={() => {
                              setEditingProfile(false);
                              setProfileData({
                                fullName: user?.fullName || "",
                                email: user?.email || "",
                                phone: "",
                                address: "",
                                city: "",
                                district: "",
                              });
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            Цуцлах
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditingProfile(true)}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                          Засах
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Тохиргоо</h1>
                  <p className="text-gray-600">Аккаунтын тохиргоо</p>
                </div>

                <div className="space-y-4">
                  {/* Password Change */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Нууц үг өөрчлөх</h3>
                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Одоогийн нууц үг
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Шинэ нууц үг
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Нууц үгийг дахин оруулах
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                      </div>

                      <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                        Нууц үг өөрчлөх
                      </button>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Мэдэгдэл</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-gray-700">Цаг авалтын сургуулагч имэйлээр илгээх</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-gray-700">Шинэ үйлчилгээний мэдэгдэл авах</span>
                      </label>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                    <h3 className="text-lg font-bold text-red-900 mb-4">Эрсдэлтэй бүс</h3>
                    <p className="text-red-700 mb-4">Аккаунтоо устгах нь буцаах боломжгүй</p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                      Аккаунтоо устгах
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-lg">
            {/* Header */}
            <div className="bg-indigo-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">{selectedBooking.service.name}</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Service Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Үйлчилгээний мэдээлэл</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Цаг</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedBooking.appointmentTime).toLocaleDateString("mn-MN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Үргэлжлэх хугацаа</span>
                    <span className="font-medium text-gray-900">{selectedBooking.service.duration} минут</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Үнэ</span>
                    <span className="font-bold text-indigo-600">{selectedBooking.service.price.toLocaleString()}₮</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Статус</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      Баталгаажсан
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              {selectedBooking.businessProvider && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900">Бизнесийн мэдээлэл</h3>

                  {/* Business Name */}
                  <div>
                    <a
                      href={`/providers/${selectedBooking.businessProvider.id}`}
                      className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors underline"
                    >
                      {selectedBooking.businessProvider.businessName}
                    </a>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    {selectedBooking.businessProvider.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-900">{selectedBooking.businessProvider.phone}</p>
                      </div>
                    )}
                    {selectedBooking.businessProvider.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <p className="text-gray-900">{selectedBooking.businessProvider.address}</p>
                      </div>
                    )}
                  </div>

                  {/* Google Maps */}
                  {selectedBooking.businessProvider.latitude && selectedBooking.businessProvider.longitude && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 h-48">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        src={`https://maps.google.com/maps?q=${selectedBooking.businessProvider.latitude},${selectedBooking.businessProvider.longitude}&output=embed`}
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gray-50 border-t border-gray-200 p-6 rounded-b-xl">
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
