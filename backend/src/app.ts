import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://appointly-bay.vercel.app",
    ],
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Main API routes
app.use("/api", routes);

export default app;
