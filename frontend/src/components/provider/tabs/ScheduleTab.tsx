import { useState, useEffect } from "react";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight, X, Clock, User, Mail, Edit2, Trash2, Trash, Settings } from "lucide-react";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Bulk delete form
  const [bulkDeleteMode, setBulkDeleteMode] = useState<"all" | "range">("all");
  const [bulkDeleteStartDate, setBulkDeleteStartDate] = useState(formatDateForApi(new Date()));
  const [bulkDeleteEndDate, setBulkDeleteEndDate] = useState(formatDateForApi(new Date()));

  // Load table view settings from localStorage or use defaults
  const [viewStartTime, setViewStartTime] = useState(() => {
    const saved = localStorage.getItem("scheduleViewStartTime");
    return saved || "06:00";
  });
  const [viewEndTime, setViewEndTime] = useState(() => {
    const saved = localStorage.getItem("scheduleViewEndTime");
    return saved || "22:00";
  });

  const [formData, setFormData] = useState({
    date: formatDateForApi(new Date()),
    openTime: "09:00",
    closeTime: "18:00",
  });

  // Weekday selection state
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri by default
  const [weeksCount, setWeeksCount] = useState(4); // Default to 4 weeks

  // Generate time slots based on view configuration
  const timeSlots = generateTimeSlots(viewStartTime, viewEndTime);

  // Days of week
  const weekDays = generateWeekDays(currentWeekStart);

  // Save view settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("scheduleViewStartTime", viewStartTime);
    localStorage.setItem("scheduleViewEndTime", viewEndTime);
  }, [viewStartTime, viewEndTime]);

  useEffect(() => {
    fetchData();
  }, [currentWeekStart]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showOptionsDropdown && !target.closest('.relative')) {
        setShowOptionsDropdown(false);
      }
    };

    if (showOptionsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsDropdown]);

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

      // If no weekdays selected or only single day mode, create single schedule
      if (selectedWeekdays.length === 0) {
        alert("Гараг сонгоно уу");
        return;
      }

      // Calculate target dates based on selected weekdays
      const targetDates: string[] = [];
      const baseDate = new Date(formData.date);

      // Get the start of the week for the selected date
      const weekStart = getMonday(baseDate);

      // Generate dates based on user-specified weeks count
      const weeksToGenerate = weeksCount;

      for (let week = 0; week < weeksToGenerate; week++) {
        for (const dayIndex of selectedWeekdays) {
          const targetDate = new Date(weekStart);
          targetDate.setDate(targetDate.getDate() + (week * 7) + dayIndex - 1); // dayIndex is 1-based (Mon=1, Sun=7)
          targetDates.push(formatDateForApi(targetDate));
        }
      }

      // Use the copy endpoint to create multiple schedules
      await api.post("/schedules/copy", {
        targetDates,
        openTime: formData.openTime,
        closeTime: formData.closeTime,
      });

      setShowCreateModal(false);
      setFormData({
        date: formatDateForApi(new Date()),
        openTime: "09:00",
        closeTime: "18:00",
      });
      setSelectedWeekdays([1, 2, 3, 4, 5]); // Reset to Mon-Fri
      setWeeksCount(4); // Reset to default 4 weeks
      await fetchData();

      alert(`Амжилттай үүслээ! ${targetDates.length} өдрийн цагийн хуваарь үүсгэлээ.`);
    } catch (err: any) {
      console.error("Failed to create schedule:", err);
      alert(err.response?.data?.msg || "Цагийн хуваарь үүсгэхэд алдаа гарлаа");
    } finally {
      setCreating(false);
    }
  };

  const toggleWeekday = (dayIndex: number) => {
    setSelectedWeekdays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const isScheduleLocked = (schedule: Schedule): boolean => {
    const scheduleDate = new Date(schedule.date);
    scheduleDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Past dates are locked
    if (scheduleDate < today) {
      return true;
    }

    // Today's schedule is locked if current time has entered working hours
    if (scheduleDate.getTime() === today.getTime()) {
      const [openHour, openMin] = schedule.openTime.split(":").map(Number);
      const openDateTime = new Date(scheduleDate);
      openDateTime.setHours(openHour, openMin, 0, 0);

      if (now >= openDateTime) {
        return true;
      }
    }

    return false;
  };

  const handleEditSchedule = (schedule: Schedule) => {
    if (isScheduleLocked(schedule)) {
      alert("Энэ цагийн хуваарийг засах боломжгүй байна");
      return;
    }

    setSelectedSchedule(schedule);
    setFormData({
      date: formatDateForApi(new Date(schedule.date)),
      openTime: schedule.openTime,
      closeTime: schedule.closeTime,
    });
    setShowEditModal(true);
  };

  const handleUpdateSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      setEditing(true);
      await api.put(`/schedules/${selectedSchedule.id}`, {
        openTime: formData.openTime,
        closeTime: formData.closeTime,
      });

      setShowEditModal(false);
      setSelectedSchedule(null);
      setFormData({
        date: formatDateForApi(new Date()),
        openTime: "09:00",
        closeTime: "18:00",
      });
      await fetchData();
      alert("Цагийн хуваарь амжилттай шинэчлэгдлээ");
    } catch (err: any) {
      console.error("Failed to update schedule:", err);
      alert(err.response?.data?.msg || "Цагийн хуваарь шинэчлэхэд алдаа гарлаа");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteSchedule = async (schedule: Schedule) => {
    if (isScheduleLocked(schedule)) {
      alert("Энэ цагийн хуваарийг устгах боломжгүй байна");
      return;
    }

    const scheduleDate = new Date(schedule.date);
    const dateStr = scheduleDate.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!confirm(`${dateStr}-ны цагийн хуваарийг устгах уу?`)) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/schedules/${schedule.id}`);
      await fetchData();
      alert("Цагийн хуваарь амжилттай устлаа");
    } catch (err: any) {
      console.error("Failed to delete schedule:", err);
      alert(err.response?.data?.msg || "Цагийн хуваарь устгахад алдаа гарлаа");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setBulkDeleting(true);

      const payload: any = {
        startDate: bulkDeleteMode === "all" ? formatDateForApi(new Date()) : bulkDeleteStartDate,
      };

      if (bulkDeleteMode === "range") {
        payload.endDate = bulkDeleteEndDate;
      }

      const response = await api.post("/schedules/bulk-delete", payload);

      setShowBulkDeleteModal(false);
      await fetchData();

      const { deletedCount } = response.data;
      alert(`${deletedCount} цагийн хуваарь амжилттай устлаа`);
    } catch (err: any) {
      console.error("Failed to bulk delete:", err);
      alert(err.response?.data?.msg || "Цагийн хуваарь устгахад алдаа гарлаа");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    if (!cancellationReason || cancellationReason.trim() === "") {
      alert("Цуцлах шалтгаанаа оруулна уу");
      return;
    }

    try {
      setCancelling(true);
      await api.post(`/bookings/${selectedBooking.id}/provider-cancel`, {
        reason: cancellationReason,
      });

      alert("Захиалга амжилттай цуцлагдлаа");
      setShowCancelModal(false);
      setShowModal(false);
      setCancellationReason("");
      await fetchData();
    } catch (err: any) {
      console.error("Failed to cancel booking:", err);
      alert(err.response?.data?.msg || "Алдаа гарлаа");
    } finally {
      setCancelling(false);
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
        return "bg-green-200 hover:bg-green-300 border-green-400 cursor-pointer";
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
    <div className="pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">7 хоног цагийн хуваарь</h1>

        {/* Week Navigation */}
        <div className="flex gap-2 items-center">
          <button
            onClick={handlePrevWeek}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 py-2 text-gray-700 font-medium bg-gray-100 rounded-lg min-w-max text-sm">
            {formatWeekRange(currentWeekStart)}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* View Settings Modal */}
      {showViewSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Хүснэгт тохируулах</h2>
              <button
                onClick={() => setShowViewSettings(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Эхлэх цаг
                </label>
                <select
                  value={viewStartTime}
                  onChange={(e) => setViewStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {generateTimeOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дуусах цаг
                </label>
                <select
                  value={viewEndTime}
                  onChange={(e) => setViewEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {generateTimeOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowViewSettings(false)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-100 border-2 border-blue-400 rounded"></div>
          <span className="text-sm text-gray-700">Ажлын цаг</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-200 border-2 border-green-400 rounded"></div>
          <span className="text-sm text-gray-700">Баталгаажсан</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span>
          <span>Ажлын цаг үүсгэх</span>
        </button>

        {/* Settings Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Тохиргоо"
          >
            <Settings size={20} />
          </button>

          {showOptionsDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={() => {
                  setShowViewSettings(true);
                  setShowOptionsDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
              >
                <Clock className="w-4 h-4" />
                <span>Хүснэгт тохируулах</span>
              </button>

              <button
                onClick={() => {
                  setShowBulkDeleteModal(true);
                  setShowOptionsDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition"
              >
                <Trash className="w-4 h-4" />
                <span>Олноор устгах</span>
              </button>
            </div>
          )}
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
                  const isLocked = isScheduleLocked(schedule);

                  return (
                    <div
                      key={`working-${schedule.id}`}
                      className={`absolute left-0 right-0 bg-blue-100 border-t-2 border-b-2 border-blue-400 group hover:bg-blue-150 transition-colors ${
                        isLocked ? "opacity-40" : "opacity-70"
                      }`}
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        zIndex: 1,
                      }}
                    >
                      {/* Edit/Delete Buttons - Show on hover if not locked and sufficient height */}
                      {!isLocked && heightPx > 60 && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSchedule(schedule);
                            }}
                            className="p-1 bg-white rounded shadow hover:bg-gray-100 transition"
                            title="Засах"
                          >
                            <Edit2 className="w-3 h-3 text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSchedule(schedule);
                            }}
                            className="p-1 bg-white rounded shadow hover:bg-red-50 transition"
                            title="Устгах"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      )}
                      {/* Lock indicator for locked schedules */}
                      {isLocked && heightPx > 40 && (
                        <div className="absolute top-1 right-1 text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded shadow">
                          🔒
                        </div>
                      )}
                    </div>
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

                  const bgColor = "bg-green-500";

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
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Хаах
              </button>
              {selectedBooking.status !== "CANCELLED" && (
                <button
                  onClick={() => {
                    setShowCancelModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Цуцлах
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Захиалга цуцлах</h2>
              <button
                onClick={() => {
                  setShowCancelModal(false);
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
                  <strong>{selectedBooking.customer.fullName}</strong> руу цуцлах шалтгаан мэдэгдэл явна.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цуцлах шалтгаан *
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Жишээ: Өвчтэй болсон, яаралтай ажил гарсан гэх мэт..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setShowCancelModal(false);
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

              {/* Weekday Selection */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Гарагуудыг сонгох
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { index: 1, label: "Да" },
                    { index: 2, label: "Мя" },
                    { index: 3, label: "Лх" },
                    { index: 4, label: "Пү" },
                    { index: 5, label: "Ба" },
                    { index: 6, label: "Бя" },
                    { index: 7, label: "Ня" },
                  ].map((day) => (
                    <button
                      key={day.index}
                      type="button"
                      onClick={() => toggleWeekday(day.index)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        selectedWeekdays.includes(day.index)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedWeekdays.length} гараг сонгогдсон
                </p>
              </div>

              {/* Weeks Count Input */}
              <div>
                <label htmlFor="weeksCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Хэдэн долоо хоногийн турш үүсгэх вэ?
                </label>
                <input
                  type="number"
                  id="weeksCount"
                  min="1"
                  max="12"
                  value={weeksCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setWeeksCount(Math.max(1, Math.min(12, value)));
                  }}
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

      {/* Edit Schedule Modal */}
      {showEditModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Цагийн хуваарь засах</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Display (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Өдөр
                </label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {new Date(selectedSchedule.date).toLocaleDateString("mn-MN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
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
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={editing}
              >
                Цуцлах
              </button>
              <button
                onClick={handleUpdateSchedule}
                disabled={editing}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-indigo-400"
              >
                {editing ? "Шинэчилж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Олноор устгах</h2>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Устгах төрөл
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="bulkDeleteMode"
                      value="all"
                      checked={bulkDeleteMode === "all"}
                      onChange={() => setBulkDeleteMode("all")}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Бүх ирээдүйн цагийн хуваарь</p>
                      <p className="text-xs text-gray-500">Өнөөдрөөс хойшхи бүх цагийн хуваарийг устгана</p>
                    </div>
                  </label>

                  <label className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="bulkDeleteMode"
                      value="range"
                      checked={bulkDeleteMode === "range"}
                      onChange={() => setBulkDeleteMode("range")}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Огнооны мужаар</p>
                      <p className="text-xs text-gray-500">Тодорхой хугацааны цагийн хуваарийг устгана</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Date Range Inputs (only for range mode) */}
              {bulkDeleteMode === "range" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Эхлэх огноо
                    </label>
                    <input
                      type="date"
                      value={bulkDeleteStartDate}
                      onChange={(e) => setBulkDeleteStartDate(e.target.value)}
                      min={formatDateForApi(new Date())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дуусах огноо
                    </label>
                    <input
                      type="date"
                      value={bulkDeleteEndDate}
                      onChange={(e) => setBulkDeleteEndDate(e.target.value)}
                      min={bulkDeleteStartDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={bulkDeleting}
              >
                Цуцлах
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-red-400"
              >
                {bulkDeleting ? "Устгаж байна..." : "Устгах"}
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

function generateTimeOptions(): string[] {
  const options: string[] = [];
  // Generate times from 00:00 to 23:30 in 30-minute intervals
  for (let hour = 0; hour < 24; hour++) {
    options.push(`${String(hour).padStart(2, "0")}:00`);
    options.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return options;
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
    const startTime = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

    // Calculate end time (30 minutes later)
    const endMinutes = currentMinutes + 30;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

    const timeStr = `${startTime} → ${endTime}`;
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
