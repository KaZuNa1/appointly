import { prisma } from "../config/db";

/**
 * Log an action to the audit trail
 * @param userId - The user performing the action
 * @param action - The action type (LOGIN, BOOKING_CREATED, etc)
 * @param entityId - Optional ID of the affected resource
 * @param details - Optional additional details about the action
 */
export async function logAudit(
  userId: string,
  action: string,
  entityId?: string,
  details?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityId: entityId || null,
        details: details || null,
      },
    });
  } catch (err) {
    // Don't throw error if audit logging fails - just log it
    console.error("Audit logging error:", err);
  }
}

/**
 * Log a booking action
 */
export async function logBookingAction(
  userId: string,
  action: "BOOKING_CREATED" | "BOOKING_CANCELLED" | "BOOKING_CONFIRMED" | "BOOKING_CANCELLED_BY_PROVIDER",
  bookingId: string,
  details?: any
) {
  await logAudit(userId, action, bookingId, details);
}

/**
 * Log a login action
 */
export async function logLogin(userId: string, details?: any) {
  await logAudit(userId, "LOGIN", undefined, details);
}

/**
 * Log a profile update
 */
export async function logProfileUpdate(
  userId: string,
  entityId: string | null,
  changes: any
) {
  await logAudit(userId, "PROFILE_UPDATED", entityId || undefined, { changes });
}
