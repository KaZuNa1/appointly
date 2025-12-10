import { Request, Response } from "express";
import { prisma } from "../config/db";

// ----------------------
// 1. GET ALL NOTIFICATIONS (with pagination)
// ----------------------
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              nickname: true,
            }
          },
          booking: {
            select: {
              id: true,
              appointmentTime: true,
              status: true,
            }
          }
        }
      }),
      prisma.notification.count({ where: { userId } })
    ]);

    res.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasMore: page * limit < total
      }
    });
  } catch (error: any) {
    console.error("Get notifications error:", error.message);
    res.status(500).json({ msg: "Мэдэгдэл татахад алдаа гарлаа." });
  }
};

// ----------------------
// 2. GET UNREAD COUNT
// ----------------------
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({ unreadCount: count });
  } catch (error: any) {
    console.error("Get unread count error:", error.message);
    res.status(500).json({ msg: "Уншаагүй мэдэгдэл тоолоход алдаа гарлаа." });
  }
};

// ----------------------
// 3. MARK NOTIFICATION AS READ
// ----------------------
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ msg: "Мэдэгдэл олдсонгүй." });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Mark as read error:", error.message);
    res.status(500).json({ msg: "Мэдэгдэл уншсан гэж тэмдэглэхэд алдаа гарлаа." });
  }
};

// ----------------------
// 4. MARK ALL AS READ
// ----------------------
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({
      msg: "Бүх мэдэгдэл уншсан гэж тэмдэглэгдлээ.",
      count: result.count
    });
  } catch (error: any) {
    console.error("Mark all as read error:", error.message);
    res.status(500).json({ msg: "Бүх мэдэгдэл тэмдэглэхэд алдаа гарлаа." });
  }
};

// ----------------------
// 5. DELETE NOTIFICATION
// ----------------------
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ msg: "Мэдэгдэл олдсонгүй." });
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ msg: "Мэдэгдэл устгагдлаа." });
  } catch (error: any) {
    console.error("Delete notification error:", error.message);
    res.status(500).json({ msg: "Мэдэгдэл устгахад алдаа гарлаа." });
  }
};

// ----------------------
// 6. CREATE NOTIFICATION (Helper function for internal use)
// ----------------------
export const createNotification = async (data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  bookingId?: string;
  providerId?: string;
}) => {
  try {
    const notification = await prisma.notification.create({
      data
    });
    return notification;
  } catch (error: any) {
    console.error("Create notification error:", error.message);
    throw error;
  }
};
