import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import sanitizeMiddleware from "./middlewares/sanitize.middleware.js";
import config from "./config/index.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";
import { protect } from "./middlewares/auth.middleware.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: config.corsOrigins.length ? config.corsOrigins : true,
    credentials: true,
  })
);

app.use(morgan(config.isProduction ? "combined" : "dev"));

app.use(express.json({ limit: "5mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(compression());

app.use(sanitizeMiddleware());

app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Public auth endpoints (no JWT required)
app.use("/api/v1/auth", authRoutes);

// Protected API group
app.use("/api/v1", protect, routes);

app.use(notFound);

app.use(errorHandler);

export default app;