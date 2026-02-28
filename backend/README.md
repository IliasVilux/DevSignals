# DevSignals Backend

Backend for DevSignals: Node.js + Express + TypeScript + Prisma + PostgreSQL.  
Goal: a **clean, explainable analytics backend** that demonstrates layered architecture, clear boundaries, and testable domain logic—oriented toward portfolio and mid-level interview discussion.

---

## Architecture Overview

The backend follows a **layered, module-oriented design**:

| Layer | Responsibility | Does not |
|-------|----------------|---------|
| **Routes** | Map HTTP to controller methods | Parse query/body in detail; contain business logic |
| **Controller** | Parse request, call service, shape HTTP response | Talk to the database; contain aggregation logic |
| **Service** | Domain logic, aggregations, orchestration across repositories | Know about HTTP, Express, or raw SQL |
| **Repository** | Data access: Prisma queries, persistence details | Contain business rules; know about “market overview” or “ingestion” |
| **Ingestion** | External API client + normalization + orchestration | Depend on Express; assume request/response shape |

**Request flow:** `HTTP → Route → Controller → Service → Repository(ies) → Prisma → DB`  
**Ingestion flow:** `Adzuna API → Client → Normalizer → Repository → Prisma → DB`

Separation is strict: controllers and services use **typed DTOs** (e.g. `MarketOverviewFilters`, `MarketOverview`); repositories work with **domain/Prisma types** (`Job`, `NormalizedJob`). The **normalization layer** turns external API shapes into a single internal `NormalizedJob` type, so the rest of the app never depends on Adzuna’s schema.

---

## Design Decisions & Rationale

- **Repository pattern**  
  All DB access goes through repository classes. Controllers and services never import Prisma or touch SQL. This keeps persistence swappable and makes unit testing easy (mock the repository interface, e.g. `IJobsRepository`).

- **Explicit type boundaries**  
  - **`NormalizedJob`** – internal contract between ingestion (normalizer) and persistence (repository). No Prisma or Adzuna types in the normalizer’s public signature.  
  - **`MarketOverview` / `MarketOverviewFilters`** – API and service contract. Response shape and filter options are explicit and type-safe.  
  - **Prisma-generated types** – used only inside repositories and in tests that assert against DB-shaped data.

- **Single Prisma client**  
  One shared client in `src/lib/prisma.ts` (with `PrismaPg` adapter). No per-request instantiation. Simple and sufficient for current scale; a future multi-tenant or serverless design could introduce scoped clients if needed.

- **CORS**  
  The `cors` middleware allows requests from the frontend (e.g. `http://localhost:5173` in dev, Vercel URL in production). Configured in `src/app.ts` with an allowed-origins list.

- **Prisma TypedSQL for top roles**  
  Top roles aggregation is done in the database via a custom SQL query (`prisma/sql/getTopRoles.sql`). Prisma’s `typedSql` preview feature generates typed bindings; `JobsRepository.findTopRoles` uses `prisma.$queryRawTyped(getTopRoles(...))`. Roles are grouped by `lower(trim(role))` so "Software Engineer" and "software engineer" count as one. Keeps heavy aggregation in the DB instead of loading all jobs into memory.

- **Environment validation at startup**  
  `src/config/env.ts` reads and validates required env vars once. The app fails fast at boot if `DATABASE_URL`, `ADZUNA_APP_ID`, `ADZUNA_API_KEY`, or `PORT` are missing—no silent runtime failures.

- **Dependency injection at the service layer**  
  `MarketService` receives `IJobsRepository` in its constructor. Controllers (or tests) pass a concrete `JobsRepository` or a mock. No DI container: manual wiring keeps the stack transparent and avoids over-engineering for current scope.

- **No authentication or user system in this phase**  
  By design for MVP. The API is read-only analytics; auth and rate-limiting are deferred until they add real product value.

---

## Data Model & Schema

- **`Country`** – `id` (cuid), `name`, `code` (unique). Referenced by jobs; seeded once.
- **`Job`** – core entity:
  - Identity: `externalId` (from provider) + `countryId` → **unique constraint** so the same Adzuna job in the same country is stored once; re-ingestion uses `createMany(..., skipDuplicates: true)`.
  - Optional: `description`, `company`, `salaryMin`, `salaryMax` (provider may omit).
  - **`remoteType`** – enum `ONSITE | HYBRID | REMOTE`, derived in the normalizer from job description text (e.g. “remote”, “hybrid”).
  - **Indexes:** `(countryId, role)` for filtered overview queries; `(postedAt)` for future time-based or recency logic.

Salary aggregation uses `salaryMin`/`salaryMax`: when both exist we use the midpoint; otherwise we use the single value; missing salaries contribute 0 so averages reflect “jobs with salary data” only. This is an explicit product choice documented in the service logic.

---

## API Contract (Current)

**`GET /api/market/overview`**

| Query param   | Type   | Required | Description                          |
|---------------|--------|----------|--------------------------------------|
| `countryCode` | string | No       | Filter by country (e.g. `GB`, `DE`)  |
| `role`        | string | No       | Case-insensitive substring on role  |

**Response 200** – `MarketOverview`:

- `totalJobs: number`
- `averageSalary: number | null` (null when no jobs)
- `remoteDistribution: { remote: number, hybrid: number, onSite: number }` (percentages 0–100, rounded)
- `topRoles: { role: string, count: number }[]` (top 5 roles by count, normalized in DB)

Omission of both filters returns an overview over all jobs in the database.

---

**`GET /api/countries`**

**Response 200** – `Country[]`: `{ id, code, name }[]`

---

**`GET /api/countries/:code`**

| Path param | Description        |
|------------|--------------------|
| `code`     | Country code (e.g. `GB`, `ES`) |

**Response 200** – `Country`: `{ id, code, name }`  
**Response 404** – `{ error: "Country not found" }`

---

## Tech Stack

- Node.js, Express 5, TypeScript
- Prisma ORM with PostgreSQL (Prisma Pg adapter)
- Prisma TypedSQL (`previewFeatures = ["typedSql"]`) for type-safe raw SQL
- CORS middleware for cross-origin requests from frontend
- Vitest for testing
- `tsx` for TypeScript execution in dev
- `dotenv` for configuration

## Scripts

From `backend/`:

- `pnpm dev` – start API server with `tsx watch src/server.ts`
- `pnpm test` – run Vitest test suite
- `pnpm test:watch` – run tests in watch mode
- `pnpm prisma:push` – apply Prisma schema to the database
- `pnpm prisma:seed` – seed the database with some countries
- `pnpm ingest` – run the job ingestion pipeline (`src/ingestion/ingest-jobs.ts`) for all countries
- `pnpm ingest <countryCode>` – run the job ingestion pipeline (`src/ingestion/ingest-jobs.ts`) for a specific country

## File Structure

backend/
  package.json
  tsconfig.json
  vitest.config.ts
  prisma.config.ts
  prisma/
    sql/
      getTopRoles.sql   # TypedSQL query: top N roles by count, grouped by lower(trim(role))
    schema.prisma       # Database schema (Job, Country, etc.)
    seed.ts             # Seed script to seed the database with some countries
  generated/prisma/     # Generated Prisma client and types (incl. sql bindings)
  src/
    app.ts              # Express app: JSON middleware + route mounting
    server.ts           # Server bootstrap: reads env + listens on PORT
    config/
      env.ts            # Environment loading & validation
    lib/
      prisma.ts         # Prisma client instance
    routes/
      market.routes.ts   # /api/market routes → market controller
      countries.routes.ts # /api/countries routes → countries controller
    modules/
      countries/
        countries.controller.ts
        countries.repository.ts
        countries.service.ts
        countries.types.ts
      jobs/
        jobs.repository.ts
        jobs.types.ts
      market/
        market.controller.ts
        market.service.ts
        market.types.ts
    ingestion/
      adzuna.client.ts  # HTTP client for Adzuna API
      job-normalizer.ts # Map raw Adzuna job → internal Job model
      ingest-jobs.ts    # Orchestration: fetch → normalize → persist
    tests/
      ingestion/
        job-normalizer.test.ts
      modules/
        countries/countries.repository.test.ts
        jobs/jobs.repository.test.ts
        market/market.service.test.ts

## Runtime Flow

### 1. API Request → Market Overview

1. **Express app setup** – `src/app.ts`
   - Creates an `express()` app
   - Enables CORS for frontend origins (`http://localhost:5173`, Vercel URL)
   - Uses `express.json()`
   - Mounts `marketRoutes` under `/api/market`, `countriesRoutes` under `/api/countries`

2. **HTTP server bootstrap** – `src/server.ts`
   - Imports `env` from `src/config/env.ts` to get `PORT`
   - Calls `app.listen(PORT, ...)`

3. **Routing** – `src/routes/market.routes.ts`
   - Registers `GET /overview`
   - Delegates to `MarketController.getOverview`

4. **Controller layer** – `src/modules/market/market.controller.ts`
   - Parses query params (`countryCode`, `role`)
   - Calls `MarketService.getMarketOverview`
   - Translates service result into HTTP response (status + JSON)

5. **Service layer** – `src/modules/market/market.service.ts`
   - Core **aggregation logic**
   - Uses `JobsRepository.findJobs` for total count, salary, remote distribution
   - Uses `JobsRepository.findTopRoles` for top 5 roles (TypedSQL in DB)
   - Returns `MarketOverview` with all fields

6. **Repository layer** – `src/modules/*/*.repository.ts`
   - `JobsRepository`: `findJobs` (Prisma `findMany`), `findTopRoles` (Prisma `$queryRawTyped` with `getTopRoles.sql`)
   - `CountriesRepository`: `getAllCountries`, `findByCode`
   - All persistence behind these interfaces

### 2. API Request → Countries

1. **Route** – `src/routes/countries.routes.ts`  
   `GET /` → `CountriesController.getAllCountries`; `GET /:code` → `CountriesController.getCountryByCode`.

2. **Controller** – `src/modules/countries/countries.controller.ts`  
   Delegates to `CountriesService`; returns JSON or 404 for by-code when not found.

3. **Service** – `src/modules/countries/countries.service.ts`  
   Uses `CountriesRepository.getAllCountries()` or `findByCode(code)`.

4. **Repository** – `src/modules/countries/countries.repository.ts`  
   Prisma `findMany` / `findUnique` on `Country` table.

### 3. Ingestion Pipeline

1. **Adzuna client** – `src/ingestion/adzuna.client.ts`
   - Calls Adzuna API using credentials from environment
   - Returns raw job postings

2. **Normalization** – `src/ingestion/job-normalizer.ts`
   - Converts external shape → internal `Job` model:
     - `externalId`
     - `role`
     - `description`
     - `salaryMin` / `salaryMax`
     - `remoteType` enum
     - `postedAt`
     - `country` / `countryId`
   - Ensures we respect unique constraint on `externalId + countryId`

3. **Persistence orchestration** – `src/ingestion/ingest-jobs.ts`
   - Coordinates:
     - fetch from Adzuna
     - normalize jobs
     - upsert into DB via repositories / Prisma

## Testing Strategy

**Philosophy:** Unit tests do not hit a real database. Domain and ingestion logic are tested in isolation; repositories are tested with a mocked or in-memory Prisma layer where applicable. This keeps tests fast, deterministic, and focused on behavior rather than infrastructure.

- **Normalizer** – `src/tests/ingestion/job-normalizer.test.ts`  
  Pure function tests: raw Adzuna payload → `NormalizedJob`; `detectRemoteType` for "remote", "hybrid", default onsite. No I/O.

- **Repository** – `src/tests/modules/countries/`, `jobs/`  
  Repository methods tested with Prisma mocks (or test doubles). Validates that the right queries and data shapes are used; no live DB required.

- **Service** – `src/tests/modules/market/market.service.test.ts`  
  `MarketService` receives a mock `IJobsRepository` with `findJobs` and `findTopRoles`. Tests assert: empty jobs → zero overview; salary aggregation; remote distribution; top roles from repository. All aggregation logic covered without touching the database.

---

## Intentional Simplifications (Current Phase)

- **No DI container** – Services receive dependencies via constructor args; wiring is explicit in controllers or scripts. Keeps the stack understandable and avoids framework overhead.
- **No request-level validation library** – Query params are validated with simple checks in the controller. A library (e.g. Zod) can be introduced when the number of endpoints and shapes grows.
- **Generic 500 on errors** – Controllers catch and return a single error message. Structured error codes and client-facing messages can be added when needed.
- **No caching** – Every overview request hits the database. Caching (in-memory or Redis) is a natural next step when response time or DB load becomes a concern.
- **Ingestion is CLI-only** – No cron or job queue yet. `pnpm ingest` is run manually or via external scheduler. Fits MVP; background workers can be added in a later phase.

These choices keep the backend easy to reason about and to extend when requirements grow.

---

## Running Locally (Backend Only)

1. Install dependencies (from `backend/`):
```bash
pnpm install
```

2. Configure environment:

   - Create a `.env` file with (all required at startup; see `src/config/env.ts`):
     - `DATABASE_URL`
     - `ADZUNA_APP_ID`
     - `ADZUNA_API_KEY`
     - `PORT`
   - CORS allowed origins are set in `src/app.ts`; update the list when deploying (e.g. add your Vercel URL).

3. Apply schema and seed data:

   pnpm prisma:push
   pnpm prisma:seed

4. Optionally ingest fresh jobs:

```bash
pnpm ingest
```

5. Start the dev server:

```bash
pnpm dev
```