import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notification.controller";

const router = Router();

/**
 * GET /api/notifications
 * Get all notifications for authenticated user (paginated)
 */
router.get("/", authMiddleware, getNotifications);

/**
 * GET /api/notifications/unread
 * Get count of unread notifications
 */
router.get("/unread", authMiddleware, getUnreadCount);

/**
 * POST /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.post("/:id/read", authMiddleware, markAsRead);

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
router.post("/read-all", authMiddleware, markAllAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
