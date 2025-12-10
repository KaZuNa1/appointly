import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Building2, ArrowLeft, Heart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { addBookmark, removeBookmark, checkBookmark, getBookmarkCount } from "@/lib/bookmarks";
import { toast } from "sonner";
import WeeklyCalendar from "@/components/booking/WeeklyCalendar";
import ServiceSelectionModal from "@/components/booking/ServiceSelectionModal";

// Provider type from backend
interface Provider {
  id: string;
  businessName: string;
  nickname: string;
  category: string;
  phone?: string;
  description?: string;
  address?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  services: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  hours: Array<{
    id: string;
    date: string;
    openTime: string;
    closeTime: string;
  }>;
}


export default function ProviderProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const isProvider = user?.role === "PROVIDER";

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Booking state - NEW FLOW: slot first, then service
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState<string>("");
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProvider();
      fetchBookmarkStatus();
      fetchBookmarkCount();
    }
  }, [id, user]);

  const fetchProvider = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/providers`);
      // Find the specific provider from the list
      const foundProvider = res.data.providers.find((p: Provider) => p.id === id);
      setProvider(foundProvider || null);
    } catch (err) {
      console.error("Failed to fetch provider:", err);
      setProvider(null);
    } finally {
      setLoading(false);
    }
  };


  const fetchBookmarkStatus = async () => {
    if (!user || !id || isProvider) return;

    try {
      const status = await checkBookmark(id);
      setIsBookmarked(status);
    } catch (err) {
      console.error("Failed to fetch bookmark status:", err);
    }
  };

  const fetchBookmarkCount = async () => {
    if (!id) return;

    try {
      const count = await getBookmarkCount(id);
      setBookmarkCount(count);
    } catch (err) {
      console.error("Failed to fetch bookmark count:", err);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.error("Нэвтэрч орсны дараа хадгалах боломжтой");
      return;
    }

    if (!id) return;

    try {
      setBookmarkLoading(true);

      // Optimistic UI update
      const wasBookmarked = isBookmarked;
      setIsBookmarked(!isBookmarked);
      setBookmarkCount((prev) => (wasBookmarked ? prev - 1 : prev + 1));

      if (wasBookmarked) {
        await removeBookmark(id);
        toast.success("Хадгалгаас хасагдлаа");
      } else {
        await addBookmark(id);
        toast.success("Амжилттай хадгалагдлаа!");
      }
    } catch (err: any) {
      // Revert optimistic update on error
      setIsBookmarked(isBookmarked);
      setBookmarkCount(bookmarkCount);

      console.error("Failed to toggle bookmark:", err);
      toast.error(err.response?.data?.msg || "Алдаа гарлаа");
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Handle booking submission from modal
  const handleBookingSubmit = async (serviceId: string, notes: string) => {
    try {
      setSubmittingBooking(true);

      // Combine date and time
      const [hours, minutes] = selectedSlotTime.split(":");
      const appointmentTime = new Date(selectedSlotDate);
      appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await api.post("/bookings", {
        providerId: id,
        serviceId: serviceId,
        appointmentTime: appointmentTime.toISOString(),
        notes: notes,
      });

      toast.success("Цаг амжилттай захиалагдлаа!");

      // Close modal and reset state
      setShowServiceModal(false);
      setSelectedSlotDate("");
      setSelectedSlotTime("");

      // Refresh calendar to show booked slot
      setCalendarRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Failed to book:", err);
      toast.error(err.response?.data?.msg || "Цаг захиалахад алдаа гарлаа");
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-500">Уншиж байна...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-500 mb-4">Бизнес олдсонгүй</p>
            <Link
              to="/providers"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Бүх бизнесүүд рүү буцах
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Build location string
  const location = [provider.address, provider.district, provider.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/providers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Буцах</span>
        </Link>

        {/* Business Header - Fixed Width Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6 max-w-7xl">
          <div className="flex items-start gap-6">
            {/* Avatar or Icon - Fixed Size */}
            {provider.user.avatarUrl ? (
              <img
                src={provider.user.avatarUrl}
                alt={provider.nickname}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-600 flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-12 h-12 text-indigo-600" />
              </div>
            )}

            {/* Info - Fixed Layout */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2 truncate">
                    {provider.nickname}
                  </h1>

                  <p className="text-sm text-gray-500 mb-1 truncate">{provider.businessName}</p>
                  <p className="text-xs text-gray-400 mb-3 truncate">Эзэмшигч: {provider.user.fullName}</p>

                  <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
                    {provider.category}
                  </div>
                </div>

                {/* Bookmark Button - Fixed Size */}
                {!isProvider && user && (
                  <button
                    onClick={handleBookmarkToggle}
                    disabled={bookmarkLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all flex-shrink-0 ${
                      isBookmarked
                        ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
                        : "border-gray-300 bg-white text-gray-600 hover:border-red-400 hover:bg-red-50"
                    } ${bookmarkLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
                    />
                    <span className="font-medium whitespace-nowrap">
                      {isBookmarked ? "Хадгалсан" : "Хадгалах"}
                    </span>
                  </button>
                )}
              </div>

              {/* Quick Contact Info - Fixed Grid */}
              <div className="grid md:grid-cols-3 gap-3">
                {location && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}

                {provider.phone && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{provider.phone}</span>
                  </div>
                )}

                {provider.user.email && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{provider.user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Content + Map */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (Fixed Width) */}
          <div className="lg:col-span-2">
            {/* About Section */}
            {provider.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Танилцуулга</h2>
                <p className="text-gray-700 leading-relaxed">{provider.description}</p>
              </div>
            )}

            {/* Booking Section - Weekly Calendar */}
            {!isProvider && id && (
              <WeeklyCalendar
                providerId={id}
                refreshKey={calendarRefreshKey}
                onSlotClick={(date, time) => {
                  if (!user) {
                    toast.error("Нэвтэрч орсны дараа цаг захиалах боломжтой");
                    return;
                  }
                  setSelectedSlotDate(date);
                  setSelectedSlotTime(time);
                  setShowServiceModal(true);
                }}
              />
            )}
          </div>

          {/* Right Column - Map (Fixed Width) */}
          {location && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  Байршил
                </h3>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">{location}</p>

                {/* Google Maps */}
                {provider.latitude && provider.longitude ? (
                  <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://maps.google.com/maps?q=${provider.latitude},${provider.longitude}&output=embed`}
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Газрын зураг байхгүй</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedSlotDate("");
          setSelectedSlotTime("");
        }}
        services={provider?.services || []}
        selectedDate={selectedSlotDate}
        selectedTime={selectedSlotTime}
        onSubmit={handleBookingSubmit}
        isSubmitting={submittingBooking}
      />
    </div>
  );
}
