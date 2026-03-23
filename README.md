# DevSignals

DevSignals is a tech job market intelligence platform for developers.
It does **not** show job listings; it aggregates external job data and turns it into **market insights**.

## Core Idea

- Understand **technology demand trends**
- See **salary distributions** by country and role
- Compare **remote vs hybrid vs onsite** share
- Future: **skill trends** and **personal market fit scores**

## Monorepo Structure

- `backend/` – Node.js + Express + TypeScript + Prisma + PostgreSQL
- `frontend/` – React + TypeScript + Vite + TanStack Query + Recharts
- `docs/` – project context and architecture notes

## Current Phase – MVP v0.6 complete ✅

MVP v0.5.5 delivered a full analytics API with Redis caching, rate limiting, scheduled ingestion, and a polished responsive frontend. MVP v0.6 adds social OAuth authentication (Google + GitHub) with stateless JWT stored in an httpOnly cookie. No user database — identity lives entirely in the JWT. The header shows a sign-in chip when unauthenticated and an avatar + name + sign-out chip when authenticated.

### Backend

- Ingestion pipeline from Adzuna into PostgreSQL via Prisma
- Normalization of external job data into an internal `Job` model (including improved remote type detection)
- **Skills extraction pipeline**: regex-based extractor identifies ~70 technologies from job text and persists them to a `Skill`/`JobSkill` graph linked to every ingested job
- Aggregation logic exposed through a market overview endpoint, including top skills per country/role and **average salary per role**
- **Redis caching**: `GET /api/market/overview` results cached per filter combination (TTL 2h, cache-aside pattern). Graceful degradation if `REDIS_URL` is absent. Cache invalidated after each successful ingestion run
- **Scheduled ingestion**: `node-cron` runs a daily ingest (3am) and a weekly cleanup that deletes jobs older than 30 days
- **Global error handler**: Express middleware catches unhandled errors and returns a consistent `{ error: string }` shape
- **Role title normalization**: `normalizeRole()` strips parenthetical content and trailing dash qualifiers from Adzuna titles (e.g. `"Backend Engineer (AdTech) - Ops"` → `"Backend Engineer"`)

### Frontend

- Feature-based React + TypeScript architecture (`features/market`, `features/auth`)
- Dark, data-first UI built with Tailwind CSS v4 and shadcn/ui (zinc theme)
- **`ApiError` class**: parses error body from the API, exposes HTTP status, and provides human-readable messages
- **TanStack Query** with explicit config: `staleTime 5min`, smart retry (skips 4xx, max 2 retries on 5xx)
- **Error boundary**: catches unexpected render errors app-wide with a "try again" fallback
- Country select populated dynamically from the API
- **Data freshness label**: shows how long ago data was ingested for the selected country
- Role text input with debounce to avoid unnecessary requests
- Stats display: total jobs, average salary, remote/hybrid/onsite percentages, top roles, top skills, and skill category breakdowns
- Recharts charts for desktop + custom bar components for mobile (no Recharts on mobile)
- **Dual-bar TopRolesChart**: count + average salary per role on independent axes
- **SkillCategoryBreakdown**: per-category sections with desktop chart + mobile list
- **Auth (v0.6)**: `AuthContext` + `useAuth` hook restore session on load via `GET /auth/me`. `AuthStatus` chip in the header — sign-in buttons when unauthenticated, avatar + provider badge + name + sign-out when authenticated

### Auth API (v0.6)

- `GET /auth/google` – initiates Google OAuth (browser redirect)
- `GET /auth/github` – initiates GitHub OAuth (browser redirect)
- `GET /auth/me` – returns authenticated user from cookie (`{ sub, provider, email, name, picture }`)
- `POST /auth/logout` – clears the `ds_auth` cookie

### Market API

- `GET /api/market/overview`
  - Query params:
    - `countryCode` – e.g. `GB`, `ES`
    - `role` – e.g. `software engineer`
  - Returns:
    - Total jobs analyzed
    - Average salary
    - Remote / Hybrid / Onsite distribution (percentages)
    - Top 5 roles with count and average salary (aggregated via Prisma TypedSQL)
    - Top 10 skills with category (aggregated via Prisma TypedSQL)
    - Skills by category breakdown with count and percentage share
- `GET /api/countries` – list all countries (`{ id, code, name, lastIngestedAt }[]`)
- `GET /api/countries/:code` – get country by code (e.g. `GB`, `ES`)

## Deployment

- **Backend:** https://devsignals.onrender.com
- **Frontend:** https://dev-signals.vercel.app — Vercel
- **Redis:** Upstash free tier — caches market overview responses (TTL 2h)
- **Keep-alive:** UptimeRobot pings `GET /health` every 14 minutes to prevent Render's 15-minute inactivity spin-down and ensure the ingestion cron runs

## High-Level Architecture

### Backend

- **Express app** (`backend/src/app.ts`) exposes REST routes, CORS enabled for frontend origins
- **Market module** (`backend/src/modules/market`) handles analytics queries
- **Countries module** (`backend/src/modules/countries`) – Controller → Service → Repository
- **Jobs module** wraps database access via Prisma; top roles (with avg salary) and top skills via custom TypedSQL queries
- **Ingestion layer** (`backend/src/ingestion`) pulls and normalizes external job data
- **Prisma + PostgreSQL** provide typed, relational persistence

### Frontend

- **Feature-based structure** under `frontend/src/features/`
- **Custom hooks** per domain: `useMarketOverview`, `useCountries`
- **TanStack Query** manages caching, loading, and error states
- **Recharts** renders aggregated data as interactive charts
- **React Router** handles client-side navigation

For more detail, see `backend/README.md` and `frontend/README.md`.
