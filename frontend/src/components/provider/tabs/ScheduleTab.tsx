import { useState, useEffect } from "react";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight, X, Clock, User, Mail } from "lucide-react";

interface Schedule {
  id: string;
  date: string;
  openTime: string;
  closeTime: string;
}

interface Booking {
  id: string;
  appointmentTime: string;
  status: string;
  service: {
    name: string;
    duration: number;
    price: number;
  };
  customer: {
    fullName: string;
    email: string;
  };
}

interface TimeSlotInfo {
  type: "empty" | "available" | "booked";
  booking?: Booking;
  schedule?: Schedule;
  bookingProgress?: number; // 0-100 percentage for partial blocks
  isFirstSlot?: boolean; // true if this is the first slot of a booking
}

export default function ScheduleTab() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewStartTime, setViewStartTime] = useState("06:00");
  const [viewEndTime, setViewEndTime] = useState("22:00");
  const [formData, setFormData] = useState({
    date: formatDateForApi(new Date()),
    openTime: "09:00",
    closeTime: "18:00",
  });

  // Generate time slots based on view configuration
  const timeSlots = generateTimeSlots(viewStartTime, viewEndTime);

  // Days of week
  const weekDays = generateWeekDays(currentWeekStart);

  useEffect(() => {
    fetchData();
  }, [currentWeekStart]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, bookingsRes] = await Promise.all([
        api.get("/schedules"),
        api.get("/bookings/provider"),
      ]);
      setSchedules(schedulesRes.data.schedules || []);
      setBookings(bookingsRes.data.appointments || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      setCreating(true);
      await api.post("/schedules", {
        date: new Date(formData.date),
        openTime: formData.openTime,
        closeTime: formData.closeTime,
      });
      setShowCreateModal(false);
      setFormData({
        date: formatDateForApi(new Date()),
        openTime: "09:00",
        closeTime: "18:00",
      });
      await fetchData();
    } catch (err: any) {
      console.error("Failed to create schedule:", err);
      alert(err.response?.data?.msg || "Цагийн хуваарь үүсгэхэд алдаа гарлаа");
    } finally {
      setCreating(false);
    }
  };

  const getSlotInfo = (dayDate: Date, timeSlot: string): TimeSlotInfo => {
    const dateStr = formatDateForApi(dayDate);

    // Find schedule for this day
    const daySchedule = schedules.find((s) => formatDateForApi(new Date(s.date)) === dateStr);

    if (!daySchedule) {
      return { type: "empty" };
    }

    // Check if time slot is within working hours
    const [slotHour, slotMin] = timeSlot.split(":").map(Number);
    const [openHour, openMin] = daySchedule.openTime.split(":").map(Number);
    const [closeHour, closeMin] = daySchedule.closeTime.split(":").map(Number);

    const slotMinutes = slotHour * 60 + slotMin;
    const slotEndMinutes = slotMinutes + 30; // Each slot is 30 minutes
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    if (slotMinutes < openMinutes || slotMinutes >= closeMinutes) {
      return { type: "empty" };
    }

    // Check if time slot falls within any booking (considering service duration)
    const booking = bookings.find((b) => {
      const bookingDate = new Date(b.appointmentTime);
      const bookingHour = bookingDate.getHours();
      const bookingMin = bookingDate.getMinutes();
      const bookingMinutes = bookingHour * 60 + bookingMin;
      const bookingEndMinutes = bookingMinutes + b.service.duration;

      return (
        formatDateForApi(bookingDate) === dateStr &&
        slotMinutes < bookingEndMinutes &&
        slotEndMinutes > bookingMinutes &&
        (b.status === "PENDING" || b.status === "CONFIRMED")
      );
    });

    if (booking) {
      const bookingDate = new Date(booking.appointmentTime);
      const bookingHour = bookingDate.getHours();
      const bookingMin = bookingDate.getMinutes();
      const bookingMinutes = bookingHour * 60 + bookingMin;
      const bookingEndMinutes = bookingMinutes + booking.service.duration;

      // Check if this is the first slot of the booking
      const isFirstSlot = slotMinutes === bookingMinutes;

      // Calculate how much of this slot is covered by the booking
      const slotCoverStart = Math.max(slotMinutes, bookingMinutes);
      const slotCoverEnd = Math.min(slotEndMinutes, bookingEndMinutes);
      const coveredMinutes = slotCoverEnd - slotCoverStart;
      const bookingProgress = (coveredMinutes / 30) * 100; // 30 = slot duration

      return {
        type: "booked",
        booking,
        schedule: daySchedule,
        isFirstSlot,
        bookingProgress,
      };
    }

    return { type: "available", schedule: daySchedule };
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleSlotClick = (slotInfo: TimeSlotInfo) => {
    if (slotInfo.type === "booked" && slotInfo.booking) {
      setSelectedBooking(slotInfo.booking);
      setShowModal(true);
    }
  };

  const getSlotColor = (slotInfo: TimeSlotInfo) => {
    switch (slotInfo.type) {
      case "booked":
        return slotInfo.booking?.status === "CONFIRMED"
          ? "bg-green-200 hover:bg-green-300 border-green-400 cursor-pointer"
          : "bg-yellow-200 hover:bg-yellow-300 border-yellow-400 cursor-pointer";
      case "available":
        return "bg-blue-100 hover:bg-blue-200 border-blue-300";
      case "empty":
        return "bg-gray-50 border-gray-200";
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">7 хоног цагийн хуваарь</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            + Ажлын цаг үүсгэх
          </button>
          <button
            onClick={handlePrevWeek}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="px-4 py-2 text-gray-700 font-medium bg-gray-100 rounded-lg min-w-max">
            {formatWeekRange(currentWeekStart)}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* View Time Range Settings */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Эхлэх цаг
            </label>
            <input
              type="time"
              value={viewStartTime}
              onChange={(e) => setViewStartTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дуусах цаг
            </label>
            <input
              type="time"
              value={viewEndTime}
              onChange={(e) => setViewEndTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded"></div>
          <span className="text-sm text-gray-700">Ажлын цаг</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-200 border-2 border-green-400 rounded"></div>
          <span className="text-sm text-gray-700">Баталгаажсан</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-8 bg-gray-100 border-b border-gray-200">
          <div className="p-3 border-r border-gray-200 bg-white min-h-12 flex items-center">
            <p className="text-xs font-semibold text-gray-600">Цаг</p>
          </div>
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className={`p-3 border-r border-gray-200 text-center min-h-12 flex flex-col justify-center ${
                isToday(day.date) ? "bg-indigo-50" : ""
              }`}
            >
              <p className="text-xs font-semibold text-gray-600">{day.dayName}</p>
              <p className={`text-sm font-bold ${isToday(day.date) ? "text-indigo-600" : "text-gray-900"}`}>
                {day.date.getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Dynamic Time Grid with Precise Positioning */}
        <div className="grid grid-cols-8">
          {/* Time Labels Column */}
          <div className="border-r border-gray-200 bg-white">
            {timeSlots.map((slot, idx) => (
              <div
                key={idx}
                className="p-3 border-b border-gray-200 min-h-12 flex items-center sticky left-0 z-10"
              >
                <p className="text-xs font-semibold text-gray-600">{slot}</p>
              </div>
            ))}
          </div>

          {/* Day Columns with Absolute Positioned Blocks */}
          {weekDays.map((day, dayIdx) => {
            const dateStr = formatDateForApi(day.date);
            const daySchedules = schedules.filter((s) => formatDateForApi(new Date(s.date)) === dateStr);
            const dayBookings = bookings.filter((b) => {
              const bookingDate = new Date(b.appointmentTime);
              return (
                formatDateForApi(bookingDate) === dateStr &&
                (b.status === "PENDING" || b.status === "CONFIRMED")
              );
            });

            const [viewStartHour, viewStartMin] = viewStartTime.split(":").map(Number);
            const [viewEndHour, viewEndMin] = viewEndTime.split(":").map(Number);
            const viewStartMinutes = viewStartHour * 60 + viewStartMin;
            const viewEndMinutes = viewEndHour * 60 + viewEndMin;
            const viewDurationMinutes = viewEndMinutes - viewStartMinutes;

            // Calculate pixels per minute ratio
            // Total slots visible = viewDurationMinutes / 30
            const totalSlots = viewDurationMinutes / 30;
            const pixelsPerSlot = 48; // min-h-12
            const containerHeightPx = totalSlots * pixelsPerSlot;
            const pixelsPerMinute = pixelsPerSlot / 30;

            return (
              <div
                key={dayIdx}
                className={`border-r border-gray-200 relative ${isToday(day.date) ? "bg-indigo-50" : "bg-white"}`}
                style={{ height: `${containerHeightPx}px` }}
              >
                {/* Grid lines for time slots */}
                {timeSlots.map((_, slotIdx) => (
                  <div
                    key={`grid-${slotIdx}`}
                    className="absolute left-0 right-0 border-b border-gray-200"
                    style={{
                      top: `${slotIdx * pixelsPerSlot}px`,
                      height: `${pixelsPerSlot}px`,
                    }}
                  />
                ))}

                {/* Working Hours Blue Block */}
                {daySchedules.map((schedule) => {
                  const [openHour, openMin] = schedule.openTime.split(":").map(Number);
                  const [closeHour, closeMin] = schedule.closeTime.split(":").map(Number);
                  const openMinutes = openHour * 60 + openMin;
                  const closeMinutes = closeHour * 60 + closeMin;

                  const topPx = (openMinutes - viewStartMinutes) * pixelsPerMinute;
                  const heightPx = (closeMinutes - openMinutes) * pixelsPerMinute;

                  return (
                    <div
                      key={`working-${schedule.id}`}
                      className="absolute left-0 right-0 bg-blue-100 opacity-50 border-t-2 border-b-2 border-blue-400"
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        zIndex: 1,
                      }}
                    />
                  );
                })}

                {/* Service Bookings Green Blocks */}
                {dayBookings.map((booking) => {
                  const bookingDate = new Date(booking.appointmentTime);
                  const bookingHour = bookingDate.getHours();
                  const bookingMin = bookingDate.getMinutes();
                  const bookingStartMinutes = bookingHour * 60 + bookingMin;
                  const bookingEndMinutes = bookingStartMinutes + booking.service.duration;

                  const topPx = (bookingStartMinutes - viewStartMinutes) * pixelsPerMinute;
                  const heightPx = booking.service.duration * pixelsPerMinute;

                  const bgColor =
                    booking.status === "CONFIRMED" ? "bg-green-500" : "bg-yellow-500";

                  return (
                    <div
                      key={booking.id}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                      }}
                      className={`absolute left-0 right-0 ${bgColor} border-2 border-green-700 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        zIndex: 5,
                      }}
                    >
                      <div className="h-full flex flex-col justify-start px-2 py-1 text-white text-xs">
                        <p className="font-bold truncate leading-tight">
                          {booking.service.name}
                        </p>
                        {heightPx > 35 && (
                          <p className="truncate leading-tight">
                            {booking.customer.fullName}
                          </p>
                        )}
                        {heightPx > 55 && (
                          <p className="font-semibold leading-tight">
                            {booking.service.duration}min
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Цаг авалтын мэдээлэл</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Service */}
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Үйлчилгээ</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {selectedBooking.service.name}
                </p>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600">
                    {selectedBooking.service.duration} минут
                  </span>
                  <span className="text-lg font-bold text-indigo-600">
                    {selectedBooking.service.price.toLocaleString()}₮
                  </span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Цаг</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatBookingDateTime(selectedBooking.appointmentTime)}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Үйлчлүүлэгч</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBooking.customer.fullName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Имэйл</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedBooking.customer.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Статус</p>
                <p className={`text-sm font-semibold mt-1 ${
                  selectedBooking.status === "CONFIRMED"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}>
                  {selectedBooking.status === "CONFIRMED" ? "✓ Баталгаажсан" : "⏱ Хүлээгдэж байна"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Ажлын цаг үүсгэх</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Өдөр
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Open Time Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Нээх цаг
                </label>
                <input
                  type="time"
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Close Time Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Хаах цаг
                </label>
                <input
                  type="time"
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={creating}
              >
                Цуцлах
              </button>
              <button
                onClick={handleCreateSchedule}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-indigo-400"
              >
                {creating ? "Үүсгэж байна..." : "Үүсгэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Functions
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function generateWeekDays(startDate: Date) {
  const days = [];
  const dayNames = ["Дав", "Мяг", "Лха", "Пүр", "Баа", "Бас", "Ням"];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push({
      date,
      dayName: dayNames[i],
    });
  }

  return days;
}

function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = [];
  const [openHour, openMin] = openTime.split(":").map(Number);
  const [closeHour, closeMin] = closeTime.split(":").map(Number);

  let currentMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  while (currentMinutes < closeMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const timeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    slots.push(timeStr);
    currentMinutes += 30;
  }

  return slots;
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const startMonth = startDate.toLocaleDateString("mn-MN", { month: "long", day: "numeric" });
  const endMonth = endDate.toLocaleDateString("mn-MN", { month: "long", day: "numeric", year: "numeric" });

  return `${startMonth} - ${endMonth}`;
}

function formatBookingDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getNextTime(timeStr: string): string {
  const [hour, min] = timeStr.split(":").map(Number);
  let nextMin = min + 30;
  let nextHour = hour;

  if (nextMin >= 60) {
    nextMin -= 60;
    nextHour += 1;
  }

  return `${String(nextHour).padStart(2, "0")}:${String(nextMin).padStart(2, "0")}`;
}
