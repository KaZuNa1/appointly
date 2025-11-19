import { Router } from "express";
import { prisma } from "../config/db";

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

export default router;
