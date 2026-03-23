# DevSignals Backend

Backend for DevSignals: Node.js + Express + TypeScript + Prisma + PostgreSQL.  
Goal: a **clean, explainable analytics backend** that demonstrates layered architecture, clear boundaries, and testable domain logic—oriented toward portfolio and mid-level interview discussion.

---

## Architecture Overview

The backend follows a **layered, module-oriented design**:

| Layer          | Responsibility                                                | Does not                                                            |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Routes**     | Map HTTP to controller methods                                | Parse query/body in detail; contain business logic                  |
| **Controller** | Parse request, call service, shape HTTP response              | Talk to the database; contain aggregation logic                     |
| **Service**    | Domain logic, aggregations, orchestration across repositories | Know about HTTP, Express, or raw SQL                                |
| **Repository** | Data access: Prisma queries, persistence details              | Contain business rules; know about “market overview” or “ingestion” |
| **Ingestion**  | External API client + normalization + orchestration           | Depend on Express; assume request/response shape                    |

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
  The `cors` middleware allows requests from the frontend (`http://localhost:5173` in dev, `https://dev-signals.vercel.app` in production). Configured in `src/app.ts` with an allowed-origins list.

- **Prisma TypedSQL for aggregations**
  Top-roles, top-skills, and skills-by-category aggregations are done in the database via custom SQL queries (`prisma/sql/getTopRoles.sql`, `prisma/sql/getTopSkills.sql`, `prisma/sql/getTopSkillsByCategory.sql`). Prisma's `typedSql` preview feature (requires `pnpm prisma generate --sql` in v7.4.0) generates typed bindings; repositories use `prisma.$queryRawTyped(...)`. Roles are grouped by `lower(trim(role))`; skills by `Skill.id`; categories by `Skill.category`. The `category` enum column is cast to `::text` to avoid Prisma's enum inference limitation, then cast back to `SkillCategory` in TypeScript. `getTopSkillsByCategory.sql` returns the top 5 skills per category using a window function (`RANK() OVER (PARTITION BY category ORDER BY skill_count DESC)`); percentage per category is computed in the service layer from the total count — not in SQL — to keep aggregation logic in the domain layer.

- **Skills extraction pipeline**  
  The normalizer calls `extractSkills(title, description)` before persisting any job. The extractor uses pre-compiled regex patterns (built at module load time for performance) against a curated dictionary of ~70 technologies across 5 categories. Ambiguous short aliases (e.g. "R", "Go") are replaced with unambiguous phrases ("r programming", "golang"). Extracted skills are bulk-upserted in a 5-query batch: job insert → re-fetch IDs → skill upsert → skill re-fetch → jobSkill insert.

- **Environment validation at startup**  
  `src/config/env.ts` reads and validates required env vars once. The app fails fast at boot if `DATABASE_URL`, `ADZUNA_APP_ID`, `ADZUNA_API_KEY`, or `PORT` are missing—no silent runtime failures.

- **Dependency injection at the service layer**  
  `MarketService` receives `IJobsRepository` in its constructor. Controllers (or tests) pass a concrete `JobsRepository` or a mock. No DI container: manual wiring keeps the stack transparent and avoids over-engineering for current scope.

- **Social OAuth authentication (v0.6)**
  Authentication uses server-side OAuth redirects via Passport.js (Google and GitHub strategies). No email/password. No User model in the database yet — identity lives entirely in the JWT.

  Key decisions:
  - **httpOnly cookie** (`ds_auth`, TTL 7 days) instead of localStorage: not accessible from JavaScript, mitigates XSS. Cross-domain cookies (Render + Vercel) require `sameSite: 'none', secure: true` in production.
  - **Relative `callbackURL`** (`/auth/google/callback`) with `proxy: true`: Passport constructs the full URL from the incoming request. No `BACKEND_URL` env var needed — it works correctly behind Render's HTTPS proxy and in local development.
  - **Stateless CSRF protection**: the OAuth `state` parameter is signed with HMAC (`JWT_SECRET + timestamp + nonce`) instead of stored in `express-session`. Verified on callback; expires after 5 minutes. The random nonce prevents collisions when two users initiate login in the same millisecond.
  - **Auth routes at `/auth`, not `/api/auth`**: OAuth redirects are browser navigations, not API calls. Keeping them outside `/api/*` means they don't consume the rate limiter quota.
  - **`lib/jwt.ts` wrapper**: the rest of the app calls `signToken()` / `verifyToken()` — never `jsonwebtoken` directly. If the JWT library changes, only one file changes.
  - **`Express.User` augmentation** (`src/types/express.d.ts`): Passport declares `req.user?: Express.User`. We extend that interface with `AuthUser` fields so TypeScript knows what `req.user` contains throughout route handlers.

  Known limitation to address in the next phase: state tokens are not one-time use. The correct fix (store in Redis, delete on verify) will be implemented when the User model is added.

- **Rate limiting**  
  All `/api/*` routes are protected by `express-rate-limit` (100 requests per IP per 15-minute window). Returns standard `RateLimit-*` response headers (`draft-8`) so clients can handle backoff gracefully. Applied globally in `src/app.ts` before route mounting.

- **Data freshness tracking**  
  `Country` has a `lastIngestedAt: DateTime?` field updated by the ingestion pipeline after each successful run. Exposed via `GET /api/countries` so the frontend can show users how recent the data is. The `formatLastIngested()` helper on the frontend converts the ISO date to a human-readable relative string (e.g. "3 hours ago").

- **Redis caching**
  `GET /api/market/overview` results are cached in Redis (via `ioredis`) using a cache-aside pattern. Cache key: `market:overview:{countryCode|all}:{role|all}`. TTL: 2 hours. Writes are fire-and-forget (no `await`) to avoid adding Redis latency to the critical path. Reads fall back to the database on any Redis error. The cache is invalidated after each successful ingestion run (both scheduled and CLI) using `SCAN` + `DEL` — never `KEYS *`, which blocks Redis. If `REDIS_URL` is absent, caching is silently skipped and the system works normally. This is the recommended pattern for optional infrastructure: graceful degradation, not a crash.

- **Global error handler**
  A 4-argument Express middleware in `src/app.ts` catches any error not handled by controller `try/catch` blocks. Returns `{ error: "An unexpected error occurred." }` with status 500. The 4-argument signature is required — Express identifies error handlers by arity. Placed after all route mounting so it acts as a safety net without interfering with normal request flow. Includes a `res.headersSent` guard to avoid writing headers twice if a response was already started.

- **Scheduled ingestion**
  `node-cron` registers two background tasks in `src/ingestion/scheduler.ts`: a daily ingest (3am) and a weekly cleanup that deletes jobs older than 30 days. Cache invalidation runs after each successful ingest. `startScheduler()` is called from `server.ts` at startup. BullMQ (Redis-based) was considered but deferred — `node-cron` is sufficient for current scale and avoids extra infrastructure dependency.

---

## Data Model & Schema

- **`Country`** – `id` (cuid), `name`, `code` (unique), `lastIngestedAt` (optional timestamp). Referenced by jobs; seeded once. `lastIngestedAt` is stamped after each successful ingestion run for that country.
- **`Job`** – core entity:
  - Identity: `externalId` (from provider) + `countryId` → **unique constraint** so the same Adzuna job in the same country is stored once; re-ingestion uses `createMany(..., skipDuplicates: true)`.
  - Optional: `description`, `company`, `salaryMin`, `salaryMax` (provider may omit).
  - **`remoteType`** – enum `ONSITE | HYBRID | REMOTE`, derived in the normalizer from job description text (e.g. “remote”, “hybrid”).
  - **Indexes:** `(countryId, role)` for filtered overview queries; `(postedAt)` for future time-based or recency logic.

Salary aggregation uses `salaryMin`/`salaryMax`: when both exist we use the midpoint; otherwise we use the single value; missing salaries contribute 0 so averages reflect “jobs with salary data” only. This is an explicit product choice documented in the service logic.

---

## API Contract (Current)

**`GET /api/market/overview`**

| Query param   | Type   | Required | Description                         |
| ------------- | ------ | -------- | ----------------------------------- |
| `countryCode` | string | No       | Filter by country (e.g. `GB`, `DE`) |
| `role`        | string | No       | Case-insensitive substring on role  |

**Response 200** – `MarketOverview`:

- `totalJobs: number`
- `averageSalary: number | null` (null when no jobs)
- `remoteDistribution: { remote: number, hybrid: number, onsite: number }` (percentages 0–100, rounded)
- `topRoles: { role: string, count: number, avgSalary: number | null }[]` (top 5 roles; `avgSalary` is null when salary data is unavailable for that role)
- `topSkills: { name: string, category: SkillCategory, count: number }[]` (top 10 skills by count)
- `skillCategoryBreakdown: { category: SkillCategory, count: number, percentage: number, skills: { name: string, category: SkillCategory, count: number }[] }[]` (top 5 skills per category, with total count and share per category)

Omission of both filters returns an overview over all jobs in the database.

---

**`GET /api/countries`**

**Response 200** – `Country[]`: `{ id, code, name, lastIngestedAt: string | null }[]`

---

**`GET /auth/google`** — Initiates Google OAuth flow. Redirects the browser to Google's authorization page.

**`GET /auth/google/callback`** — Google redirects here after authorization. Verifies CSRF state, exchanges code for profile, mints JWT, sets `ds_auth` httpOnly cookie, redirects to `FRONTEND_URL/auth/callback?success=true`.

**`GET /auth/github`** — Same as above for GitHub.

**`GET /auth/github/callback`** — Same as above for GitHub.

**`GET /auth/me`** — Returns the authenticated user's payload if the `ds_auth` cookie is present and valid. Returns 401 otherwise. Used by the frontend on app load to restore auth state.

**Response 200**: `{ sub, provider, email, name, picture }`

**`POST /auth/logout`** — Clears the `ds_auth` cookie. Returns `{ success: true }`.

---

**`GET /api/countries/:code`**

| Path param | Description                    |
| ---------- | ------------------------------ |
| `code`     | Country code (e.g. `GB`, `ES`) |

**Response 200** – `Country`: `{ id, code, name }`  
**Response 404** – `{ error: "Country not found" }`

---

## Tech Stack

- Node.js, Express 5, TypeScript
- Prisma ORM with PostgreSQL (Prisma Pg adapter)
- Prisma TypedSQL (`previewFeatures = ["typedSql"]`) for type-safe raw SQL
- ioredis for Redis caching (optional — graceful degradation without `REDIS_URL`)
- CORS middleware for cross-origin requests from frontend
- Vitest for testing
- `tsx` for TypeScript execution in dev
- Node.js native `--env-file` for configuration (no dotenv dependency)

## Scripts

From `backend/`:

- `pnpm dev` – start API server with `tsx watch src/server.ts`
- `pnpm test` – run Vitest test suite
- `pnpm test:watch` – run tests in watch mode
- `pnpm prisma:push` – apply Prisma schema to the database
- `pnpm prisma:seed` – seed the database with some countries
- `pnpm ingest` – run the ingestion pipeline for all countries, fetching all jobs from the last 7 days (paginated)
- `pnpm ingest <countryCode>` – same as above, but for a specific country
- `pnpm ingest --max-days-old 14` – ingest jobs from the last 14 days (supports `--max-days-old=14` too)

## File Structure

```
backend/
├── generated/prisma/              # Generated Prisma client and types (incl. sql bindings)
├── prisma/
│   ├── sql/
│   │   ├── getTopRoles.sql           # TypedSQL query: top N roles by count, grouped by lower(trim(role))
│   │   ├── getTopSkills.sql          # TypedSQL query: top N skills by count with category
│   │   └── getTopSkillsByCategory.sql   # TypedSQL query: top 5 skills per category with category totals
│   ├── schema.prisma              # Database schema (Job, Country, etc.)
│   └── seed.ts                    # Seed script to seed the database with some countries
└── src/
    ├── config/
    │   └── env.ts                 # Environment loading & validation
    ├── ingestion/
    │   ├── remote-classifier/
    │   │   ├── remote-classifier.ts   # classifyRemoteType: regex + keyword matching → RemoteType enum
    │   │   └── remote-keywords.ts     # Keyword lists per RemoteType (multilingual: EN, ES, FR, DE, IT)
    │   ├── skill-extractor/
    │   │   ├── skill-extractor.ts     # extractSkills: regex-based tech detection → ExtractedSkill[]
    │   │   └── skills-dictionary.ts   # ~70 technology entries with canonical names, categories, aliases
    │   ├── adzuna.client.ts           # HTTP client for Adzuna API
    │   ├── ingest-jobs.ts             # Orchestration: fetch → normalize → persist
    │   └── job-normalizer.ts          # Map raw Adzuna job → NormalizedJob (incl. skill extraction)
    ├── lib/
    │   ├── jwt.ts                 # JWT wrapper: signToken(AuthUser) / verifyToken(token) — never import jsonwebtoken directly
    │   ├── prisma.ts              # Prisma client instance
    │   └── redis.ts               # ioredis singleton — returns null if REDIS_URL absent
    ├── middleware/
    │   └── requireAuth.ts         # JWT auth middleware: reads ds_auth cookie → verifies → sets req.user (401 if invalid)
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.types.ts      # AuthUser { sub, provider, email, name, picture }, JwtPayload extends AuthUser
    │   │   ├── auth.service.ts    # normalizeGoogleProfile(), normalizeGithubProfile(), generateSignedState(), verifySignedState()
    │   │   └── auth.controller.ts # Passport strategy setup + OAuth handlers + getMe + logout
    │   ├── countries/
    │   │   ├── countries.controller.ts
    │   │   ├── countries.repository.ts
    │   │   ├── countries.service.ts
    │   │   └── countries.types.ts
    │   ├── jobs/
    │   │   ├── jobs.repository.ts
    │   │   └── jobs.types.ts
    │   └── market/
    │       ├── market.controller.ts
    │       ├── market.service.ts
    │       └── market.types.ts
    ├── routes/
    │   ├── auth.routes.ts         # /auth routes → auth controller (outside rate limiter)
    │   ├── market.routes.ts       # /api/market routes → market controller
    │   └── countries.routes.ts    # /api/countries routes → countries controller
    ├── tests/
    │   ├── ingestion/
    │   │   ├── job-normalizer.test.ts
    │   │   └── skill-extractor.test.ts
    │   ├── lib/
    │   │   └── jwt.test.ts            # sign/verify roundtrip, tampered/expired token rejection
    │   ├── middleware/
    │   │   └── requireAuth.test.ts    # missing cookie → 401, invalid JWT → 401, valid JWT → next() + req.user
    │   └── modules/
    │       ├── auth/
    │       │   └── auth.service.test.ts   # profile normalization, state generation/verification
    │       ├── countries/
    │       │   └── countries.repository.test.ts
    │       ├── jobs/
    │       │   └── jobs.repository.test.ts
    │       └── market/
    │           └── market.service.test.ts
    ├── types/
    │   └── express.d.ts           # Augments Express.User with AuthUser — enables typed req.user across routes
    ├── app.ts                     # Express app: CORS (credentials), cookieParser, passport.initialize, route mounting
    └── server.ts                  # Server bootstrap: reads env + listens on PORT
```

## Runtime Flow

### 1. API Request → Market Overview

1. **Express app setup** – `src/app.ts`
   - Creates an `express()` app
   - Enables CORS for frontend origins (`http://localhost:5173`, Vercel URL)
   - Uses `express.json()`
   - Applies rate limiter (100 req/IP/15min) to all `/api/*` routes
   - Exposes `GET /health` outside the rate limiter — used by UptimeRobot to prevent Render's 15-minute inactivity spin-down
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
   - Checks Redis cache first (`market:overview:{cc}:{role}` key) — returns cached result immediately on hit
   - On cache miss: fetches jobs, delegates calculations to private methods (`calculateAverageSalary`, `calculateRemoteDistribution`, `calculateSkillCategoryBreakdown`)
   - Uses `Promise.all` to run `findTopRoles`, `findTopSkills`, and `findSkillCategoryBreakdown` in parallel
   - Writes result to Redis fire-and-forget after building it
   - Returns `MarketOverview`

6. **Repository layer** – `src/modules/*/*.repository.ts`
   - `JobsRepository`: `findJobs` (Prisma `findMany`), `findTopRoles`, `findTopSkills`, and `findSkillCategoryBreakdown` (all `$queryRawTyped`)
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
   - Converts external shape → internal `NormalizedJob`:
     - `externalId`, `role`, `description`, `salaryMin` / `salaryMax`, `remoteType`, `postedAt`, `countryCode`
   - `remoteType` is resolved by `classifyRemoteType(title + description)` — the normalizer never contains classification logic directly

3. **Remote type classification** – `src/ingestion/remote-classifier/`
   - `classifyRemoteType(text)` normalizes input (lowercase, collapsed whitespace) then applies two strategies in priority order: regex patterns first (handles morphological variants like `h[ií]brido`, `home\s?office`), then exact keyword lists
   - Keyword lists in `remote-keywords.ts` cover EN, ES, FR, DE, IT — structured as `Record<RemoteType, string[]>`
   - HYBRID is checked before REMOTE to avoid misclassifying hybrid descriptions that also contain the word "remote"
   - ONSITE is the default — no keywords needed, classification falls through
   - Isolated module: no Express, no Prisma, no ingestion dependencies — purely a text → enum function

4. **Persistence orchestration** – `src/ingestion/ingest-jobs.ts`
   - Coordinates:
     - fetch from Adzuna
     - normalize jobs
     - upsert into DB via repositories / Prisma
     - stamps `lastIngestedAt` on the `Country` record after each successful run

## Testing Strategy

**Philosophy:** Unit tests do not hit a real database. Domain and ingestion logic are tested in isolation; repositories are tested with a mocked or in-memory Prisma layer where applicable. This keeps tests fast, deterministic, and focused on behavior rather than infrastructure.

- **Normalizer** – `src/tests/ingestion/job-normalizer.test.ts`  
  Pure function tests: raw Adzuna payload → `NormalizedJob`; verifies field mapping, salary handling, and that `classifyRemoteType` is called with the combined title + description text. Remote classification logic is tested separately via the classifier's own test suite.

- **Remote classifier** – `src/tests/ingestion/remote-classifier.test.ts`  
  Pure function tests for `classifyRemoteType`: covers regex variants (multilingual hybrid/remote patterns), keyword matching across supported languages, HYBRID-before-REMOTE priority, empty/null input defaulting to ONSITE. No I/O.

- **Repository** – `src/tests/modules/countries/`, `jobs/`  
  Repository methods tested with Prisma mocks (or test doubles). Validates that the right queries and data shapes are used; no live DB required.

- **Service** – `src/tests/modules/market/market.service.test.ts`  
  `MarketService` receives a mock `IJobsRepository` with `findJobs` and `findTopRoles`. Tests assert: empty jobs → zero overview; salary aggregation; remote distribution; top roles from repository. All aggregation logic covered without touching the database.

---

## Intentional Simplifications (Current Phase)

- **No DI container** – Services receive dependencies via constructor args; wiring is explicit in controllers or scripts. Keeps the stack understandable and avoids framework overhead.
- **No request-level validation library** – Query params are validated with simple checks in the controller. A library (e.g. Zod) can be introduced when the number of endpoints and shapes grows.
- **No authentication** – The API is read-only analytics. Auth is deferred until it adds real product value (planned for v0.6).

These choices keep the backend easy to reason about and to extend when requirements grow.

---

## Running Locally (Backend Only)

1. Install dependencies (from `backend/`):

```bash
pnpm install
```

2. Configure environment:
   - Create a `.env` file. Required vars (app fails to start if missing):
     - `DATABASE_URL`
     - `ADZUNA_APP_ID`
     - `ADZUNA_API_KEY`
     - `PORT`
   - Optional vars (graceful degradation if absent):
     - `REDIS_URL` – enables response caching. Recommended provider: [Upstash](https://upstash.com) (free tier, works with Render)
   - Auth vars (required for auth to work):
     - `JWT_SECRET` – random 64-char hex string (`openssl rand -hex 32`)
     - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – from Google Cloud Console → OAuth 2.0 Client IDs
     - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` – from GitHub → Settings → Developer settings → OAuth Apps
     - `FRONTEND_URL` – `http://localhost:5173` in dev, `https://dev-signals.vercel.app` in production
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
