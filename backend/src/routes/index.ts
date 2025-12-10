import { Router } from "express";
import authRoutes from "./auth.routes";
import providerRoutes from "./provider.routes";
import serviceRoutes from "./service.routes";
import scheduleRoutes from "./schedule.routes";
import slotsRoutes from "./slots.routes";
import bookingRoutes from "./booking.routes";
import auditRoutes from "./audit.routes";
import notificationRoutes from "./notification.routes";
import bookmarkRoutes from "./bookmark.routes";
import adminRoutes from "./admin.routes";

const router = Router();

/* HEALTH */
router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* TEST */
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    msg: "Backend is talking to Frontend 🔥",
  });
});

/* AUTH */
router.use("/auth", authRoutes);

/* PROVIDERS */
router.use("/providers", providerRoutes);
// This creates /api/providers

/* SERVICES */
router.use("/services", serviceRoutes);
// This creates /api/services

/* SCHEDULES */
router.use("/schedules", scheduleRoutes);
// This creates /api/schedules

/* SLOTS */
router.use("/slots", slotsRoutes);
// This creates /api/slots

/* BOOKINGS */
router.use("/bookings", bookingRoutes);
// This creates /api/bookings

/* AUDIT LOGS */
router.use("/audit-logs", auditRoutes);
// This creates /api/audit-logs

/* NOTIFICATIONS */
router.use("/notifications", notificationRoutes);
// This creates /api/notifications

/* BOOKMARKS */
router.use("/bookmarks", bookmarkRoutes);
// This creates /api/bookmarks

/* ADMIN */
router.use("/admin", adminRoutes);
// This creates /api/admin

export default router;
