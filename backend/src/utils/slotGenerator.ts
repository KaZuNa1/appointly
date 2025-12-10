/**
 * Slot Generation Utility
 * Generates available time slots for booking based on provider's schedule and configuration
 */

interface TimeSlot {
  time: string; // Format: "HH:MM" (e.g., "09:00")
  status: "available" | "booked" | "past";
  bookingId?: string; // If booked, reference to the booking
}

interface DaySlots {
  date: string; // ISO date string (e.g., "2025-12-10")
  dayOfWeek: string; // e.g., "Monday"
  isClosed: boolean;
  slots: TimeSlot[];
}

interface WeeklySlots {
  weekRange: string; // e.g., "Dec 9-15, 2025"
  slotInterval: number; // 15, 30, or 60
  days: DaySlots[];
}

/**
 * Generate all possible time slots for a given day based on working hours and interval
 */
export function generateDaySlots(
  openTime: string,
  closeTime: string,
  slotInterval: number,
  date: Date
): string[] {
  const slots: string[] = [];

  // Parse open and close times (format: "HH:MM")
  const [openHour, openMin] = openTime.split(":").map(Number);
  const [closeHour, closeMin] = closeTime.split(":").map(Number);

  // Convert to minutes since midnight
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  // Generate slots at interval increments
  let currentMinutes = openMinutes;

  while (currentMinutes < closeMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;

    // Format as HH:MM
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    slots.push(timeString);

    currentMinutes += slotInterval;
  }

  return slots;
}

/**
 * Check if a time slot is in the past
 */
export function isSlotInPast(date: string, time: string): boolean {
  const [hours, minutes] = time.split(":").map(Number);
  const slotDateTime = new Date(date);
  slotDateTime.setHours(hours, minutes, 0, 0);

  return slotDateTime < new Date();
}

/**
 * Format date range for display
 */
export function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = startDate.toLocaleDateString("en-US", options);
  const endStr = endDate.toLocaleDateString("en-US", options);
  const year = startDate.getFullYear();

  return `${startStr}-${endStr}, ${year}`;
}

/**
 * Get day of week name from date
 */
export function getDayOfWeek(date: Date): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
}

/**
 * Calculate required number of slots for a service duration
 */
export function calculateRequiredSlots(serviceDuration: number, slotInterval: number): number {
  return Math.ceil(serviceDuration / slotInterval);
}

/**
 * Check if there are enough consecutive available slots for a booking
 */
export function hasEnoughConsecutiveSlots(
  allSlots: string[],
  startSlotIndex: number,
  requiredSlots: number,
  bookedSlotTimes: Set<string>
): boolean {
  // Check if we have enough slots remaining
  if (startSlotIndex + requiredSlots > allSlots.length) {
    return false;
  }

  // Check if any of the required slots are already booked
  for (let i = 0; i < requiredSlots; i++) {
    const slotTime = allSlots[startSlotIndex + i];
    if (bookedSlotTimes.has(slotTime)) {
      return false;
    }
  }

  return true;
}

/**
 * Get start of week (Monday) for a given date
 */
export function getStartOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
