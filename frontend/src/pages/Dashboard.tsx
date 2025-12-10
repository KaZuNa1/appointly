import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { uploadAvatar } from "@/lib/supabase";
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
  Heart,
  Building2,
} from "lucide-react";
import { getBookmarks, removeBookmark } from "@/lib/bookmarks";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Booking {
  id: string;
  appointmentTime: string;
  status: string;
  cancellationReason?: string;
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
    cancellationHours?: number;
  };
}

interface BookmarkedProvider {
  id: string;
  businessName: string;
  nickname: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  user: {
    fullName: string;
    avatarUrl: string | null;
  };
  services: {
    id: string;
    name: string;
    price: number;
  }[];
}

export default function Dashboard() {
  const { user, loading, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("bookings");

  // Check URL params for tab on mount
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["bookings", "saved", "info", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [bookmarkedProviders, setBookmarkedProviders] = useState<BookmarkedProvider[]>([]);
  const [fetchingBookmarks, setFetchingBookmarks] = useState(false);
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
      // Load avatar from user object (Supabase Storage URL)
      if (user.avatarUrl) {
        setAvatar(user.avatarUrl);
      } else {
        setAvatar(null);
      }
      // Initialize profile data with user data
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        district: user.district || "",
      });
    }
  }, [user]);

  // Fetch bookmarks when "saved" tab is active
  useEffect(() => {
    if (user && activeTab === "saved") {
      fetchBookmarkedProviders();
    }
  }, [user, activeTab]);

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

  const fetchBookmarkedProviders = async () => {
    try {
      setFetchingBookmarks(true);
      const bookmarks = await getBookmarks();
      setBookmarkedProviders(bookmarks.map((b) => b.provider!).filter(Boolean));
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    } finally {
      setFetchingBookmarks(false);
    }
  };

  const handleRemoveBookmark = async (providerId: string) => {
    try {
      await removeBookmark(providerId);
      setBookmarkedProviders((prev) => prev.filter((p) => p.id !== providerId));
      toast.success("Хадгалгаас хасагдлаа");
    } catch (err: any) {
      console.error("Failed to remove bookmark:", err);
      toast.error(err.response?.data?.msg || "Алдаа гарлаа");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Та энэ захиалгыг цуцлахдаа итгэлтэй байна уу?")) {
      return;
    }

    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.success("Захиалга амжилттай цуцлагдлаа");
      // Refresh bookings
      fetchBookings();
    } catch (err: any) {
      console.error("Failed to cancel booking:", err);
      toast.error(err.response?.data?.msg || "Алдаа гарлаа");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setUploadingAvatar(true);
      try {
        // Upload to Supabase Storage
        const avatarUrl = await uploadAvatar(user.id, file);

        if (avatarUrl) {
          // Save URL to database
          const res = await api.put("/auth/avatar", { avatarUrl });

          if (res.data.user) {
            setAvatar(avatarUrl);
            // Notify other components about avatar change
            window.dispatchEvent(new CustomEvent('avatarUpdated', {
              detail: { userId: user.id, avatarUrl }
            }));
            alert("Зураг амжилттай солигдлоо!");
          }
        } else {
          alert("Зураг хуулахад алдаа гарлаа. Дахин оролдоно уу.");
        }
      } catch (err) {
        console.error("Avatar upload failed:", err);
        alert("Зураг хуулахад алдаа гарлаа.");
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update all profile fields
      await api.put("/auth/profile", {
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        district: profileData.district,
      });

      // Refresh user data from server
      await refreshUser();

      setEditingProfile(false);
      alert("Мэдээлэл амжилттай шинэчлэгдлээ!");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      alert(err.response?.data?.msg || "Алдаа гарлаа. Дахин оролдоно уу.");
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
    (b) => new Date(b.appointmentTime) > new Date() && (b.status === "PENDING" || b.status === "CONFIRMED")
  );

  const pastBookings = bookings.filter(
    (b) => new Date(b.appointmentTime) <= new Date() && b.status !== "CANCELLED"
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex min-h-screen">
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
              onClick={() => setActiveTab("saved")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "saved"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">Хадгалсан</span>
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

                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              Дэлгэрэнгүй
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                            >
                              Цуцлах
                            </button>
                          </div>
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

            {/* SAVED PROVIDERS TAB */}
            {activeTab === "saved" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Хадгалсан бизнесүүд</h1>
                  <p className="text-gray-600">Таны хадгалсан дуртай бизнесүүд</p>
                </div>

                {fetchingBookmarks ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-gray-600">Уншиж байна...</p>
                  </div>
                ) : bookmarkedProviders.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Хадгалсан бизнес байхгүй байна
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Дуртай бизнесүүдээ хадгалаад хурдан олоорой
                    </p>
                    <Link
                      to="/providers"
                      className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Бизнес хайх →
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkedProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Provider Header */}
                        <div className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            {provider.user.avatarUrl ? (
                              <img
                                src={provider.user.avatarUrl}
                                alt={provider.nickname}
                                className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-600"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-indigo-600" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {provider.nickname}
                              </h3>
                              <p className="text-sm text-gray-600 truncate">
                                {provider.businessName}
                              </p>
                            </div>
                          </div>

                          {/* Services */}
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Үйлчилгээ: {provider.services.length}
                            </p>
                            {provider.services.slice(0, 2).map((service) => (
                              <div
                                key={service.id}
                                className="flex justify-between items-center text-sm py-1"
                              >
                                <span className="text-gray-600 truncate">{service.name}</span>
                                <span className="text-indigo-600 font-semibold ml-2">
                                  {service.price.toLocaleString()}₮
                                </span>
                              </div>
                            ))}
                            {provider.services.length > 2 && (
                              <p className="text-xs text-gray-500 mt-1">
                                +{provider.services.length - 2} бусад үйлчилгээ
                              </p>
                            )}
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-1 text-sm text-gray-600 mb-4">
                            {provider.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span className="truncate">{provider.phone}</span>
                              </div>
                            )}
                            {provider.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{provider.address}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link
                              to={`/providers/${provider.id}`}
                              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center font-medium"
                            >
                              Үзэх
                            </Link>
                            <button
                              onClick={() => handleRemoveBookmark(provider.id)}
                              className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Heart className="w-5 h-5 fill-current" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                          <select
                            value={profileData.city}
                            onChange={(e) =>
                              setProfileData({ ...profileData, city: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value=""></option>
                            <option value="Улаанбаатар">Улаанбаатар</option>
                            <option value="Архангай">Архангай</option>
                            <option value="Баян-Өлгий">Баян-Өлгий</option>
                            <option value="Баянхонгор">Баянхонгор</option>
                            <option value="Булган">Булган</option>
                            <option value="Говь-Алтай">Говь-Алтай</option>
                            <option value="Говьсүмбэр">Говьсүмбэр</option>
                            <option value="Дархан-Уул">Дархан-Уул</option>
                            <option value="Дорноговь">Дорноговь</option>
                            <option value="Дорнод">Дорнод</option>
                            <option value="Дундговь">Дундговь</option>
                            <option value="Завхан">Завхан</option>
                            <option value="Орхон">Орхон</option>
                            <option value="Өвөрхангай">Өвөрхангай</option>
                            <option value="Өмнөговь">Өмнөговь</option>
                            <option value="Сүхбаатар">Сүхбаатар</option>
                            <option value="Сэлэнгэ">Сэлэнгэ</option>
                            <option value="Төв">Төв</option>
                            <option value="Увс">Увс</option>
                            <option value="Ховд">Ховд</option>
                            <option value="Хөвсгөл">Хөвсгөл</option>
                            <option value="Хэнтий">Хэнтий</option>
                          </select>
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
                          <select
                            value={profileData.district}
                            onChange={(e) =>
                              setProfileData({ ...profileData, district: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value=""></option>
                            <option value="Багануур">Багануур</option>
                            <option value="Багахангай">Багахангай</option>
                            <option value="Баянгол">Баянгол</option>
                            <option value="Баянзүрх">Баянзүрх</option>
                            <option value="Налайх">Налайх</option>
                            <option value="Сонгинохайрхан">Сонгинохайрхан</option>
                            <option value="Сүхбаатар">Сүхбаатар</option>
                            <option value="Хан-Уул">Хан-Уул</option>
                            <option value="Чингэлтэй">Чингэлтэй</option>
                            <option value="Хөдөө орон нутаг">Хөдөө орон нутаг</option>
                          </select>
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
                            onClick={handleSaveProfile}
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
                    {user?.provider === 'GOOGLE' ? (
                      <div className="max-w-md">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-blue-800 text-sm">
                            Та Google-ээр нэвтэрсэн байна. Нууц үгийн удирдлагыг Google аккаунтаас хийнэ үү.
                          </p>
                        </div>
                      </div>
                    ) : (
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
                    )}
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedBooking.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {selectedBooking.status === "CANCELLED" ? "Цуцлагдсан" : "Баталгаажсан"}
                    </span>
                  </div>
                  {selectedBooking.cancellationReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-900 mb-1">Цуцалсан шалтгаан:</p>
                      <p className="text-sm text-red-800">{selectedBooking.cancellationReason}</p>
                    </div>
                  )}
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
