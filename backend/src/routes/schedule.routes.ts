import { Router, Request, Response } from "express";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import { prisma } from "../config/db";

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

    // Create schedules for all target dates (skip existing ones)
    const schedulesToCreate = [];

    for (const dateStr of targetDates) {
      const scheduleDate = new Date(dateStr);
      scheduleDate.setHours(0, 0, 0, 0);

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

export default router;
