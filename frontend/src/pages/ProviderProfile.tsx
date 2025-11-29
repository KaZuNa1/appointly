import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Building2, Clock, Tag, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Provider type from backend
interface Provider {
  id: string;
  businessName: string;
  category: string;
  phone?: string;
  description?: string;
  address?: string;
  city?: string;
  district?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
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

interface Schedule {
  id: string;
  date: string;
  openTime: string;
  closeTime: string;
}

export default function ProviderProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const isProvider = user?.role === "PROVIDER";

  // Booking state
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingStep, setBookingStep] = useState<number>(1); // 1: service, 2: date, 3: time slot

  useEffect(() => {
    if (id) {
      fetchProvider();
      fetchSchedules();
    }
  }, [id]);

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

  const fetchSchedules = async () => {
    try {
      const res = await api.get(`/schedules/provider/${id}`);
      setSchedules(res.data.schedules || []);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
      setSchedules([]);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedDate("");
    setSelectedSlot("");
    setAvailableSlots([]);
    setBookingStep(2);
  };

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot("");
    setBookingStep(3);

    // Fetch available slots
    if (!selectedService) return;

    try {
      setLoadingSlots(true);
      const res = await api.get("/slots/available", {
        params: {
          providerId: id,
          serviceId: selectedService,
          date,
        },
      });
      setAvailableSlots(res.data.availableSlots || []);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      setAvailableSlots([]);
      alert("Цагийн мэдээлэл татахад алдаа гарлаа");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      alert("Үйлчилгээ, огноо, цагаа сонгоно уу");
      return;
    }

    try {
      // Combine date and time
      const [hours, minutes] = selectedSlot.split(":");
      const appointmentTime = new Date(selectedDate);
      appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await api.post("/bookings", {
        providerId: id,
        serviceId: selectedService,
        appointmentTime: appointmentTime.toISOString(),
        notes: bookingNotes,
      });

      alert("Цаг амжилттай захиалагдлаа!");

      // Reset form
      setSelectedService("");
      setSelectedDate("");
      setSelectedSlot("");
      setBookingNotes("");
      setAvailableSlots([]);
      setBookingStep(1);
    } catch (err: any) {
      console.error("Failed to book:", err);
      alert(err.response?.data?.msg || "Цаг захиалахад алдаа гарлаа");
    }
  };

  const resetBooking = () => {
    setSelectedService("");
    setSelectedDate("");
    setSelectedSlot("");
    setBookingNotes("");
    setAvailableSlots([]);
    setBookingStep(1);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
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

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          to="/providers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Буцах</span>
        </Link>

        {/* Business Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-10 h-10 text-indigo-600" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {provider.businessName}
              </h1>

              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full mb-4">
                {provider.category}
              </div>

              {/* Quick Contact Info */}
              <div className="space-y-2">
                {location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{location}</span>
                  </div>
                )}

                {provider.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>{provider.phone}</span>
                  </div>
                )}

                {provider.user.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span>{provider.user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About Section */}
            {provider.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Танилцуулга</h2>
                <p className="text-gray-700 leading-relaxed">{provider.description}</p>
              </div>
            )}

            {/* Services Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-6 h-6" />
                Үйлчилгээнүүд
              </h2>

              {provider.services && provider.services.length > 0 ? (
                <div className="space-y-3">
                  {provider.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.duration} минут</p>
                      </div>
                      <div className="text-lg font-bold text-indigo-600">
                        {service.price.toLocaleString()}₮
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Үйлчилгээ нэмэгдээгүй байна</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Бизнес эзэмшигч удахгүй үйлчилгээгээ нэмэх болно
                  </p>
                </div>
              )}
            </div>

            {/* Booking Section - Hidden for Business Providers */}
            {!isProvider && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Цаг захиалах
                </h2>
                {bookingStep > 1 && (
                  <button
                    onClick={resetBooking}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Дахин эхлэх
                  </button>
                )}
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">
                    Цаг захиалах боломжгүй байна
                  </p>
                  <p className="text-sm text-gray-500">
                    Бизнес эзэмшигч цагийн хуваарь үүсгээгүй байна
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Step 1: Select Service */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1. Үйлчилгээ сонгох
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {provider?.services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceSelect(service.id)}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedService === service.id
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{service.duration} минут</p>
                            </div>
                            <span className="text-lg font-bold text-indigo-600">
                              {service.price.toLocaleString()}₮
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Select Date */}
                  {bookingStep >= 2 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        2. Огноо сонгох
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {schedules.map((schedule) => (
                          <button
                            key={schedule.id}
                            onClick={() => handleDateSelect(schedule.date)}
                            className={`p-3 border-2 rounded-lg text-left transition-all ${
                              selectedDate === schedule.date
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-200 hover:border-indigo-300"
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(schedule.date)}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {schedule.openTime} - {schedule.closeTime}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Select Time Slot */}
                  {bookingStep >= 3 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        3. Цаг сонгох
                      </label>
                      {loadingSlots ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600">Уншиж байна...</p>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-yellow-800 font-medium">
                            Энэ өдөрт боломжтой цаг байхгүй байна
                          </p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Өөр огноо сонгоно уу
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-3 border-2 rounded-lg text-sm font-medium transition-all ${
                                selectedSlot === slot
                                  ? "border-indigo-500 bg-indigo-500 text-white"
                                  : "border-gray-200 hover:border-indigo-300 text-gray-700"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {selectedSlot && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Тэмдэглэл (заавал биш)
                      </label>
                      <textarea
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        placeholder="Нэмэлт мэдээлэл..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Booking Button */}
                  {selectedSlot && (
                    <button
                      onClick={handleBooking}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      Цаг захиалах
                    </button>
                  )}
                </div>
              )}
            </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Холбоо барих</h3>

              <div className="space-y-3">
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="block w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-center font-medium"
                  >
                    📞 Залгах
                  </a>
                )}

                {provider.user.email && (
                  <a
                    href={`mailto:${provider.user.email}`}
                    className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center font-medium"
                  >
                    ✉️ Имэйл илгээх
                  </a>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">📌 Мэдээлэл</h3>

              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <span className="font-medium">Бизнес эзэмшигч:</span>{" "}
                  {provider.user.fullName}
                </p>

                <p>
                  <span className="font-medium">Үйлчилгээ:</span>{" "}
                  {provider.services?.length || 0}
                </p>

                {provider.hours && provider.hours.length > 0 && (
                  <p>
                    <span className="font-medium">Ажлын өдөр:</span>{" "}
                    {provider.hours.length} өдөр
                  </p>
                )}
              </div>
            </div>

            {/* Location Card */}
            {location && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Байршил
                </h3>

                <p className="text-gray-700 text-sm leading-relaxed">{location}</p>

                {/* Optional: Add map integration later */}
                <div className="mt-4 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Газрын зураг удахгүй</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
