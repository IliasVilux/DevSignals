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

| Layer       | Responsibility                                     |
| ----------- | -------------------------------------------------- |
| `app/`      | Root composition, global providers, routing        |
| `features/` | Domain-scoped components, hooks, and pages         |
| `shared/`   | Cross-feature API client, types, and utility hooks |

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
│   ├── providers.tsx          # Global providers (QueryClientProvider)
│   └── router.tsx             # React Router route definitions
│
├── features/
│   └── market/
│       ├── components/
│       │   ├── index.ts                    # Component exports
│       │   ├── MarketFilters.tsx           # Country select + role text input
│       │   ├── RemoteDistributionChart.tsx # Horizontal bar chart: remote/hybrid/onsite
│       │   └── TopRolesChart.tsx           # Horizontal bar chart: top 5 roles
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
│   │   ├── client.ts           # Fetch abstraction (base URL, error handling)
│   │   ├── index.ts            # Domain endpoint functions
│   │   └── types.ts            # Shared frontend domain types
│   ├── hooks/
│   │   ├── index.ts            # Shared hook exports
│   │   └── useDebounce.ts      # Debounce utility for input performance
│   └── ui/
│       └── Icons.tsx           # SVG icon components (typed with SVGProps)
│
└── tests/
    ├── hooks/
    │   ├── useDebounce.test.ts           # Timing and debounce behavior
    │   ├── useCountries.test.tsx         # Fetch, loading, error states
    │   └── useMarketOverview.test.tsx    # Fetch, loading, error, filter reactivity
    ├── mocks/
    │   ├── handlers.ts                   # MSW mock API handlers
    │   └── server.ts                     # MSW node server setup
    └── setup.ts                          # MSW server lifecycle + jest-dom setup
```

---

## Current Features

### Market Overview Dashboard (`/`)

The `MarketOverviewPage` orchestrates the dashboard:

- Manages filter state: selected country and role search input
- Passes debounced role value to `useMarketOverview` to avoid over-fetching
- Renders filter controls, stat blocks, and chart components
- Responsive grid layout: stats + remote distribution on top, top roles full-width below

**Filters** (`MarketFilters`)

- Country dropdown populated dynamically from `GET /api/countries`
- Role text input with debounce via `useDebounce`

**Stats displayed**

- Total jobs analyzed
- Average salary

**Charts**

- `RemoteDistributionChart` — horizontal bar chart showing remote/hybrid/onsite distribution
- `TopRolesChart` — horizontal bar chart showing top 5 roles by job count

---

## API Contract (Frontend Side)

Consumed from `shared/api/`:

| Endpoint                   | Hook                | Description                                                            |
| -------------------------- | ------------------- | ---------------------------------------------------------------------- |
| `GET /api/market/overview` | `useMarketOverview` | Returns `totalJobs`, `averageSalary`, `remoteDistribution`, `topRoles` |
| `GET /api/countries`       | `useCountries`      | Returns `{ id, code, name }[]` for filter select                       |

Query params forwarded by `useMarketOverview`: `countryCode`, `role` (debounced).

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
        - `VITE_API_BASE_URL` — base URL of the backend (e.g. `http://localhost:3000`)

3. Start the dev server:

```bash
pnpm dev
```

Make sure the backend is running and accessible at the configured base URL.

---

## Testing Strategy

**Philosophy:** Hooks are tested in isolation using MSW to intercept network requests at the fetch level. This keeps tests decoupled from implementation details — if the API client changes internally, the tests remain valid because they test behavior, not internals.

**Stack:** Vitest + React Testing Library + MSW

- **`useDebounce`** — pure timing tests using `vi.useFakeTimers()`
- **`useCountries`** — hook tested with `QueryClientProvider` wrapper and MSW handler; covers loading, success, and error states
- **`useMarketOverview`** — same pattern plus filter change test: verifies that changing `countryCode` triggers a new fetch with updated data

---

## Intentional Simplifications (Current Phase)

- **No component tests yet** — hooks are covered; React Testing Library component tests will be introduced in a later phase when the UI stabilizes
- **No error boundaries** — basic error states handled at the hook level; structured error UI is a next step
- **Single route** — routing infrastructure is in place; additional pages will be added as new features are built
