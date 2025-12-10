import { Router, Request, Response } from "express";
import { authMiddleware, requireRole, optionalAuthMiddleware } from "../middleware/auth.middleware";
import { prisma } from "../config/db";
import {
  generateDaySlots,
  isSlotInPast,
  formatWeekRange,
  getDayOfWeek,
  getStartOfWeek,
  addDays,
  formatDateISO,
} from "../utils/slotGenerator";

const router = Router();

// GET /api/schedules - Get provider's schedules
router.get("/", authMiddleware, requireRole(["PROVIDER"]), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Get provider profile
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
      include: {
        hours: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй" });
    }

    return res.json({ schedules: provider.hours });
  } catch (err) {
    console.error("GET SCHEDULES ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

// GET /api/schedules/provider/:providerId - Get schedules for a specific provider (public)
router.get("/provider/:providerId", async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    const schedules = await prisma.workingHours.findMany({
      where: {
        providerId,
        date: {
          gte: new Date(), // Only future/today schedules
        },
      },
      orderBy: { date: "asc" },
    });

    return res.json({ schedules });
  } catch (err) {
    console.error("GET PROVIDER SCHEDULES ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

// GET /api/schedules/weekly-slots/:providerId - Get available time slots for a week (public, optional auth)
router.get("/weekly-slots/:providerId", optionalAuthMiddleware, async (req: any, res: Response) => {
  try {
    const { providerId } = req.params;
    const { startDate } = req.query;
    const currentUserId = req.user?.id; // Optional: user ID if authenticated

    console.log("[Weekly Slots] Current User ID:", currentUserId); // Debug log

    // Get provider with booking configuration
    const provider = await prisma.businessProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй" });
    }

    // Parse start date or default to current week
    const weekStart = startDate
      ? getStartOfWeek(new Date(startDate as string))
      : getStartOfWeek(new Date());

    // Check if requested week is within booking window limit
    const currentWeekStart = getStartOfWeek(new Date());
    const bookingWindowWeeks = provider.bookingWindowWeeks || 1;
    const maxWeeksAhead = bookingWindowWeeks - 1; // -1 because current week counts as week 0

    const weeksDifference = Math.floor(
      (weekStart.getTime() - currentWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    // Don't allow booking past weeks or beyond the booking window
    if (weeksDifference < 0 || weeksDifference > maxWeeksAhead) {
      return res.status(400).json({
        msg: `Зөвхөн ${bookingWindowWeeks} долоо хоног урагшаа цаг захиалах боломжтой`
      });
    }

    // Generate array of 7 days for the week
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(weekStart, i);
      const dateISO = formatDateISO(currentDate);

      // Find working hours for this date
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      const workingHours = await prisma.workingHours.findFirst({
        where: {
          providerId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (!workingHours) {
        // Day is closed (no working hours defined)
        weekDays.push({
          date: dateISO,
          dayOfWeek: getDayOfWeek(currentDate),
          isClosed: true,
          slots: [],
        });
        continue;
      }

      // Generate all possible time slots for this day
      const allSlots = generateDaySlots(
        workingHours.openTime,
        workingHours.closeTime,
        provider.slotInterval,
        currentDate
      );

      // Get existing bookings for this day
      const bookings = await prisma.appointment.findMany({
        where: {
          providerId,
          appointmentTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
        include: {
          service: true,
        },
      });

      // Create sets for booked times and user's own bookings
      const bookedTimes = new Set<string>();
      const userBookedTimes = new Set<string>();

      bookings.forEach((booking) => {
        const appointmentDate = new Date(booking.appointmentTime);
        const hours = appointmentDate.getHours().toString().padStart(2, "0");
        const minutes = appointmentDate.getMinutes().toString().padStart(2, "0");
        const timeString = `${hours}:${minutes}`;

        // Mark slot as booked
        bookedTimes.add(timeString);

        // If this booking belongs to current user, mark it separately
        if (currentUserId && booking.customerId === currentUserId) {
          userBookedTimes.add(timeString);
        }

        // Also mark consecutive slots based on service duration
        const serviceDuration = booking.service.duration;
        const slotsNeeded = Math.ceil(serviceDuration / provider.slotInterval);

        for (let j = 1; j < slotsNeeded; j++) {
          const nextSlotMinutes = appointmentDate.getMinutes() + (provider.slotInterval * j);
          const nextSlotHours = appointmentDate.getHours() + Math.floor(nextSlotMinutes / 60);
          const remainingMinutes = nextSlotMinutes % 60;

          const nextTimeString = `${nextSlotHours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}`;
          bookedTimes.add(nextTimeString);

          // Also track user's consecutive slots
          if (currentUserId && booking.customerId === currentUserId) {
            userBookedTimes.add(nextTimeString);
          }
        }
      });

      // Build slots with status
      const slots = allSlots.map((time) => {
        const isPast = isSlotInPast(dateISO, time);
        const isBooked = bookedTimes.has(time);
        const isUserBooked = userBookedTimes.has(time);

        return {
          time,
          status: isPast ? "past" : isUserBooked ? "user-booked" : isBooked ? "booked" : "available",
        };
      });

      weekDays.push({
        date: dateISO,
        dayOfWeek: getDayOfWeek(currentDate),
        isClosed: false,
        slots,
      });
    }

    return res.json({
      weekRange: formatWeekRange(weekStart),
      slotInterval: provider.slotInterval,
      bookingWindowWeeks: provider.bookingWindowWeeks,
      days: weekDays,
    });
  } catch (err) {
    console.error("GET WEEKLY SLOTS ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

// POST /api/schedules - Create schedule for specific date(s)
router.post("/", authMiddleware, requireRole(["PROVIDER"]), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { date, openTime, closeTime } = req.body;

    if (!date || !openTime || !closeTime) {
      return res.status(400).json({ msg: "Огноо болон цагийг оруулна уу" });
    }

    // Get provider profile
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй" });
    }

    // Check if schedule already exists for this date
    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0); // Start of day

    // Validate: Cannot create schedule in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduleDate < today) {
      return res.status(400).json({ msg: "Өнгөрсөн өдрүүдэд цагийн хуваарь үүсгэх боломжгүй" });
    }

    const endDate = new Date(scheduleDate);
    endDate.setHours(23, 59, 59, 999); // End of day

    const existing = await prisma.workingHours.findFirst({
      where: {
        providerId: provider.id,
        date: {
          gte: scheduleDate,
          lte: endDate,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ msg: "Энэ өдрийн цагийн хуваарь аль хэдийн үүссэн байна" });
    }

    // Create new schedule
    const schedule = await prisma.workingHours.create({
      data: {
        providerId: provider.id,
        date: scheduleDate,
        openTime,
        closeTime,
      },
    });

    return res.status(201).json({
      msg: "Цагийн хуваарь амжилттай үүслээ",
      schedule,
    });
  } catch (err) {
    console.error("CREATE SCHEDULE ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

// POST /api/schedules/copy - Copy schedule to multiple dates
router.post("/copy", authMiddleware, requireRole(["PROVIDER"]), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { sourceDate, targetDates, openTime, closeTime } = req.body;

    if (!targetDates || !Array.isArray(targetDates) || targetDates.length === 0) {
      return res.status(400).json({ msg: "Огноонуудыг сонгоно уу" });
    }

    if (!openTime || !closeTime) {
      return res.status(400).json({ msg: "Цагийг оруулна уу" });
    }

    // Get provider profile
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй" });
    }

    // Create schedules for all target dates (skip existing ones and past dates)
    const schedulesToCreate = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const dateStr of targetDates) {
      const scheduleDate = new Date(dateStr);
      scheduleDate.setHours(0, 0, 0, 0);

      // Skip past dates
      if (scheduleDate < today) {
        continue;
      }

      const endDate = new Date(scheduleDate);
      endDate.setHours(23, 59, 59, 999);

      // Check if already exists
      const existing = await prisma.workingHours.findFirst({
        where: {
          providerId: provider.id,
          date: {
            gte: scheduleDate,
            lte: endDate,
          },
        },
      });

      if (!existing) {
        schedulesToCreate.push({
          providerId: provider.id,
          date: scheduleDate,
          openTime,
          closeTime,
        });
      }
    }

    if (schedulesToCreate.length === 0) {
      return res.status(400).json({ msg: "Бүх огноонд цагийн хуваарь аль хэдийн үүссэн байна" });
    }

    // Bulk create
    await prisma.workingHours.createMany({
      data: schedulesToCreate,
    });

    return res.json({
      msg: `${schedulesToCreate.length} өдрийн цагийн хуваарь амжилттай үүслээ`,
      count: schedulesToCreate.length,
    });
  } catch (err) {
    console.error("COPY SCHEDULE ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

// PUT /api/schedules/:id - Update a schedule
router.put("/:id", authMiddleware, requireRole(["PROVIDER"]), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { openTime, closeTime } = req.body;

    if (!openTime || !closeTime) {
      return res.status(400).json({ msg: "Цагийг оруулна уу" });
    }

    // Get provider profile
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй" });
    }

    // Check if schedule belongs to this provider
    const schedule = await prisma.workingHours.findUnique({
      where: { id },
    });

    if (!schedule || schedule.providerId !== provider.id) {
      return res.status(404).json({ msg: "Цагийн хуваарь олдсонгүй" });
    }

    // Check if schedule is locked (cannot edit past schedules or today's schedule if time has passed)
    const scheduleDate = new Date(schedule.date);
    scheduleDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If schedule date is in the past
    if (scheduleDate < today) {
      return res.status(400).json({ msg: "Өнгөрсөн өдрийн цагийн хуваарь засах боломжгүй" });
    }

    // If schedule is today, check if current time has entered working hours
    if (scheduleDate.getTime() === today.getTime()) {
      const [openHour, openMin] = schedule.openTime.split(":").map(Number);
      const openDateTime = new Date(scheduleDate);
      openDateTime.setHours(openHour, openMin, 0, 0);

      if (now >= openDateTime) {
        return res.status(400).json({ msg: "Ажлын цаг эхэлсэн тул засах боломжгүй" });
      }
    }

    // Update schedule
    const updatedSchedule = await prisma.workingHours.update({
      where: { id },
      data: {
        openTime,
        closeTime,
      },
    });

    return res.json({
      msg: "Цагийн хуваарь амжилттай шинэчлэгдлээ",
      schedule: updatedSchedule,
    });
  } catch (err) {
    console.error("UPDATE SCHEDULE ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

// DELETE /api/schedules/:id - Delete a schedule
router.delete("/:id", authMiddleware, requireRole(["PROVIDER"]), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get provider profile
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй" });
    }

    // Check if schedule belongs to this provider
    const schedule = await prisma.workingHours.findUnique({
      where: { id },
    });

    if (!schedule || schedule.providerId !== provider.id) {
      return res.status(404).json({ msg: "Цагийн хуваарь олдсонгүй" });
    }

    // Check if schedule is locked (cannot delete past schedules or today's schedule if time has passed)
    const scheduleDate = new Date(schedule.date);
    scheduleDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If schedule date is in the past
    if (scheduleDate < today) {
      return res.status(400).json({ msg: "Өнгөрсөн өдрийн цагийн хуваарь устгах боломжгүй" });
    }

    // If schedule is today, check if current time has entered working hours
    if (scheduleDate.getTime() === today.getTime()) {
      const [openHour, openMin] = schedule.openTime.split(":").map(Number);
      const openDateTime = new Date(scheduleDate);
      openDateTime.setHours(openHour, openMin, 0, 0);

      if (now >= openDateTime) {
        return res.status(400).json({ msg: "Ажлын цаг эхэлсэн тул устгах боломжгүй" });
      }
    }

    // Check if there are existing bookings for this date
    const startOfDay = new Date(schedule.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(schedule.date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        appointmentTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (bookings.length > 0) {
      return res.status(400).json({
        msg: "Энэ өдөрт захиалга байгаа тул цагийн хуваариа устгах боломжгүй",
      });
    }

    // Delete schedule
    await prisma.workingHours.delete({
      where: { id },
    });

    return res.json({ msg: "Цагийн хуваарь амжилттай устлаа" });
  } catch (err) {
    console.error("DELETE SCHEDULE ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

// POST /api/schedules/bulk-delete - Bulk delete schedules by date range
router.post("/bulk-delete", authMiddleware, requireRole(["PROVIDER"]), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.body;

    if (!startDate) {
      return res.status(400).json({ msg: "Эхлэх огноо оруулна уу" });
    }

    // Get provider profile
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй" });
    }

    // Parse dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date("2099-12-31");
    end.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate: start date must be today or future
    if (start < today) {
      return res.status(400).json({ msg: "Өнгөрсөн өдрүүдийн цагийн хуваарь устгах боломжгүй" });
    }

    // Check if today's schedule can be deleted (not entered working hours yet)
    const now = new Date();
    let effectiveStart = start;

    if (start.getTime() === today.getTime()) {
      // Check all schedules for today
      const todaySchedules = await prisma.workingHours.findMany({
        where: {
          providerId: provider.id,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      // Check if any of today's schedules have started
      const hasStartedSchedule = todaySchedules.some((schedule) => {
        const [openHour, openMin] = schedule.openTime.split(":").map(Number);
        const openDateTime = new Date(today);
        openDateTime.setHours(openHour, openMin, 0, 0);
        return now >= openDateTime;
      });

      if (hasStartedSchedule) {
        // Skip today, start from tomorrow
        effectiveStart = new Date(today);
        effectiveStart.setDate(effectiveStart.getDate() + 1);
        effectiveStart.setHours(0, 0, 0, 0);
      }
    }

    // Find schedules to delete
    const schedulesToDelete = await prisma.workingHours.findMany({
      where: {
        providerId: provider.id,
        date: {
          gte: effectiveStart,
          lte: end,
        },
      },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                status: {
                  in: ["PENDING", "CONFIRMED"],
                },
              },
            },
          },
        },
      },
    });

    if (schedulesToDelete.length === 0) {
      return res.status(400).json({ msg: "Устгах цагийн хуваарь олдсонгүй" });
    }

    // Delete all schedules
    const scheduleIds = schedulesToDelete.map((s) => s.id);

    if (scheduleIds.length > 0) {
      await prisma.workingHours.deleteMany({
        where: {
          id: {
            in: scheduleIds,
          },
        },
      });
    }

    return res.json({
      msg: "Цагийн хуваарь амжилттай устлаа",
      deletedCount: scheduleIds.length,
    });
  } catch (err) {
    console.error("BULK DELETE SCHEDULE ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

export default router;
