// backend/server.js

import cors from "cors";
import "dotenv/config";
import express from "express";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import {limiter} from "./config/rateLimiter.js";


const app = express();
const PORT = process.env.PORT || 5000;

// Ensure correct client IP when behind a reverse proxy (nginx, Vercel, Heroku)
// This improves accuracy for IP-based rate limiting fallbacks.
app.set("trust proxy", 1);

// CORS configuration: allow local dev, production, and Vercel previews
const allowedOrigins = [
  "http://localhost:5173",
  "https://uniform-49v3.vercel.app",
  process.env.FRONTEND_ORIGIN || "https://uni-form-app.vercel.app",
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const normalize = (s) => (typeof s === 'string' ? s.replace(/\/$/, '') : s)
      const requestOrigin = normalize(origin)
      const isWhitelisted = allowedOrigins.some((o) => normalize(o) === requestOrigin)
      let isVercelPreview = false
      try {
        const host = new URL(origin).hostname
        isVercelPreview = /\.vercel\.app$/.test(host)
      } catch { /* ignore invalid origin */ }
      if (isWhitelisted || isVercelPreview) return callback(null, true)
      return callback(new Error(`Not allowed by CORS: ${origin}`))
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
// Apply rate limiting only when not explicitly disabled (e.g., during local dev)
if (process.env.DISABLE_RATE_LIMIT !== "true") {
  app.use(limiter);
}
// Serve uploaded images and public assets
import path from "path";
app.use(
  "/public",
  express.static(path.join(process.cwd(), "public"), {
    etag: true,
    lastModified: true,
    immutable: true,
    maxAge: "1d",
  })
);

app.get("/", (req, res) => {
	return res.json({ message: "Hello, it's working..." });
});

import apiRoutes from "./routes/api.js";
app.use("/api", apiRoutes); // Main API routes

import adminRoute from "./routes/adminRoute.js";
app.use("/api/admin", adminRoute); // For institution admin

import systemAdminRoute from "./routes/systemAdminRoute.js";
app.use("/api/system", systemAdminRoute); // For system admin

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
