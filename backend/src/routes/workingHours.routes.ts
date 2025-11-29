import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import prisma from "../config/db";

const router = Router();

// GET /api/working-hours - Get provider's working hours
router.get("/", authMiddleware, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Get provider profile
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
      include: {
        hours: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй" });
    }

    return res.json({ workingHours: provider.hours });
  } catch (err) {
    console.error("GET WORKING HOURS ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

// POST /api/working-hours - Save/update provider's working hours
router.post("/", authMiddleware, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { schedule } = req.body; // Array of { dayOfWeek, openTime, closeTime, isOpen }

    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ msg: "Буруу өгөгдөл" });
    }

    // Get provider profile
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй" });
    }

    // Delete existing working hours for this provider
    await prisma.workingHours.deleteMany({
      where: { providerId: provider.id },
    });

    // Create new working hours (only for days that are open)
    const hoursToCreate = schedule
      .filter((day: any) => day.isOpen)
      .map((day: any) => ({
        providerId: provider.id,
        dayOfWeek: day.dayOfWeek,
        openTime: day.openTime,
        closeTime: day.closeTime,
      }));

    if (hoursToCreate.length > 0) {
      await prisma.workingHours.createMany({
        data: hoursToCreate,
      });
    }

    // Fetch updated hours
    const updatedHours = await prisma.workingHours.findMany({
      where: { providerId: provider.id },
      orderBy: { dayOfWeek: "asc" },
    });

    return res.json({
      msg: "Цагийн хуваарь амжилттай хадгалагдлаа",
      workingHours: updatedHours,
    });
  } catch (err) {
    console.error("SAVE WORKING HOURS ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

export default router;
