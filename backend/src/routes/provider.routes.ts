import { Router } from "express";
import { prisma } from "../config/db";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET /api/providers
 * Returns all registered providers
 */
router.get("/", async (req, res) => {
  try {
    const providers = await prisma.businessProvider.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        services: true,
        hours: true,
      },
    });

    return res.json({ providers });

  } catch (err) {
    console.error("GET PROVIDERS ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

/**
 * GET /api/providers/by-service/:serviceName
 * Returns all providers offering a specific service
 */
router.get("/by-service/:serviceName", async (req, res) => {
  try {
    const { serviceName } = req.params;

    const providers = await prisma.businessProvider.findMany({
      where: {
        services: {
          some: {
            name: serviceName,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        services: {
          where: {
            name: serviceName,
          },
        },
      },
    });

    return res.json({ providers });
  } catch (err) {
    console.error("GET PROVIDERS BY SERVICE ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

/**
 * PUT /api/providers/profile
 * Update provider profile information
 */
router.put("/profile", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      businessName,
      nickname,
      category,
      phone,
      city,
      district,
      address,
      description,
      latitude,
      longitude,
    } = req.body;

    // Find provider profile by userId
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй." });
    }

    // Build update data - only include fields that are provided
    const updateData: any = {
      businessName,
      nickname,
      category,
      phone,
      city,
      district,
      address,
      description,
    };

    // Only add coordinates if provided
    if (latitude !== undefined) {
      updateData.latitude = latitude ? parseFloat(latitude) : null;
    }
    if (longitude !== undefined) {
      updateData.longitude = longitude ? parseFloat(longitude) : null;
    }

    // Update provider profile
    const updated = await prisma.businessProvider.update({
      where: { id: provider.id },
      data: updateData,
    });

    return res.status(200).json({
      msg: "Бизнесийн мэдээлэл амжилттай шинэчлэгдлээ!",
      provider: updated,
    });
  } catch (err) {
    console.error("UPDATE PROVIDER ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

/**
 * PUT /api/providers/:id
 * Update provider settings (booking configuration, etc.)
 */
router.put("/:id", authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { slotInterval, bookingWindowWeeks, cancellationHours } = req.body;

    // Verify this provider belongs to the current user
    const provider = await prisma.businessProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес профайл олдсонгүй." });
    }

    if (provider.userId !== userId) {
      return res.status(403).json({ msg: "Зөвхөн өөрийн профайл засах эрхтэй." });
    }

    // Validate slot interval
    if (slotInterval && ![15, 30, 60].includes(slotInterval)) {
      return res.status(400).json({ msg: "Цагийн интервал 15, 30, эсвэл 60 минут байх ёстой." });
    }

    // Validate booking window weeks
    if (bookingWindowWeeks && (bookingWindowWeeks < 1 || bookingWindowWeeks > 4)) {
      return res.status(400).json({ msg: "Захиалгын хугацаа 1-4 долоо хоног байх ёстой." });
    }

    // Validate cancellation hours
    if (cancellationHours && ![1, 2, 3, 6, 12, 24, 48, 72].includes(cancellationHours)) {
      return res.status(400).json({ msg: "Цуцлах бодлого 1, 2, 3, 6, 12, 24, 48, эсвэл 72 цаг байх ёстой." });
    }

    // Build update data
    const updateData: any = {};
    if (slotInterval !== undefined) updateData.slotInterval = slotInterval;
    if (bookingWindowWeeks !== undefined) updateData.bookingWindowWeeks = bookingWindowWeeks;
    if (cancellationHours !== undefined) updateData.cancellationHours = cancellationHours;

    // Update provider
    const updated = await prisma.businessProvider.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      msg: "Тохиргоо амжилттай шинэчлэгдлээ!",
      provider: updated,
    });
  } catch (err) {
    console.error("UPDATE PROVIDER SETTINGS ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
});

export default router;
