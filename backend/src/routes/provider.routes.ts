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

export default router;
