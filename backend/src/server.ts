import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { prisma } from "./config/db";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // === Connect to DB ===
    await prisma.$connect();
    console.log("🔥 Connected to PostgreSQL via Prisma");

    // === Start Server ===
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// === Graceful Shutdown Handler ===
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Server terminated...");
  await prisma.$disconnect();
  process.exit(0);
});
