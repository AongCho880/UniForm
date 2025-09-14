# Deploy to Vercel (Serverless + Neon)

This repo is now configured to deploy as a single Vercel project:

- Frontend: built from `uniform-frontend` using `@vercel/static-build`
- Backend: Vercel Serverless Function(s) in `api/` reusing the existing Express app
- Database: Neon (PostgreSQL) via Prisma

## What changed

- Added `backend/app.js` exporting `createApp({ basePath })` so the same Express app works for local dev (`/api`) and serverless (no prefix).
- Simplified `backend/server.js` to reuse `createApp` and only `listen()` for local dev.
- Created `api/index.js` (Vercel Serverless Function) that mounts the Express app at the function root.
- Updated `vercel.json` to:
  - Build frontend from `uniform-frontend` (distDir `dist`).
  - Build serverless functions from `api/**/*.js` using `@vercel/node`.
  - Serve SPA by rewriting all non-file paths to `/index.html`.
- Added root `package.json` with backend deps and a `postinstall` script to run `prisma generate` against `backend/prisma/schema.prisma` during Vercel build.
- Set axios base URL default to same-origin `/api` in `uniform-frontend/src/api/axios.ts`.
- Removed hard-coded localhost fallbacks in profile and admit card helpers to support same-origin in production.
- Added a Vite dev proxy so `fetch('/api')` works locally without extra env config.

## Environment variables

Set these in your Vercel Project Settings → Environment Variables (Production + Preview):

- `DATABASE_URL`: Neon connection string (prefer pooled). Example:
  `postgres://USER:PASS@YOUR-NEON-HOST/db?sslmode=require&pgbouncer=true&connect_timeout=15`
- `JWT_SECRET`: a long random string.
- `FRONTEND_ORIGIN`: optional; the deployed frontend origin if you want stricter CORS (e.g., `https://your-app.vercel.app`).
- `DISABLE_RATE_LIMIT`: optional `true` to disable rate limiting (not recommended in production).

Notes:
- Neon + serverless: use a pooled connection string to avoid exhausting connections. Prisma works fine with Neon when pgbouncer is enabled.
- If you hit connection issues, consider adding `pool_timeout=30` to `DATABASE_URL`.

## Local development

1) Backend

```bash
cd backend
cp .env.example .env   # if you have one; otherwise create .env
# Ensure DATABASE_URL and JWT_SECRET are set in backend/.env
npm install
npm run server
```

2) Frontend

```bash
cd uniform-frontend
npm install
npm run dev
```

With the new Vite proxy, the frontend dev server will proxy `/api` to `http://localhost:5000` automatically. You no longer need to set `VITE_API_URL` for local dev (you still can if you prefer).

## Deploying to Vercel

1) Push your changes to GitHub.
2) In Vercel, create or use the existing project pointing at the repository root.
3) Add the Environment Variables listed above.
4) Trigger a deployment.

Vercel will:
- Install root dependencies (for functions + Prisma).
- Run `postinstall` → `prisma generate --schema backend/prisma/schema.prisma`.
- Build the frontend via `@vercel/static-build` from `uniform-frontend`.
- Bundle the serverless function in `api/index.js`.

When the deployment is live:
- Frontend is served at `/`.
- Backend is available at `/api/*` on the same domain.

## Database migrations

If your Neon database already matches the Prisma schema, no action is required. Otherwise run migrations locally against Neon or from a CI step:

```bash
# From repo root
npx prisma migrate deploy --schema backend/prisma/schema.prisma
# Or to push current schema without migration history (use with care)
npx prisma db push --schema backend/prisma/schema.prisma
```

## File uploads

- The app uses `express-fileupload`, and profile images are saved into the database as data URLs. This is compatible with serverless.
- Do not attempt to write to the filesystem at runtime (serverless file systems are ephemeral). Serving static assets from `uniform-frontend/public` is fine.

## CORS

- Since the frontend and backend are on the same Vercel domain, calls go to same-origin `/api` and do not require CORS.
- The server keeps a permissive CORS configuration to allow Vercel preview deployments.

## Troubleshooting

- Prisma engine/binaries: handled by `postinstall`. If you see engine errors, clear Vercel cache and redeploy.
- Too many DB connections: ensure you use the pooled Neon connection string (`pgbouncer=true`). Reduce cold starts by keeping functions concise.
- Request body limits: Vercel serverless has a ~5MB body limit. Keep uploads small or move heavy uploads to object storage.

