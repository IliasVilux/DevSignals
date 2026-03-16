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

## Current Phase – MVP v0.5 in progress

The backend provides a clean, testable analytics API with rate limiting, data freshness tracking, scheduled ingestion, and role title normalization. The frontend consumes it to display meaningful market insights with per-role salary data, loading skeletons, and empty states.

### Backend

- Ingestion pipeline from Adzuna into PostgreSQL via Prisma
- Normalization of external job data into an internal `Job` model (including improved remote type detection)
- **Skills extraction pipeline**: regex-based extractor identifies ~70 technologies from job text and persists them to a `Skill`/`JobSkill` graph linked to every ingested job
- Aggregation logic exposed through a market overview endpoint, including top skills per country/role and **average salary per role**
- **Scheduled ingestion**: `node-cron` runs a daily ingest (3am) and a weekly cleanup that deletes jobs older than 30 days. `startScheduler()` is called from `server.ts` at startup
- **Role title normalization**: `normalizeRole()` strips parenthetical content and trailing dash qualifiers from Adzuna titles before persisting (e.g. `"Backend Engineer (AdTech) - Ops"` → `"Backend Engineer"`)

### Frontend

- Feature-based React + TypeScript architecture
- Dark, data-first UI built with Tailwind CSS v4 and shadcn/ui (zinc theme)
- TanStack Query for server state management
- Country select populated dynamically from the API
- **Data freshness label**: shows how long ago data was ingested for the selected country (e.g. "data from 3 hours ago")
- Role text input with debounce to avoid unnecessary requests
- Stats display: total jobs, average salary, remote/hybrid/onsite percentages, top roles and top skills
- Recharts horizontal bar charts for remote distribution, top skills
- **Dual-bar TopRolesChart**: count + average salary per role on independent axes

### Current API

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
- `GET /api/countries` – list all countries (`{ id, code, name, lastIngestedAt }[]`)
- `GET /api/countries/:code` – get country by code (e.g. `GB`, `ES`)

## Deployment

- **Backend:** https://devsignals.onrender.com
- **Frontend:** https://dev-signals.vercel.app

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
