import { Router, Response } from "express";
import { adminMiddleware } from "../middleware/admin.middleware";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// =========================
// DASHBOARD STATISTICS
// =========================

// GET /api/admin/stats - Get platform statistics
router.get("/stats", adminMiddleware, async (req: any, res: Response) => {
  try {
    // Get counts
    const totalUsers = await prisma.user.count();
    const totalProviders = await prisma.businessProvider.count();
    const totalBookings = await prisma.appointment.count();
    const totalServices = await prisma.service.count();

    // Get booking status breakdown
    const bookingsByStatus = await prisma.appointment.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get revenue (sum of all booking prices)
    const bookings = await prisma.appointment.findMany({
      include: {
        service: {
          select: { price: true },
        },
      },
    });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.service.price, 0);

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get recent bookings (last 7 days)
    const newBookingsThisWeek = await prisma.appointment.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return res.json({
      totalUsers,
      totalProviders,
      totalBookings,
      totalServices,
      totalRevenue,
      newUsersThisWeek,
      newBookingsThisWeek,
      bookingsByStatus: bookingsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
    });
  } catch (err) {
    console.error("GET ADMIN STATS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

// GET /api/admin/recent-activity - Get recent activity logs
router.get("/recent-activity", adminMiddleware, async (req: any, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const recentLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        // Note: AuditLog doesn't have relation to User in schema, we'll join manually
      },
    });

    // Fetch user details for each log
    const logsWithUsers = await Promise.all(
      recentLogs.map(async (log) => {
        const user = await prisma.user.findUnique({
          where: { id: log.userId },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        });

        return {
          ...log,
          user,
        };
      })
    );

    return res.json(logsWithUsers);
  } catch (err) {
    console.error("GET RECENT ACTIVITY ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

// =========================
// USER MANAGEMENT
// =========================

// GET /api/admin/users - Get all users with filtering
router.get("/users", adminMiddleware, async (req: any, res: Response) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    // Build filter
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          phone: true,
          city: true,
          district: true,
          provider: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / take),
      currentPage: parseInt(page as string),
    });
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

// GET /api/admin/users/:id - Get specific user details
router.get("/users/:id", adminMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        providerProfile: {
          include: {
            services: true,
            hours: true,
          },
        },
        appointments: {
          include: {
            service: true,
            provider: {
              select: {
                businessName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "Хэрэглэгч олдсонгүй" });
    }

    return res.json(user);
  } catch (err) {
    console.error("GET USER DETAILS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete("/users/:id", adminMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ msg: "Хэрэглэгч олдсонгүй" });
    }

    // Prevent deleting other admins
    if (user.role === "ADMIN" && user.id !== req.user.id) {
      return res.status(403).json({ msg: "Бусад админ хэрэглэгчийг устгах боломжгүй" });
    }

    // Delete user and all related data (cascade will handle most)
    await prisma.user.delete({
      where: { id },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "USER_DELETED",
        entityId: id,
        details: {
          deletedUser: user.email,
        },
      },
    });

    return res.json({ msg: "Хэрэглэгч амжилттай устгагдлаа" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

// =========================
// PROVIDER MANAGEMENT
// =========================

// GET /api/admin/providers - Get all providers with filtering
router.get("/providers", adminMiddleware, async (req: any, res: Response) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    // Build filter
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search as string, mode: "insensitive" } },
        { nickname: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [providers, totalCount] = await Promise.all([
      prisma.businessProvider.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
            },
          },
          services: true,
          _count: {
            select: {
              appointments: true,
              services: true,
            },
          },
        },
      }),
      prisma.businessProvider.count({ where }),
    ]);

    return res.json({
      providers,
      totalCount,
      totalPages: Math.ceil(totalCount / take),
      currentPage: parseInt(page as string),
    });
  } catch (err) {
    console.error("GET PROVIDERS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

// GET /api/admin/providers/:id - Get specific provider details
router.get("/providers/:id", adminMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const provider = await prisma.businessProvider.findUnique({
      where: { id },
      include: {
        user: true,
        services: true,
        hours: {
          orderBy: { date: "desc" },
          take: 30,
        },
        appointments: {
          include: {
            customer: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
            service: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес олдсонгүй" });
    }

    return res.json(provider);
  } catch (err) {
    console.error("GET PROVIDER DETAILS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

// DELETE /api/admin/providers/:id - Delete provider business
router.delete("/providers/:id", adminMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const provider = await prisma.businessProvider.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес олдсонгүй" });
    }

    // Delete provider (cascade will handle services, hours, etc.)
    await prisma.businessProvider.delete({
      where: { id },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "PROVIDER_DELETED",
        entityId: id,
        details: {
          businessName: provider.businessName,
          ownerEmail: provider.user.email,
        },
      },
    });

    return res.json({ msg: "Бизнес амжилттай устгагдлаа" });
  } catch (err) {
    console.error("DELETE PROVIDER ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

// =========================
// BOOKING MANAGEMENT
// =========================

// GET /api/admin/bookings - Get all bookings with filtering
router.get("/bookings", adminMiddleware, async (req: any, res: Response) => {
  try {
    const { status, providerId, customerId, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    // Build filter
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [bookings, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          provider: {
            select: {
              id: true,
              businessName: true,
              nickname: true,
            },
          },
          service: true,
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return res.json({
      bookings,
      totalCount,
      totalPages: Math.ceil(totalCount / take),
      currentPage: parseInt(page as string),
    });
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

// POST /api/admin/bookings/:id/cancel - Admin cancels booking
router.post("/bookings/:id/cancel", adminMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ msg: "Цуцлах шалтгаанаа оруулна уу" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, fullName: true },
        },
        provider: {
          select: {
            userId: true,
            businessName: true,
          },
        },
        service: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ msg: "Захиалга олдсонгүй" });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({ msg: "Энэ захиалга аль хэдийн цуцлагдсан байна" });
    }

    // Cancel appointment
    await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "BOOKING_CANCELLED_BY_ADMIN",
        entityId: id,
        details: {
          reason,
          customer: appointment.customer.fullName,
          provider: appointment.provider.businessName,
        },
      },
    });

    // Notify both customer and provider
    const formattedDate = new Date(appointment.appointmentTime).toLocaleString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: appointment.customer.id,
        type: "BOOKING_CANCELLED",
        title: "Захиалга цуцлагдлаа (Админ)",
        message: `Таны ${appointment.service.name} үйлчилгээний цаг админаар цуцлагдлаа.\n\nБизнес: ${appointment.provider.businessName}\nОгноо: ${formattedDate}\n\nШалтгаан: ${reason}`,
        bookingId: id,
        providerId: appointment.providerId,
      },
    });

    // Notify provider
    await prisma.notification.create({
      data: {
        userId: appointment.provider.userId,
        type: "BOOKING_CANCELLED",
        title: "Захиалга цуцлагдлаа (Админ)",
        message: `${appointment.customer.fullName}-ийн захиалга админаар цуцлагдлаа.\n\nҮйлчилгээ: ${appointment.service.name}\nОгноо: ${formattedDate}\n\nШалтгаан: ${reason}`,
        bookingId: id,
        providerId: appointment.providerId,
      },
    });

    return res.json({ msg: "Захиалга амжилттай цуцлагдлаа" });
  } catch (err) {
    console.error("ADMIN CANCEL BOOKING ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

// =========================
// AUDIT LOGS
// =========================

// GET /api/admin/audit-logs - Get audit logs with filtering
router.get("/audit-logs", adminMiddleware, async (req: any, res: Response) => {
  try {
    const { userId, action, page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    // Build filter
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Fetch user details for each log
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = await prisma.user.findUnique({
          where: { id: log.userId },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        });

        return {
          ...log,
          user,
        };
      })
    );

    return res.json({
      logs: logsWithUsers,
      totalCount,
      totalPages: Math.ceil(totalCount / take),
      currentPage: parseInt(page as string),
    });
  } catch (err) {
    console.error("GET AUDIT LOGS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa" });
  }
});

export default router;
