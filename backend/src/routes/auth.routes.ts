import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

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

export default router;
