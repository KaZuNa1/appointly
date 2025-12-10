import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";

interface TimeSlot {
  time: string;
  status: "available" | "booked" | "past" | "user-booked";
}

interface DaySlots {
  date: string;
  dayOfWeek: string;
  isClosed: boolean;
  slots: TimeSlot[];
}

interface WeeklySlotsData {
  weekRange: string;
  slotInterval: number;
  bookingWindowWeeks: number;
  days: DaySlots[];
}

interface WeeklyCalendarProps {
  providerId: string;
  onSlotClick: (date: string, time: string) => void;
  refreshKey?: number; // When this changes, calendar refreshes
}

export default function WeeklyCalendar({ providerId, onSlotClick, refreshKey }: WeeklyCalendarProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklySlotsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));

  // Fetch weekly slots data
  const fetchWeeklySlots = async (startDate: Date) => {
    try {
      setLoading(true);
      // Format date in local timezone (YYYY-MM-DD)
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const res = await api.get(`/schedules/weekly-slots/${providerId}?startDate=${dateStr}`);
      setWeeklyData(res.data);
    } catch (err: any) {
      console.error("Failed to fetch weekly slots:", err);
      // If error is about booking window limit, show message
      if (err.response?.status === 400) {
        setWeeklyData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      fetchWeeklySlots(currentWeekStart);
    }
  }, [providerId, currentWeekStart, refreshKey]);

  // Check if we're viewing the current week
  const isCurrentWeek = () => {
    const todayWeekStart = getStartOfWeek(new Date());
    return currentWeekStart.getTime() === todayWeekStart.getTime();
  };

  // Check if we're at the maximum booking window
  const isAtMaxBookingWindow = () => {
    if (!weeklyData) return false;
    const todayWeekStart = getStartOfWeek(new Date());
    const weeksDifference = Math.floor(
      (currentWeekStart.getTime() - todayWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const maxWeeksAhead = (weeklyData.bookingWindowWeeks || 1) - 1; // -1 because current week is week 0
    return weeksDifference >= maxWeeksAhead;
  };

  // Navigate to previous week (disabled - users can't book past weeks)
  const handlePreviousWeek = () => {
    if (isCurrentWeek()) return; // Prevent going to past weeks
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  // Navigate to next week
  const handleNextWeek = () => {
    if (isAtMaxBookingWindow()) return; // Prevent going beyond booking window
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // Get slot button styles based on status
  const getSlotClassName = (status: string) => {
    const baseClasses = "w-full px-2 py-1.5 rounded-md transition-all font-medium";

    switch (status) {
      case "available":
        return `${baseClasses} bg-green-50 border border-green-400 text-green-700 hover:bg-green-100 hover:border-green-600 cursor-pointer hover:scale-105`;
      case "user-booked":
        return `${baseClasses} bg-yellow-100 border border-yellow-500 text-yellow-800 font-semibold cursor-default`;
      case "booked":
        return `${baseClasses} bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed opacity-60`;
      case "past":
        return `${baseClasses} bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed opacity-50`;
      default:
        return baseClasses;
    }
  };

  // Format day header
  const formatDayHeader = (day: DaySlots) => {
    const date = new Date(day.date);
    const dayNum = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return { dayOfWeek: day.dayOfWeek, dayNum, month };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Цагийн хуваарь уншиж байна...</p>
        </div>
      </div>
    );
  }

  if (!weeklyData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Цагийн хуваарь олдсонгүй</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-full">
      {/* Header - Fixed Height */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Цаг захиалах</h2>
          <div className="flex items-center gap-2">
            {/* Previous week button - hidden when viewing current week */}
            {!isCurrentWeek() && (
              <button
                onClick={handlePreviousWeek}
                className="p-2 rounded-lg hover:bg-indigo-700 transition flex-shrink-0"
                title="Өмнөх долоо хоног"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <span className="font-semibold text-white px-3 text-sm whitespace-nowrap">
              {weeklyData.weekRange}
            </span>
            {/* Next week button - hidden when at max booking window */}
            {!isAtMaxBookingWindow() && (
              <button
                onClick={handleNextWeek}
                className="p-2 rounded-lg hover:bg-indigo-700 transition flex-shrink-0"
                title="Дараагийн долоо хоног"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
            <span>Боломжтой</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
            <span>Миний захиалга</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
            <span>Захиалагдсан</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
            <span>Өнгөрсөн</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Fixed Layout */}
      <div className="p-3">
        {/* Day Headers - Fixed Height */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weeklyData.days.map((day) => {
            const { dayOfWeek, dayNum, month } = formatDayHeader(day);
            return (
              <div
                key={day.date}
                className="text-center p-2 bg-gray-50 rounded-md h-16 flex flex-col justify-center"
              >
                <div className="text-xs font-semibold text-gray-600 truncate">{dayOfWeek}</div>
                <div className="text-lg font-bold text-gray-900">{dayNum}</div>
                <div className="text-xs text-gray-500">{month}</div>
              </div>
            );
          })}
        </div>

        {/* Time Slots Grid - Auto Height, No Scroll */}
        <div className="grid grid-cols-7 gap-1">
          {weeklyData.days.map((day) => (
            <div
              key={day.date}
              className="space-y-1 flex flex-col"
            >
              {day.isClosed ? (
                <div className="flex items-center justify-center min-h-[100px] bg-gray-100 rounded-md flex-1">
                  <p className="text-xs text-gray-500 font-medium">Амарна</p>
                </div>
              ) : day.slots.length === 0 ? (
                <div className="flex items-center justify-center min-h-[100px] bg-gray-100 rounded-md flex-1">
                  <p className="text-xs text-gray-500">Цаг байхгүй</p>
                </div>
              ) : (
                day.slots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => {
                      if (slot.status === "available") {
                        onSlotClick(day.date, slot.time);
                      }
                    }}
                    disabled={slot.status !== "available"}
                    className={getSlotClassName(slot.status)}
                    title={
                      slot.status === "available"
                        ? "Цаг захиалах"
                        : slot.status === "user-booked"
                        ? "Таны захиалга"
                        : slot.status === "booked"
                        ? "Захиалагдсан"
                        : "Өнгөрсөн цаг"
                    }
                  >
                    <span className="text-xs font-semibold">{slot.time}</span>
                  </button>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to get start of week (Monday)
function getStartOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
