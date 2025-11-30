import { Router, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { prisma } from "../config/db";

const router = Router();

/**
 * GET /api/audit-logs/my
 * Get audit logs for the current user
 */
router.get("/my", authMiddleware, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.auditLog.count({ where: { userId } });

    return res.json({
      logs: auditLogs,
      total,
      limit,
      offset,
    });
  } catch (err) {
    console.error("GET AUDIT LOGS ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa." });
  }
});

/**
 * GET /api/audit-logs/action/:action
 * Get audit logs by action type (e.g., LOGIN, BOOKING_CREATED)
 */
router.get("/action/:action", authMiddleware, async (req: any, res: Response) => {
  try {
    const { action } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const auditLogs = await prisma.auditLog.findMany({
      where: { action },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.auditLog.count({ where: { action } });

    return res.json({
      logs: auditLogs,
      action,
      total,
      limit,
      offset,
    });
  } catch (err) {
    console.error("GET AUDIT LOGS BY ACTION ERROR:", err);
    return res.status(500).json({ msg: "Server aldaa garlaa." });
  }
});

/**
 * GET /api/audit-logs/entity/:entityId
 * Get audit logs for a specific entity (booking, profile, etc)
 */
router.get(
  "/entity/:entityId",
  authMiddleware,
  async (req: any, res: Response) => {
    try {
      const { entityId } = req.params;

      const auditLogs = await prisma.auditLog.findMany({
        where: { entityId },
        orderBy: { timestamp: "desc" },
      });

      return res.json({
        logs: auditLogs,
        entityId,
        total: auditLogs.length,
      });
    } catch (err) {
      console.error("GET ENTITY AUDIT LOGS ERROR:", err);
      return res.status(500).json({ msg: "Server aldaa garlaa." });
    }
  }
);

export default router;
