// api/index.js - Vercel Serverless Function entrypoint
// Reuse the existing Express app, mounted at root for serverless (no "/api" prefix).
import { createApp } from "../backend/app.js";

const app = createApp({ basePath: "" });

export default app;

