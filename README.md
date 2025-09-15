# UniForm — Integrated Admissions Platform

UniForm streamlines university admissions by connecting Students, Institutions, and System Admins in one platform. Students apply using a single academic profile, Institutions manage unit-based criteria and applications, and Admins oversee the ecosystem and publish notices.

—

## Monorepo Structure

-   `backend/` — Node.js + Express API (Prisma + PostgreSQL), mounted at `/api`
-   `uniform-frontend/` — React 19 + Vite + TanStack Router + Tailwind CSS
-   `docs/` — Documentation (User Manual, screenshots)

—

## Key Features

-   Authentication and role-based access: Student, Institution, Admin (JWT)
-   Student: Academic profile, eligibility-based exploration, applications, admit details
-   Institution: Manage units, review applications, publish academic notices
-   Admin: Manage institutions/admins, publish system notices, dashboards/visualizations
-   Notices: System and Institution (Academic) with student-facing feed and details

—

## Tech Stack

-   Frontend: React 19, Vite, TanStack Router, Tailwind CSS
-   Backend: Node.js, Express, Prisma ORM
-   Database: PostgreSQL (Neon)
-   Auth: JSON Web Tokens (JWT)
-   Deployment: Render (Web Service + Static Site)

—

## Getting Started (Local)

Prerequisites: Node.js 20+ (or 22+), PostgreSQL 14+, Git

1. Clone

```bash
git clone https://github.com/AongCho880/UniForm.git
cd UniForm
```

2. Backend — Configure & Run

Create `backend/.env` with at least:

```env
PORT=5000
JWT_SECRET=change-me-to-a-long-random-string
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
# When deploying, set FRONTEND_ORIGIN to your frontend URL
# FRONTEND_ORIGIN=https://your-frontend.onrender.com
```

Install deps and prepare the DB:

```bash
cd backend
npm ci
npx prisma generate --schema prisma/schema.prisma
npx prisma migrate dev --schema prisma/schema.prisma
npm start   # starts on http://localhost:5000 (base path /api)
```

3. Frontend — Run Dev Server

```bash
cd ../uniform-frontend
npm ci
npm run dev   # opens http://localhost:5173
```

Notes:

-   In local dev, the Vite proxy forwards `/api` → `http://localhost:5000`, so you typically do not need a frontend `.env`.
-   Axios base URL resolves to `import.meta.env.VITE_API_URL || '/api'`.

—

## Configuration & Environment Variables

Backend (`backend/.env`):

-   `PORT` — default `5000`
-   `DATABASE_URL` — PostgreSQL connection string
-   `JWT_SECRET` — long random string used to sign tokens
-   `FRONTEND_ORIGIN` — your deployed frontend origin (e.g., `https://uniform-frontend.onrender.com`)
-   `DISABLE_RATE_LIMIT` — set to `true` to disable rate limiting (optional for testing)

Frontend (`uniform-frontend/.env` when deploying):

-   `VITE_API_URL` — set to your backend URL with `/api`, e.g., `https://your-backend.onrender.com/api`

—

### Database (Neon)

-   Production database is hosted on Neon (PostgreSQL as-a-service).
-   Use Neon’s pooled connection string (host ends with `-pooler`) for serverless platforms like Render.
-   Example `DATABASE_URL` (replace host/user/password):

    ```env
    DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-XXXXXX-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
    ```

-   Optional Prisma flags for pgBouncer:

    ```env
    # Recommended when using Neon pooler/pgBouncer
    DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-XXXXXX-pooler.REGION.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1&connect_timeout=10"
    ```

-   Migrations:
    - Local/dev: `npx prisma migrate dev --schema prisma/schema.prisma`
    - Production: `npx prisma migrate deploy --schema prisma/schema.prisma`
    - Codegen: `npx prisma generate --schema prisma/schema.prisma`

## Deploy on Render (Backend + Frontend)

This repo includes `render.yaml` to create two services via Blueprint deploy:

1. Backend (Web Service)

-   Root directory: `backend`
-   Build command: `npm ci && npx prisma generate --schema prisma/schema.prisma && npx prisma migrate deploy --schema prisma/schema.prisma`
-   Start command: `node server.js`
-   Health check path: `/`
-   Env vars: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN` (and optionally `DISABLE_RATE_LIMIT=true`)

2. Frontend (Static Site)

-   Root directory: `uniform-frontend`
-   Build command: `npm ci && npm run build`
-   Publish directory: `dist`
-   Env var: `VITE_API_URL=https://<your-backend>.onrender.com/api`
-   Add rewrite rule: `/* -> /index.html` (SPA routing)

Steps:

-   Push your changes to GitHub.
-   In Render: New → Blueprint → pick this repo → Apply.
-   Update `FRONTEND_ORIGIN` on the backend with your static site URL.
-   Update `VITE_API_URL` on the frontend with your backend URL + `/api`.

—

## Documentation & Resources

-   User Manual (roles & screenshots): `docs/USER_MANUAL.md`
-   Backend base URL (local): `http://localhost:5000/api`
-   Frontend (local dev): `http://localhost:5173`

Useful scripts:

-   Backend: `npm start` (prod), `npm run server` (dev with nodemon)
-   Frontend: `npm run dev`, `npm run build`, `npm run preview`

—

## Troubleshooting

-   Frontend can’t reach API in production: ensure `VITE_API_URL` points to `<backend>/api` and CORS `FRONTEND_ORIGIN` is set.
-   401/Unauthorized: log in with a role that matches the route guard (Student/Institution/Admin).
-   Prisma errors: verify `DATABASE_URL` and run `npx prisma migrate deploy` (prod) or `migrate dev` (local).
-   SPA 404s on refresh: add the rewrite rule `/* -> /index.html` to your static site.

—

## License & Credits

This project is provided for educational and deployment purposes. Replace this section with your licensing terms if needed.
