# Architecture

## 1. Overview

Link Arch is a URL shortening platform where authenticated users create short links with optional custom aliases, set expiry dates, and track click counts in real time. The system validates target URL reachability before storing a link and auto-deactivates expired links on read.

The frontend and API are colocated in a single Next.js application. Route Handlers serve all API endpoints; there is no separate backend process.

```
┌─────────────┐     ┌────────────────────────────────────────┐     ┌────────────┐
│   Browser   │────▶│   Next.js 16 (App Router)              │────▶│ PostgreSQL │
│             │     │   Frontend + API Route Handlers         │     │            │
└─────────────┘     └────────────────────────────────────────┘     └────────────┘
                              │
                              ├── Better Auth  (sessions, Google OAuth)
                              ├── Drizzle ORM  (queries)
                              └── React Query  (client-side cache)
```

---

## 2. Monorepo layout

This repository is a [Turborepo](https://turbo.build) monorepo managed with Bun workspaces.

| Path | Type | Responsibility |
|---|---|---|
| `apps/web` | Application | Next.js 16: frontend + all API Route Handlers (shorten, redirect, auth, admin) |
| `packages/db` | Shared package | Drizzle migration scripts and SQL migration files |
| `packages/biome-config` | Shared config | Biome linter/formatter rules shared across workspaces |
| `packages/tsconfig` | Shared config | Base TypeScript configuration shared across workspaces |
| `.claude/` | Tooling | Claude Code agents and skills for AI-assisted development |
| `.github/workflows/` | CI/CD | GitHub Actions for migrations and automated releases |

`apps/web` is self-contained: the database schema (`lib/db/`) and all service logic (`lib/services/`) live inside the app, with no workspace dependencies beyond shared config.

---

## 3. Tech stack decisions

**Bun** — used as the JavaScript runtime and package manager. Eliminates the TypeScript transpilation step with native `.ts` execution and offers faster cold starts than Node.js.

**Next.js 16 (App Router)** — serves both the React frontend and all API endpoints via Route Handlers. A single Next.js deployment replaces a separate Elysia API server, removing CORS configuration, cross-origin cookie handling, and a second Vercel project. Static pages are pre-rendered; dynamic routes (API, redirect) are server-rendered on demand.

**Better Auth** — handles authentication. Framework-agnostic design allows swapping the database adapter without rewriting auth logic. Authentication is Google OAuth only; account linking is enabled with Google as a trusted provider so a returning user is matched by email. The PostgreSQL adapter integrates directly with the existing Drizzle connection. The auth client (`lib/auth-client.ts`) is used on the frontend to handle CSRF tokens automatically.

**Drizzle ORM** — SQL-first ORM with zero runtime overhead. Schema is plain TypeScript in `apps/web/lib/db/`; migrations are plain SQL files in `packages/db/drizzle/`. TypeScript types are inferred directly from the schema.

**Turborepo** — task orchestrator for the monorepo. Defines a task graph (`turbo.json`) so `build` and `lint` run in dependency order with local caching. Environment variables are explicitly declared in `turbo.json` so the Vercel build pipeline exposes them to the Next.js build process.

**Biome** — unified linter and formatter replacing ESLint + Prettier. Single config, faster execution, no plugin conflicts.

---

## 4. Database schema

All tables live in the default PostgreSQL schema. Migrations are sequential SQL files in `packages/db/drizzle/`.

### `urls`

Core shortening table. Owns the business logic data.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | — |
| `user_id` | text FK → `user.id` | Cascade delete |
| `key` | text UNIQUE | Short alias; 7-char generated or custom |
| `target_url` | text | Validated reachable before insert |
| `is_active` | boolean | Manually toggled; auto-set false on expiry |
| `is_deleted` | boolean | Soft delete — row is never removed |
| `clicks` | integer | Incremented atomically on redirect |
| `expires_at` | timestamp (nullable) | Auto-deactivation trigger |
| `created_at` | timestamp | — |
| `updated_at` | timestamp | — |

Indexes: `urls_user_id_idx`, `urls_user_id_created_at_idx` (dashboard query performance).

### Auth tables (`user`, `session`, `account`, `verification`)

Managed by Better Auth. Schema declared in `apps/web/lib/db/auth-schema.ts` and kept in sync with the Better Auth PostgreSQL adapter contract.

**Key decisions:**

- **Soft delete** — `is_deleted` preserves click analytics after a user "removes" a link. Hard deletes would break historical stats.
- **Auto-expiry on read** — `findByKey()` in `url.service.ts` checks `expires_at` and sets `is_active = false` inline when the link is fetched past its expiry. No background cron job required for the current scale.
- **Composite index** — `(user_id, created_at)` covers the dashboard query that lists a user's links sorted by creation date.

---

## 5. API design

All routes are Next.js Route Handlers inside `apps/web/app/`. Authenticated routes require a valid Better Auth session cookie.

| Group | Routes | Auth |
|---|---|---|
| Health | `GET /api/health` | Public |
| Auth | `POST /api/auth/sign-in/social`, `GET /api/auth/callback/google`, `GET /api/auth/get-session`, `POST /api/auth/sign-out` | Public |
| Shorten | `POST /api/shorten` | Required |
| Redirect | `GET /:key` | Public |
| Preview | `GET /:key/peek` | Public |
| Admin | `GET /api/admin/urls`, `PATCH /api/admin/urls/[id]`, `PATCH /api/admin/urls/[id]/key`, `PATCH /api/admin/urls/[id]/status`, `DELETE /api/admin/urls/[id]` | Required |

Static Next.js routes (`/dashboard`, `/login`, `/my-links`, etc.) take routing priority over the dynamic `[key]` catch-all segment.

---

## 6. Authentication flow

```
Client                    Next.js Route Handler     Better Auth          Google
  │                              │                      │                   │
  │─ POST /sign-in/social ──────▶│─ auth.handler ──────▶│                   │
  │  { provider: "google" }      │                      │ build OAuth URL   │
  │◀── { url } ──────────────────│◀─────────────────────│                   │
  │                              │                      │                   │
  │── window.location = url ──────────────────────────────────────────────▶ │
  │                              │                      │       user consents
  │◀──────── redirect to /api/auth/callback/google?code=… ───────────────────│
  │─ GET /callback/google ──────▶│─ auth.handler ──────▶│ exchange code,    │
  │                              │                      │ upsert user+account
  │◀── Set-Cookie: session ──────│◀─────────────────────│ redirect /dashboard
  │                              │                      │                   │
  │── POST /api/shorten ────────▶│─ getSession() ──────▶│                   │
  │   (with session cookie)      │◀── { user } ─────────│                   │
  │◀── 201 { shortUrl } ─────────│                      │                   │
```

The login button calls `POST /api/auth/sign-in/social` and redirects to the returned Google URL. After consent, Better Auth handles the callback, upserts the `user` and `account` rows, sets the session cookie, and redirects to `/dashboard`.

Session validation on protected Route Handlers uses `auth.api.getSession({ headers: request.headers })`. The Next.js middleware (`proxy.ts`) guards `/dashboard` and `/my-links` via the session cookie, and redirects authenticated users away from `/login`.

Sign-out uses the Better Auth client SDK (`authClient.signOut()`) on the frontend to ensure CSRF tokens are handled correctly.

---

## 7. Frontend architecture

The web app uses Next.js 16 App Router. Pages are Server Components by default; only leaves that need interactivity (forms, dialogs, mutation triggers) are marked `"use client"`.

**Data fetching** — [TanStack React Query](https://tanstack.com/query) v5 manages all API calls from Client Components. Each domain has a dedicated hook file:

- `hooks/use-my-urls.ts`, `use-shorten-url.ts`, `use-peek-url.ts`, `use-update-my-url*.ts`, `use-delete-my-url.ts` — link operations
- `hooks/use-session.ts`, `use-sign-out.ts` — session and sign-out (sign-in is a redirect, not a hook)

**State** — no global state library. React Query's cache is the single source of truth for server data. UI state (dialogs, forms) is local `useState`.

**Theming** — `next-themes` provides system/light/dark toggle. CSS variables defined in `globals.css` are consumed by Tailwind utility classes.

**Component structure:**

```
proxy.ts                  ← Route guard (session-cookie check)
app/
├── page.tsx              ← Public landing page (Server Component)
├── dashboard/page.tsx    ← Dashboard (protected)
├── my-links/page.tsx     ← My Links (protected)
├── login/page.tsx        ← Google sign-in
├── [key]/route.ts        ← Short URL redirect (Route Handler)
├── [key]/peek/route.ts   ← Preview endpoint (Route Handler)
├── api/                  ← All API Route Handlers
│   ├── auth/[...all]/    ← Better Auth handler
│   ├── health/           ← Health endpoint
│   ├── shorten/          ← URL creation
│   └── admin/urls/       ← Link administration
lib/
├── auth.ts               ← Better Auth server config
├── auth-client.ts        ← Better Auth browser client (CSRF-aware)
├── db.ts                 ← Drizzle connection
├── db/schema.ts          ← urls table + auth table re-exports
├── db/auth-schema.ts     ← Better Auth PostgreSQL schema
├── services/             ← url.service.ts, keygen.ts, validator.ts
└── api.ts                ← Client-side fetch wrappers ("use client")
hooks/                    ← React Query hooks (Client)
```

---

## 8. Testing strategy

| Layer | Tool | Location | Scope |
|---|---|---|---|
| CI | GitHub Actions | `.github/workflows/tests.yml` | Database migrations against PostgreSQL 16 service on every PR and push to main |

Unit and integration tests were part of the removed `apps/api` package. Migrating them to `apps/web` is tracked as a known limitation.

---

## 9. Known limitations

- No unit or integration tests for Route Handlers after the Elysia → Next.js migration. The previous test suite lived in `apps/api/tests/` and was removed with the package.
- No OpenAPI spec. The previous spec was auto-generated by the Elysia plugin; Next.js Route Handlers have no equivalent built-in.
- No IP-based rate limiting on the shorten or redirect endpoints.
- Click analytics are a simple counter; there is no time-series aggregation (clicks per day/week).
- The CSV export button in the My Links UI is wired to the UI layer but the file download is not yet implemented.
- The `isUrlReachable` validator uses a 5-second HTTP HEAD/GET timeout; unreachable but eventually-consistent URLs will be rejected.
