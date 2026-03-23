# DevSignals Frontend

Frontend for DevSignals: React + TypeScript + Vite + TanStack Query + Recharts.  
Goal: a **clean, data-first analytics frontend** that consumes the backend aggregation API and transforms market data into meaningful developer insights.

The focus is architectural correctness and production engineering patterns — built as a portfolio-grade project demonstrating real-world frontend decisions.

## Live Demo

- **Frontend:** https://dev-signals.vercel.app
- **Backend API:** https://devsignals.onrender.com

---

## Architecture Overview

The frontend follows a **feature-based architecture** that separates application configuration, business domains, and shared utilities.

| Layer       | Responsibility                                                    |
| ----------- | ----------------------------------------------------------------- |
| `app/`      | Root composition, global providers, routing                       |
| `features/` | Domain-scoped components, hooks, and pages                        |
| `shared/`   | Cross-feature API client, types, utility hooks, and UI primitives |

---

## Design Decisions & Rationale

- **Feature-based structure**  
  All market-related code (components, hooks, pages) lives under `features/market/`. As new domains are added (e.g. skills, trends), they get their own feature folder with the same internal structure. No shared component soup.

- **Centralized API client**  
  `shared/api/client.ts` is the single place where fetch logic lives. Domain endpoints are registered in `shared/api/index.ts`. Components and hooks never call `fetch` directly — this keeps network logic consistent and easy to change.

- **TanStack Query for server state**  
  React Query manages all data fetching, caching, and background updates. No `useEffect` + `useState` for data fetching. Query keys are parameter-driven so cache invalidation is automatic when filters change.

- **Custom hooks per domain**  
  `useMarketOverview` and `useCountries` encapsulate query logic. Pages and components consume hooks — they don't own fetch logic. This keeps components clean and hooks independently testable.

- **Debounced role input**  
  A shared `useDebounce` hook prevents a query from firing on every keystroke. The role filter only updates the query key after the user pauses typing, reducing unnecessary backend load.

- **No global state manager**  
  Filter state lives as local component state in `MarketOverviewPage`. React Query handles all server state. No Redux, no Zustand — not needed at this scope, and intentionally avoided to keep the stack transparent.

- **Shared domain types**  
  `shared/api/types.ts` defines the frontend's canonical types (`MarketOverview`, `Country`, etc.). These mirror the backend API contract and are used across hooks and components, ensuring type safety end to end.

- **Path aliases**  
  All cross-feature imports use the `@/` alias (e.g. `@/shared/api/types`). Relative `../../../` paths are reserved for imports within the same module. Configured in both `tsconfig.json` and `vite.config.ts`.

---

## UI & Styling

- **Tailwind CSS v4** — CSS-first configuration, no `tailwind.config.js`
- **shadcn/ui** — zinc theme, used selectively for interactive components only
- **Design language** — dark background, monospace typography (JetBrains Mono), border-based structure over shadows, data as the visual protagonist
- **Responsive layout** — single-column on mobile, grid-based on desktop (`md:grid-cols-3`)
- **Charts** — horizontal bar charts via Recharts with custom SVG tick rendering and inline value labels

---

## Folder Structure

```
src/
├── app/
│   ├── index.tsx              # Root composition: wraps providers + router
│   ├── providers.tsx          # Global providers (QueryClientProvider, AuthProvider, TooltipProvider)
│   └── router.tsx             # React Router route definitions (/, /auth/callback)
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   └── AuthStatus.tsx         # Header chip: sign-in buttons or avatar + name + sign-out
│   │   ├── hooks/
│   │   │   ├── useAuth.ts             # TanStack Query hook for GET /auth/me
│   │   │   └── useAuthContext.ts      # Reads AuthContext — throws if used outside AuthProvider
│   │   ├── pages/
│   │   │   └── AuthCallbackPage.tsx   # Handles /auth/callback redirect after OAuth
│   │   ├── context.ts                 # AuthContext creation + AuthContextValue type (plain .ts, no components)
│   │   ├── AuthContext.tsx            # AuthProvider component only
│   │   └── index.ts                   # Feature public exports
│   └── market/
│       ├── components/
│       │   ├── index.ts                       # Component exports
│       │   ├── MarketFilters.tsx              # Country select + role text input + freshness label
│       │   ├── RemoteDistributionChart.tsx    # Horizontal bar chart: remote/hybrid/onsite
│       │   ├── SkillCategoryBreakdown.tsx     # Per-category section: desktop chart + mobile list
│       │   ├── TopRolesChart.tsx              # Dual-bar chart: count + avgSalary per role
│       │   └── TopSkillsChart.tsx             # Horizontal bar chart: top 10 skills by category
│       ├── hooks/
│       │   ├── index.ts                   # Hook exports
│       │   ├── useCountries.ts            # Fetches country list for filter select
│       │   └── useMarketOverview.ts       # Fetches market analytics data
│       ├── pages/
│       │   └── MarketOverviewPage.tsx     # Main analytics dashboard
│       └── index.ts                       # Feature public exports
│
├── shared/
│   ├── api/
│   │   ├── client.ts           # Fetch abstraction (base URL, credentials: include, error handling)
│   │   ├── index.ts            # Domain endpoint functions
│   │   └── types.ts            # Shared frontend domain types (MarketOverview, Country, AuthUser)
│   ├── hooks/
│   │   ├── index.ts            # Shared hook exports
│   │   └── useDebounce.ts      # Debounce utility for input performance
│   └── ui/
│       ├── avatar.tsx          # shadcn/ui Avatar with size variants (sm/default/lg)
│       ├── Icons.tsx           # SVG icon components: ArrowDownSLine, Google, GitHub
│       ├── separator.tsx       # shadcn/ui Separator (horizontal/vertical)
│       └── tooltip.tsx         # shadcn/ui Tooltip primitive (Radix-based)
│
└── tests/
    ├── components/
    │   ├── AuthStatus.test.tsx               # Sign-in state, authenticated state, logout
    │   ├── MarketFilters.test.tsx            # Interactions: country select, role input
    │   ├── RemoteDistributionChart.test.tsx  # Data transformation to chart entries
    │   └── TopRolesChart.test.tsx            # Data transformation to chart entries
    ├── hooks/
    │   ├── useAuth.test.tsx                  # Loading, unauthenticated (401), authenticated (200)
    │   ├── useDebounce.test.ts               # Timing and debounce behavior
    │   ├── useCountries.test.tsx             # Fetch, loading, error states
    │   └── useMarketOverview.test.tsx        # Fetch, loading, error, filter reactivity
    ├── mocks/
    │   ├── handlers.ts                       # MSW mock API handlers (incl. /auth/me → 401)
    │   └── server.ts                         # MSW node server setup
    ├── pages/
    │   ├── AuthCallbackPage.test.tsx         # Redirect to / or /login based on ?success param
    │   └── MarketOverviewPage.test.tsx       # Integration: full filter → fetch → render flow
    └── setup.ts                              # MSW server lifecycle + jest-dom setup
```

---

## Current Features

### Market Overview Dashboard (`/`)

The `MarketOverviewPage` orchestrates the dashboard:

- Manages filter state: selected country and role search input
- Passes debounced role value to `useMarketOverview` to avoid over-fetching
- Renders filter controls, stat blocks, and chart components
- Responsive grid layout: stats + remote distribution on top, top roles full-width below
- **Loading state**: animate-pulse skeleton grid mirroring the full layout (sr-only label for accessibility)
- **Empty state**: "no jobs found" message when `totalJobs === 0` (e.g. role filter with no results)
- **Error state**: visible destructive-color error message when the API call fails

**Filters** (`MarketFilters`)

- Country dropdown populated dynamically from `GET /api/countries`
- Role text input with debounce via `useDebounce`
- Data freshness label: shows how long ago the selected country was last ingested (e.g. "data from 3 hours ago"). When no country is selected, shows the most recently ingested country's timestamp. Computed by `formatLastIngested()` — a pure function, no external library.

**Stats displayed**

- Total jobs analyzed
- Average salary

**Charts**

- `RemoteDistributionChart` — horizontal bar chart showing remote/hybrid/onsite distribution
- `TopRolesChart` — dual-bar horizontal chart: **count** (white/20% opacity) + **average salary** (white/50% opacity) per role. Each bar has an independent axis so both series scale correctly regardless of magnitude. Salary label formatted as `Xk`.
- `TopSkillsChart` — horizontal bar chart showing top 10 skills by count, colored by category
- `SkillCategoryBreakdown` — one section per skill category showing the top 5 skills within it. Desktop: Recharts horizontal bar chart. Mobile: text list with inline percentage bars. Header shows category label, job count, and "found in X% of jobs". Rendered in a loop from `MarketOverviewPage` — each category is an independent section, not nested inside a container component.

---

## API Contract (Frontend Side)

Consumed from `shared/api/`:

| Endpoint                   | Hook                | Description                                                                                                                                                                            |
| -------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/market/overview` | `useMarketOverview` | Returns `totalJobs`, `averageSalary`, `remoteDistribution`, `topRoles` (with `avgSalary`), `topSkills`, `skillCategoryBreakdown` (top 5 skills per category with count and percentage) |
| `GET /api/countries`       | `useCountries`      | Returns `{ id, code, name, lastIngestedAt }[]` for filter select and freshness label                                                                                                   |
| `GET /auth/me`             | `useAuth`           | Returns `{ sub, provider, email, name, picture }` if authenticated, 401 otherwise. Called on app load to restore session from the `ds_auth` httpOnly cookie                           |
| `POST /auth/logout`        | (direct fetch)      | Clears the `ds_auth` cookie. Called from `AuthStatus` on sign-out click, then query cache is cleared                                                                                  |

Query params forwarded by `useMarketOverview`: `countryCode`, `role` (debounced).

All requests include `credentials: 'include'` so the browser sends the `ds_auth` cross-origin cookie.

---

## Tech Stack

- React + TypeScript
- Vite (dev server + build)
- React Router v6 (client-side routing)
- TanStack Query v5 (server state, caching, background refetch)
- Recharts v3 (chart visualizations)
- Tailwind CSS v4 + shadcn/ui (zinc theme)

---

## Scripts

From `frontend/`:

- `pnpm dev` — start Vite dev server
- `pnpm build` — production build
- `pnpm preview` — preview production build locally
- `pnpm lint` — run ESLint
- `pnpm format` — run Prettier across all files

---

## Running Locally

1. Install dependencies (from `frontend/`):

```bash
pnpm install
```

2. Configure environment:
    - Create a `.env` file with:
        - `VITE_API_URL` — base URL of the backend (e.g. `http://localhost:3000`)

3. Start the dev server:

```bash
pnpm dev
```

Make sure the backend is running and accessible at the configured base URL.

---

## Testing Strategy

**Philosophy:** Behavior over implementation. Tests assert what the user sees and what the system does — not how it's internally wired. MSW intercepts network requests at the fetch level, so tests remain valid even if the API client changes internally.

**Stack:** Vitest + React Testing Library + MSW + `@testing-library/user-event`

**Hooks** — tested in isolation with a `QueryClientProvider` wrapper:

- `useDebounce` — pure timing tests using `vi.useFakeTimers()`
- `useCountries` — covers loading, success, and error states
- `useMarketOverview` — same pattern plus filter reactivity: verifies that changing `countryCode` triggers a new fetch with updated data

**Components** — tested with real user interactions via `userEvent`:

- `MarketFilters` — country select (load, select, deselect, API error), role input (typing, controlled value)
- `RemoteDistributionChart` — verifies correct data transformation before reaching Recharts
- `TopRolesChart` — same pattern; Recharts mocked entirely since jsdom has no layout engine

**Page (integration)** — `MarketOverviewPage` tested end-to-end with real hooks and MSW:

- Loading skeleton renders and exposes accessible text via `sr-only` span
- Empty state renders when API returns `totalJobs: 0`
- Error, and success states
- Null salary renders `—`
- Country filter change triggers new request and updates displayed data

---

## Intentional Simplifications (Current Phase)

- **No protected routes** — the market overview is public by design; `ProtectedRoute` infrastructure is ready for when Personal Match Scoring (v0.7) requires gating behind auth
- **Auth state not one-time-use CSRF** — the backend HMAC state is not invalidated on use; the fix (Redis-based revocation) is deferred until the User model is added in the next phase
