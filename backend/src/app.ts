import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
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

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[error]", err);
  if (res.headersSent) return;
  res
    .status(500)
    .json({ error: "An unexpected error occurred. Please try again later." });
});

export default app;
