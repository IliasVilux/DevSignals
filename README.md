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

## Current Phase – MVP v0.1 (Market Overview)

The backend provides a clean, testable analytics API and the frontend consumes it to display meaningful market insights.

### Backend

- Ingestion pipeline from Adzuna into PostgreSQL via Prisma
- Normalization of external job data into an internal `Job` model (including improved remote type detection)
- Aggregation logic exposed through a market overview endpoint

### Frontend

- Feature-based React + TypeScript architecture
- Dark, data-first UI built with Tailwind CSS v4 and shadcn/ui (zinc theme)
- TanStack Query for server state management
- Country select populated dynamically from the API
- Role text input with debounce to avoid unnecessary requests
- Stats display: total jobs, average salary, remote/hybrid/onsite percentages and top roles
- Recharts horizontal bar charts for remote distribution and top roles

### Current API

- `GET /api/market/overview`
  - Query params:
    - `countryCode` – e.g. `GB`, `ES`
    - `role` – e.g. `software engineer`
  - Returns:
    - Total jobs analyzed
    - Average salary
    - Remote / Hybrid / Onsite distribution (percentages)
    - Top 5 roles (aggregated via Prisma TypedSQL)
- `GET /api/countries` – list all countries (`{ id, code, name }[]`)
- `GET /api/countries/:code` – get country by code (e.g. `GB`, `ES`)

## Deployment

- **Backend:** https://devsignals.onrender.com
- **Frontend:** https://dev-signals.vercel.app

## High-Level Architecture

### Backend
- **Express app** (`backend/src/app.ts`) exposes REST routes, CORS enabled for frontend origins
- **Market module** (`backend/src/modules/market`) handles analytics queries
- **Countries module** (`backend/src/modules/countries`) – Controller → Service → Repository
- **Jobs module** wraps database access via Prisma; top roles via custom TypedSQL query
- **Ingestion layer** (`backend/src/ingestion`) pulls and normalizes external job data
- **Prisma + PostgreSQL** provide typed, relational persistence

### Frontend
- **Feature-based structure** under `frontend/src/features/`
- **Custom hooks** per domain: `useMarketOverview`, `useCountries`
- **TanStack Query** manages caching, loading, and error states
- **Recharts** renders aggregated data as interactive charts
- **React Router** handles client-side navigation

For more detail, see `backend/README.md` and `frontend/README.md`.