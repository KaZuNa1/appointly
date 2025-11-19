import { Router } from "express";
import authRoutes from "./auth.routes";
import providerRoutes from "./provider.routes";

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

export default router;
