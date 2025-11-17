import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index";

const app = express();

// === Core Middleware ===
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// === Health Check Endpoint ===
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// === Main API Routes ===
app.use("/api", routes);

export default app;
