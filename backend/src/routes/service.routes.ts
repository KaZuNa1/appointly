import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import { Response } from "express";
import { prisma } from "../config/db";

const router = Router();

// Get all services for the logged-in provider
router.get("/", authMiddleware, requireRole(["PROVIDER"]), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Find the provider
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
      include: { services: true },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Provider not found" });
    }

    return res.status(200).json({ services: provider.services });
  } catch (err) {
    console.error("Get services error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// Create a new service
router.post("/", authMiddleware, requireRole(["PROVIDER"]), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, duration, price, description } = req.body;

    // Validation
    if (!name || !duration || !price) {
      return res.status(400).json({ msg: "Name, duration, and price are required" });
    }

    // Find the provider
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Provider not found" });
    }

    // Create the service
    const service = await prisma.service.create({
      data: {
        name,
        duration: parseInt(duration),
        price: parseFloat(price),
        description,
        providerId: provider.id,
      },
    });

    return res.status(201).json({ msg: "Service created successfully", service });
  } catch (err) {
    console.error("Create service error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// Delete a service
router.delete("/:id", authMiddleware, requireRole(["PROVIDER"]), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Find the provider
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Provider not found" });
    }

    // Check if the service belongs to this provider
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service || service.providerId !== provider.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    // Delete the service
    await prisma.service.delete({
      where: { id },
    });

    return res.status(200).json({ msg: "Service deleted successfully" });
  } catch (err) {
    console.error("Delete service error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;
