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
- `frontend/` – (planned) React + TypeScript + Vite  
- `docs/` – project context and architecture notes

## Current Phase – Backend MVP

Right now the focus is on a **clean, testable analytics backend**:

- Ingestion pipeline from Adzuna into PostgreSQL via Prisma
- Normalization of external job data into an internal `Job` model
- Aggregation logic to expose a **market overview** endpoint

### Current API

- `GET /api/market/overview`
  - Query params:
    - `countryCode` – e.g. `GB`, `ES`
    - `role` – e.g. `software engineer`
  - Returns:
    - Total jobs analyzed
    - Average salary
    - Remote / Hybrid / Onsite distribution
    - Top 5 roles (aggregated in DB via Prisma TypedSQL)
- `GET /api/countries` – list all countries (`{ id, code, name }[]`)
- `GET /api/countries/:code` – get country by code (e.g. `GB`, `ES`)

## High-Level Backend Architecture

- **Express app** (`backend/src/app.ts`) exposes REST routes, CORS enabled for frontend origins
- **Market module** (`backend/src/modules/market`) handles analytics queries
- **Countries module** (`backend/src/modules/countries`) – Controller → Service → Repository for country data
- **Jobs module** wraps database access via Prisma; top roles via custom TypedSQL query
- **Ingestion layer** (`backend/src/ingestion`) pulls and normalizes external job data
- **Prisma + PostgreSQL** provide typed, relational persistence

For more detail, see `backend/README.md`.