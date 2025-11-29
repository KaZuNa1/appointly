import { Router, Request, Response } from "express";
import { prisma } from "../config/db";

const router = Router();

// Helper function to generate 30-minute time slots
function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = [];

  // Parse open time (e.g., "09:00")
  const [openHour, openMin] = openTime.split(":").map(Number);
  const [closeHour, closeMin] = closeTime.split(":").map(Number);

  // Convert to minutes since midnight
  let currentMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  // Generate slots every 30 minutes
  while (currentMinutes < closeMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    slots.push(timeStr);
    currentMinutes += 30;
  }

  return slots;
}

// Helper function to check if a slot is available
function isSlotAvailable(
  slotTime: string,
  serviceDuration: number,
  bookedSlots: { time: string; duration: number }[],
  closeTime: string
): boolean {
  const [slotHour, slotMin] = slotTime.split(":").map(Number);
  const slotMinutes = slotHour * 60 + slotMin;

  // Check if service would extend past closing time
  const [closeHour, closeMin] = closeTime.split(":").map(Number);
  const closeMinutes = closeHour * 60 + closeMin;

  if (slotMinutes + serviceDuration > closeMinutes) {
    return false; // Service would extend past closing
  }

  // Check if slot conflicts with any existing bookings
  for (const booking of bookedSlots) {
    const [bookingHour, bookingMin] = booking.time.split(":").map(Number);
    const bookingStartMinutes = bookingHour * 60 + bookingMin;
    const bookingEndMinutes = bookingStartMinutes + booking.duration;

    const serviceEndMinutes = slotMinutes + serviceDuration;

    // Check for overlap
    if (
      (slotMinutes >= bookingStartMinutes && slotMinutes < bookingEndMinutes) || // Slot starts during a booking
      (serviceEndMinutes > bookingStartMinutes && serviceEndMinutes <= bookingEndMinutes) || // Slot ends during a booking
      (slotMinutes <= bookingStartMinutes && serviceEndMinutes >= bookingEndMinutes) // Slot encompasses entire booking
    ) {
      return false; // Conflict found
    }
  }

  return true; // No conflicts
}

// GET /api/slots/available?providerId=X&serviceId=Y&date=Z
router.get("/available", async (req: Request, res: Response) => {
  try {
    const { providerId, serviceId, date } = req.query;

    if (!providerId || !serviceId || !date) {
      return res.status(400).json({ msg: "providerId, serviceId, date шаардлагатай" });
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId as string },
    });

    if (!service) {
      return res.status(404).json({ msg: "Үйлчилгээ олдсонгүй" });
    }

    // Get schedule for this date
    const scheduleDate = new Date(date as string);
    scheduleDate.setHours(0, 0, 0, 0);
    const endDate = new Date(scheduleDate);
    endDate.setHours(23, 59, 59, 999);

    const schedule = await prisma.workingHours.findFirst({
      where: {
        providerId: providerId as string,
        date: {
          gte: scheduleDate,
          lte: endDate,
        },
      },
    });

    if (!schedule) {
      return res.json({ availableSlots: [] }); // No schedule for this date
    }

    // Get all bookings for this date
    const bookings = await prisma.appointment.findMany({
      where: {
        providerId: providerId as string,
        appointmentTime: {
          gte: scheduleDate,
          lte: endDate,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      include: {
        service: {
          select: { duration: true },
        },
      },
    });

    // Convert bookings to bookedSlots format
    const bookedSlots = bookings.map((booking) => {
      const bookingDate = new Date(booking.appointmentTime);
      const hours = String(bookingDate.getHours()).padStart(2, '0');
      const mins = String(bookingDate.getMinutes()).padStart(2, '0');
      return {
        time: `${hours}:${mins}`,
        duration: booking.service.duration,
      };
    });

    // Generate all possible time slots
    const allSlots = generateTimeSlots(schedule.openTime, schedule.closeTime);

    // Filter available slots
    const availableSlots = allSlots.filter((slot) =>
      isSlotAvailable(slot, service.duration, bookedSlots, schedule.closeTime)
    );

    return res.json({ availableSlots });
  } catch (err) {
    console.error("GET AVAILABLE SLOTS ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

export default router;
