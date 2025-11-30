import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { prisma } from "../config/db";

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

    // VALIDATION 1: Check if customer already has an active booking for THIS SERVICE (any date)
    const existingServiceBooking = await prisma.appointment.findFirst({
      where: {
        customerId,
        serviceId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (existingServiceBooking) {
      return res.status(400).json({
        msg: "Та энэ үйлчилгээг аль хэдийн захиалсан байна. Нэг үйлчилгээг зөвхөн нэг удаа захиалах боломжтой.",
      });
    }

    // VALIDATION 2: Check if customer already has a booking for THIS SERVICE on THIS DAY
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
        msg: "Та энэ үйлчилгээг өнөөдөр аль хэдийн захиалсан байна. Нэг үйлчилгээг нэг өдрийн дотор зөвхөн нэг удаа захиалах боломжтой.",
      });
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ msg: "Uilchilgee oldsongui" });
    }

    // VALIDATION 3: Check if provider has schedule for this date
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

    // VALIDATION 4: Check if time slot is within working hours
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

    // VALIDATION 5: Check if slot is not already booked by others (no overlapping time slots)
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
          msg: "Ene tsag alth hediin zaхialagudsans bayna",
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

    if (!["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ msg: "Buruу status" });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    return res.json({
      msg: "Tsagiiin status shinelegudslee",
      appointment,
    });
  } catch (err) {
    console.error("UPDATE BOOKING STATUS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa." });
  }
});

export default router;
