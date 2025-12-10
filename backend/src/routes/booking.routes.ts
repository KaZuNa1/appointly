import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { prisma } from "../config/db";
import { logBookingAction } from "../utils/audit";
import { createNotification } from "../controllers/notification.controller";

const router = Router();

// POST /api/bookings - Create a new booking
router.post("/", authMiddleware, async (req: any, res: Response) => {
  try {
    const customerId = req.user.id;
    const { providerId, serviceId, appointmentTime, notes } = req.body;

    if (!providerId || !serviceId || !appointmentTime) {
      return res.status(400).json({ msg: "Shaardlagat mei deel ui oruulna uu" });
    }

    // Parse appointment time
    const appointmentDate = new Date(appointmentTime);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // VALIDATION 1: Check if customer already has a booking for THIS SERVICE on THIS DAY
    // (Can book same service on different days, but not twice on same day)
    const existingServiceBookingToday = await prisma.appointment.findFirst({
      where: {
        customerId,
        serviceId,
        appointmentTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (existingServiceBookingToday) {
      return res.status(400).json({
        msg: "Та энэ үйлчилгээг энэ өдөр аль хэдийн захиалсан байна. Нэг үйлчилгээг нэг өдөрт зөвхөн нэг удаа захиалах боломжтой.",
      });
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ msg: "Uilchilgee oldsongui" });
    }

    // VALIDATION 2: Check if provider has schedule for this date
    const schedule = await prisma.workingHours.findFirst({
      where: {
        providerId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!schedule) {
      return res.status(400).json({
        msg: "Ene odorт uilchilgee uzuuleхgui bayna",
      });
    }

    // VALIDATION 3: Check if time slot is within working hours
    const appointmentHour = appointmentDate.getHours();
    const appointmentMin = appointmentDate.getMinutes();
    const appointmentMinutes = appointmentHour * 60 + appointmentMin;

    const [openHour, openMin] = schedule.openTime.split(":").map(Number);
    const [closeHour, closeMin] = schedule.closeTime.split(":").map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    const serviceEndMinutes = appointmentMinutes + service.duration;

    if (appointmentMinutes < openMinutes || serviceEndMinutes > closeMinutes) {
      return res.status(400).json({
        msg: "Songosон tsag ajliin tsagт bagтakhgui bayna",
      });
    }

    // VALIDATION 4: Check if time slot doesn't conflict with other bookings (no overlapping)
    const existingBookings = await prisma.appointment.findMany({
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
        service: {
          select: { duration: true },
        },
      },
    });

    // Check for conflicts
    for (const booking of existingBookings) {
      const bookingDate = new Date(booking.appointmentTime);
      const bookingHour = bookingDate.getHours();
      const bookingMin = bookingDate.getMinutes();
      const bookingStartMinutes = bookingHour * 60 + bookingMin;
      const bookingEndMinutes = bookingStartMinutes + booking.service.duration;

      // Check for overlap
      if (
        (appointmentMinutes >= bookingStartMinutes && appointmentMinutes < bookingEndMinutes) ||
        (serviceEndMinutes > bookingStartMinutes && serviceEndMinutes <= bookingEndMinutes) ||
        (appointmentMinutes <= bookingStartMinutes && serviceEndMinutes >= bookingEndMinutes)
      ) {
        return res.status(400).json({
          msg: "Ene tsag ali hediinee zahialgdsan bn",
        });
      }
    }

    // Create booking
    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        providerId,
        serviceId,
        appointmentTime: appointmentDate,
        notes: notes || "",
        status: "PENDING",
      },
      include: {
        service: true,
        provider: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
      },
    });

    // Log booking creation
    await logBookingAction(customerId, "BOOKING_CREATED", appointment.id, {
      serviceId,
      providerId,
      appointmentTime: appointmentDate,
      serviceName: appointment.service.name,
    });

    // Get customer info for provider notification
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { fullName: true, phone: true },
    });

    // Create notifications
    try {
      const formattedDate = new Date(appointmentDate).toLocaleString('mn-MN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Notification for customer
      await createNotification({
        userId: customerId,
        type: "BOOKING_CONFIRMED",
        title: "Цаг захиалга амжилттай!",
        message: `Таны ${appointment.service.name} үйлчилгээний цаг амжилттай захиалагдлаа.\n\nБизнес: ${appointment.provider.businessName}\nОгноо: ${formattedDate}\n\nБид таныг хүлээж байна!`,
        bookingId: appointment.id,
        providerId: appointment.providerId,
      });

      // Notification for provider
      await createNotification({
        userId: appointment.provider.userId,
        type: "NEW_BOOKING",
        title: "Шинэ захиалга ирлээ!",
        message: `${customer?.fullName || "Хэрэглэгч"} таны ${appointment.service.name} үйлчилгээг захиаллаа.\n\nОгноо: ${formattedDate}\n${customer?.phone ? `Утас: ${customer.phone}` : ""}\n${notes ? `\nТэмдэглэл: ${notes}` : ""}`,
        bookingId: appointment.id,
        providerId: appointment.providerId,
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
      // Don't fail the booking if notification fails
    }

    return res.status(201).json({
      msg: "Tsag amjilttай zaхialagudsaa",
      appointment,
    });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa." });
  }
});

// GET /api/bookings/my - Get user's bookings
router.get("/my", authMiddleware, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const appointments = await prisma.appointment.findMany({
      where: { customerId: userId },
      include: {
        service: true,
        provider: {
          select: {
            id: true,
            businessName: true,
            phone: true,
            address: true,
            latitude: true,
            longitude: true,
          } as any, // Type assertion to handle optional fields
        },
      },
      orderBy: { appointmentTime: "asc" },
    });

    // Transform the response to match frontend expectations
    const formattedAppointments = appointments.map((apt) => ({
      ...apt,
      businessProvider: apt.provider,
    }));

    return res.json({ appointments: formattedAppointments });
  } catch (err) {
    console.error("GET MY BOOKINGS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa." });
  }
});

// GET /api/bookings/provider - Get provider's bookings
router.get("/provider", authMiddleware, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Get provider profile
    const provider = await prisma.businessProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Biznes profail oldsongui" });
    }

    const appointments = await prisma.appointment.findMany({
      where: { providerId: provider.id },
      include: {
        service: true,
        customer: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { appointmentTime: "asc" },
    });

    return res.json({ appointments });
  } catch (err) {
    console.error("GET PROVIDER BOOKINGS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa." });
  }
});

// PATCH /api/bookings/:id/status - Update booking status
router.patch("/:id/status", authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ msg: "Buruу status" });
    }

    // Get full appointment details before update
    const oldAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        provider: {
          include: {
            user: { select: { id: true } },
          },
        },
        customer: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!oldAppointment) {
      return res.status(404).json({ msg: "Захиалга олдсонгүй" });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        service: true,
        provider: true,
        customer: { select: { fullName: true } },
      },
    });

    const formattedDate = new Date(appointment.appointmentTime).toLocaleString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Determine who initiated the action (provider or customer)
    const isProvider = userId === oldAppointment.provider.user.id;
    const isCustomer = userId === oldAppointment.customer.id;

    // Log status change
    if (status === "CANCELLED") {
      await logBookingAction(userId, "BOOKING_CANCELLED", id, {
        previousStatus: oldAppointment.status,
        newStatus: status
      });

      // Send notification to the OTHER party
      try {
        if (isProvider) {
          // Provider cancelled -> notify customer
          await createNotification({
            userId: oldAppointment.customer.id,
            type: "BOOKING_CANCELLED",
            title: "Цаг захиалга цуцлагдлаа",
            message: `Таны ${appointment.service.name} үйлчилгээний цаг цуцлагдлаа.\n\nБизнес: ${appointment.provider.businessName}\nОгноо: ${formattedDate}\n\nУучлаарай, та өөр цаг сонгоно уу.`,
            bookingId: id,
            providerId: appointment.providerId,
          });
        } else if (isCustomer) {
          // Customer cancelled -> notify provider
          await createNotification({
            userId: oldAppointment.provider.user.id,
            type: "BOOKING_CANCELLED_BY_CUSTOMER",
            title: "Захиалга цуцлагдлаа",
            message: `${oldAppointment.customer.fullName} өөрийн ${appointment.service.name} үйлчилгээний цагийг цуцаллаа.\n\nОгноо: ${formattedDate}`,
            bookingId: id,
            providerId: appointment.providerId,
          });
        }
      } catch (notifError) {
        console.error("Failed to create cancellation notification:", notifError);
      }
    } else if (status === "CONFIRMED") {
      await logBookingAction(userId, "BOOKING_CONFIRMED", id, {
        previousStatus: oldAppointment.status,
        newStatus: status
      });

      // Provider confirmed -> notify customer
      if (isProvider) {
        try {
          await createNotification({
            userId: oldAppointment.customer.id,
            type: "BOOKING_APPROVED",
            title: "Цаг баталгаажлаа!",
            message: `Таны ${appointment.service.name} үйлчилгээний цаг баталгаажлаа!\n\nБизнес: ${appointment.provider.businessName}\nОгноо: ${formattedDate}\n\nБид таныг хүлээж байна!`,
            bookingId: id,
            providerId: appointment.providerId,
          });
        } catch (notifError) {
          console.error("Failed to create confirmation notification:", notifError);
        }
      }
    }

    return res.json({
      msg: "Tsagiiin status shinelegudslee",
      appointment,
    });
  } catch (err) {
    console.error("UPDATE BOOKING STATUS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa." });
  }
});

// POST /api/bookings/:id/cancel - Customer cancels booking (with policy check)
router.post("/:id/cancel", authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get appointment with provider details
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        provider: {
          select: {
            businessName: true,
            cancellationHours: true,
            userId: true,
          },
        },
        customer: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ msg: "Захиалга олдсонгүй" });
    }

    // Verify this is the customer's booking
    if (appointment.customerId !== userId) {
      return res.status(403).json({ msg: "Танд энэ үйлдлийг хийх эрх байхгүй" });
    }

    // Check if already cancelled
    if (appointment.status === "CANCELLED") {
      return res.status(400).json({ msg: "Энэ захиалга аль хэдийн цуцлагдсан байна" });
    }

    // Check cancellation policy
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentTime);
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < appointment.provider.cancellationHours) {
      return res.status(400).json({
        msg: `Уучлаарай, цаг захиалгаас ${appointment.provider.cancellationHours} цагийн өмнө л цуцлах боломжтой. Та одоо цуцлах боломжгүй байна.`,
      });
    }

    // Cancel the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        service: true,
        provider: true,
      },
    });

    // Log cancellation
    await logBookingAction(userId, "BOOKING_CANCELLED", id, {
      previousStatus: appointment.status,
      reason: "Customer cancelled",
    });

    // Notify provider
    try {
      const formattedDate = new Date(appointment.appointmentTime).toLocaleString('mn-MN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      await createNotification({
        userId: appointment.provider.userId,
        type: "BOOKING_CANCELLED_BY_CUSTOMER",
        title: "Захиалга цуцлагдлаа",
        message: `${appointment.customer.fullName} өөрийн ${appointment.service.name} үйлчилгээний цагийг цуцаллаа.\n\nОгноо: ${formattedDate}`,
        bookingId: id,
        providerId: appointment.providerId,
      });
    } catch (notifError) {
      console.error("Failed to create cancellation notification:", notifError);
    }

    return res.json({
      msg: "Цаг амжилттай цуцлагдлаа",
      appointment: updatedAppointment,
    });
  } catch (err) {
    console.error("CANCEL BOOKING ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa." });
  }
});

// POST /api/bookings/:id/provider-cancel - Provider cancels booking with reason
router.post("/:id/provider-cancel", authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ msg: "Цуцлах шалтгаанаа оруулна уу" });
    }

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        provider: {
          select: {
            userId: true,
            businessName: true,
          },
        },
        customer: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ msg: "Захиалга олдсонгүй" });
    }

    // Verify this is the provider's booking
    if (appointment.provider.userId !== userId) {
      return res.status(403).json({ msg: "Танд энэ үйлдлийг хийх эрх байхгүй" });
    }

    // Check if already cancelled
    if (appointment.status === "CANCELLED") {
      return res.status(400).json({ msg: "Энэ захиалга аль хэдийн цуцлагдсан байна" });
    }

    // Cancel the appointment with reason
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
      },
      include: {
        service: true,
        provider: true,
      },
    });

    // Log cancellation
    await logBookingAction(userId, "BOOKING_CANCELLED_BY_PROVIDER", id, {
      previousStatus: appointment.status,
      reason: reason,
    });

    // Notify customer with cancellation reason
    try {
      const formattedDate = new Date(appointment.appointmentTime).toLocaleString('mn-MN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      await createNotification({
        userId: appointment.customer.id,
        type: "BOOKING_CANCELLED",
        title: "Цаг захиалга цуцлагдлаа",
        message: `Таны ${appointment.service.name} үйлчилгээний цаг цуцлагдлаа.\n\nБизнес: ${appointment.provider.businessName}\nОгноо: ${formattedDate}\n\nШалтгаан: ${reason}\n\nУучлаарай, та өөр цаг сонгоно уу.`,
        bookingId: id,
        providerId: appointment.providerId,
      });
    } catch (notifError) {
      console.error("Failed to create cancellation notification:", notifError);
    }

    return res.json({
      msg: "Цаг амжилттай цуцлагдлаа",
      appointment: updatedAppointment,
    });
  } catch (err) {
    console.error("PROVIDER CANCEL BOOKING ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa." });
  }
});

export default router;
