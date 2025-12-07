import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import passport from "../config/passport";

const router = Router();

/* =======================
      AUTH ROUTES
======================= */

// User register
router.post("/register", authController.registerUser);

// Business register
router.post("/business/register", authController.registerBusiness);

// User login (customers + providers use same login)
router.post("/login", authController.login);

// Get profile of logged-in user (JWT required)
router.get("/me", authMiddleware, authController.getProfile);

// Update profile (fullName)
router.put("/profile", authMiddleware, authController.updateProfile);

// Update email
router.put("/email", authMiddleware, authController.updateEmail);

// Update password
router.put("/password", authMiddleware, authController.updatePassword);

// Update avatar
router.put("/avatar", authMiddleware, authController.updateAvatar);

// Email verification
router.post("/verify-email", authController.verifyEmail);

// Resend verification email
router.post("/resend-verification", authController.resendVerification);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Reset password
router.post("/reset-password", authController.resetPassword);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=authentication_failed`
  }),
  authController.googleCallback
);

export default router;
