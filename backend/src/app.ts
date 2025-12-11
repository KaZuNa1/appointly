import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "./config/passport";
import routes from "./routes/index";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://appointly-lyart.vercel.app", // Current Vercel URL
      "https://appointly.space", // Custom domain
      "https://www.appointly.space", // Custom domain with www
    ],
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

// Initialize Passport
app.use(passport.initialize());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Main API routes
app.use("/api", routes);

export default app;
