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

app.use(
	cors({
		origin: [
			"http://localhost:5173", // local dev
			"https://uni-form-app.vercel.app/", // production frontend
		],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
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
