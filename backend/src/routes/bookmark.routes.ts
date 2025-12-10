import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
  checkBookmark,
  getBookmarkCount,
} from "../controllers/bookmark.controller";

const router = Router();

/**
 * POST /api/bookmarks
 * Add a bookmark (customers only)
 */
router.post("/", authMiddleware, addBookmark);

/**
 * DELETE /api/bookmarks/:providerId
 * Remove a bookmark
 */
router.delete("/:providerId", authMiddleware, removeBookmark);

/**
 * GET /api/bookmarks
 * Get user's bookmarked providers
 */
router.get("/", authMiddleware, getBookmarks);

/**
 * GET /api/bookmarks/check/:providerId
 * Check if a provider is bookmarked
 */
router.get("/check/:providerId", authMiddleware, checkBookmark);

/**
 * GET /api/bookmarks/count/:providerId
 * Get bookmark count for a provider (public)
 */
router.get("/count/:providerId", getBookmarkCount);

export default router;
