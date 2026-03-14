import express from "express";
import { rateLimit } from "express-rate-limit";
import marketRoutes from "./routes/market.routes";
import countriesRoutes from "./routes/countries.routes";
import cors from "cors";

const app = express();

app.use(
  cors({ origin: ["http://localhost:5173", "https://dev-signals.vercel.app"] })
);
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000,
  standardHeaders: "draft-8",
  message: { error: "Too many requests, please try again later." },
});

app.use("/api", apiLimiter);

app.use("/api/market", marketRoutes);
app.use("/api/countries", countriesRoutes);

export default app;
