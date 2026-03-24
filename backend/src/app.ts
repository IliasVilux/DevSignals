import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { rateLimit } from "express-rate-limit";
import marketRoutes from "./routes/market.routes";
import countriesRoutes from "./routes/countries.routes";
import authRoutes from "./routes/auth.routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import skillsRoutes from "./routes/skills.routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://dev-signals.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-8",
  message: { error: "Too many requests, please try again later." },
});

app.use("/api", apiLimiter);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/skills", skillsRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[error]", err);
  if (res.headersSent) return;
  res
    .status(500)
    .json({ error: "An unexpected error occurred. Please try again later." });
});

export default app;
