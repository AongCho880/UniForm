// backend/app.js
import cors from "cors";
import "dotenv/config";
import express from "express";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { limiter } from "./config/rateLimiter.js";

// Routes
import apiRoutes from "./routes/api.js";
import adminRoute from "./routes/adminRoute.js";
import systemAdminRoute from "./routes/systemAdminRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeOrigin(s) {
  return typeof s === "string" ? s.replace(/\/$/, "") : s;
}

export function createApp({ basePath = "/api" } = {}) {
  const app = express();

  // Ensure correct client IP when behind proxies (Vercel, nginx)
  app.set("trust proxy", 1);

  // CORS: allow local dev, production, and Vercel previews
  const allowedOrigins = [
    "http://localhost:5173",
    "https://uniform-49v3.vercel.app",
    process.env.FRONTEND_ORIGIN || "https://uni-form-app.vercel.app",
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const requestOrigin = normalizeOrigin(origin);
        const isWhitelisted = allowedOrigins.some((o) => normalizeOrigin(o) === requestOrigin);
        let isVercelPreview = false;
        try {
          const host = new URL(origin).hostname;
          isVercelPreview = /\.vercel\.app$/.test(host);
        } catch {
          /* ignore invalid origin */
        }
        if (isWhitelisted || isVercelPreview) return callback(null, true);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept"],
      credentials: true,
      optionsSuccessStatus: 204,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(fileUpload());
  app.use(helmet());

  // Apply rate limiting only when not disabled
  if (process.env.DISABLE_RATE_LIMIT !== "true") {
    app.use(limiter);
  }

  // Static assets: serve any bundled files under backend/public (read-only on serverless)
  app.use(
    "/public",
    express.static(path.join(__dirname, "public"), {
      etag: true,
      lastModified: true,
      immutable: true,
      maxAge: "1d",
    })
  );

  // Health check
  app.get("/", (req, res) => {
    return res.json({ message: "Hello, it's working..." });
  });

  // Helper to resolve base + subpath with single slash
  const joinBase = (sub = "") => {
    const a = String(basePath || "").replace(/\/$/, "");
    const b = String(sub || "");
    return `${a}${b}` || "/";
  };

  // Mount routes under the provided basePath ("/api" locally, "" on Vercel functions)
  app.use(joinBase(""), apiRoutes); // Main API routes
  app.use(joinBase("/admin"), adminRoute); // Institution admin
  app.use(joinBase("/system"), systemAdminRoute); // System admin

  return app;
}

export default createApp;

