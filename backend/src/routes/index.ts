import express from "express";

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Test route to check frontend ↔ backend connection
router.get("/test", (req, res) => {
  res.json({
    ok: true,
    msg: "Backend is talking to Frontend 🔥",
  });
});

export default router;
