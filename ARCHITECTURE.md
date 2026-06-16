# Architecture

## 1. Overview

Link Arch is a URL shortening platform where authenticated users create short links with optional custom aliases, set expiry dates, and track click counts in real time. The system validates target URL reachability before storing a link, auto-deactivates expired links on read, and exposes a full OpenAPI spec generated directly from route schemas.

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────────┐     ┌────────────┐
│   Browser   │────▶│   Next.js 16     │────▶│    Elysia API        │────▶│ PostgreSQL │
│             │     │   (App Router)   │     │   (Bun runtime)      │     │            │
└─────────────┘     └──────────────────┘     └──────────────────────┘     └────────────┘
                            │                          │
                            │                          ├── Better Auth  (sessions)
                            └── React Query ───────────┤
                                (client cache)         └── Drizzle ORM  (queries)
```

---

## 2. Monorepo layout

This repository is a [Turborepo](https://turbo.build) monorepo managed with Bun workspaces.

| Path | Type | Responsibility |
|---|---|---|
| `apps/api` | Application | Elysia HTTP server: shorten, redirect, auth, admin routes |
| `apps/web` | Application | Next.js 16 frontend: landing page, dashboard, my-links, login |
| `packages/db` | Shared package | Drizzle schema, auth schema, migration scripts |
| `packages/biome-config` | Shared config | Biome linter/formatter rules shared across workspaces |
| `packages/tsconfig` | Shared config | Base TypeScript configuration shared across workspaces |
| `.claude/` | Tooling | Claude Code agents and skills for AI-assisted development |
| `.github/workflows/` | CI/CD | GitHub Actions for tests and automated releases |

---

## 3. Tech stack decisions

**Bun** — used as the JavaScript runtime, package manager, and test runner. Eliminates the TypeScript transpilation step with native `.ts` execution and offers faster cold starts than Node.js. The built-in test runner removes a dev dependency.

**Elysia** — the API framework. Chosen for end-to-end type safety via the Eden treaty client, built-in OpenAPI 3.0 spec generation from route schemas (no manual spec authoring), and first-class Bun compatibility. Route schema validation is the single source of truth for both runtime enforcement and documentation.

**Better Auth** — handles authentication. Framework-agnostic design allows swapping the database adapter without rewriting auth logic. Authentication is Google OAuth only; account linking is enabled with Google as a trusted provider so a returning user is matched by email. The PostgreSQL adapter integrates directly with the existing Drizzle connection.

**Drizzle ORM** — SQL-first ORM with zero runtime overhead. Schema is plain TypeScript; migrations are plain SQL files checked into `packages/db/drizzle/`. TypeScript types are inferred directly from the schema, eliminating a separate type-generation step.

**Turborepo** — task orchestrator for the monorepo. Defines a task graph (`turbo.json`) so `build`, `test`, and `lint` run in dependency order with local caching. Parallel pipeline execution reduces CI time when apps have no mutual dependency.

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

Managed by Better Auth. Schema declared in `packages/db/src/auth-schema.ts` and kept in sync with the Better Auth PostgreSQL adapter contract.

**Key decisions:**

- **Soft delete** — `is_deleted` preserves click analytics after a user "removes" a link. Hard deletes would break historical stats.
- **Auto-expiry on read** — `findByKey()` in `url.service.ts` checks `expires_at` and sets `is_active = false` inline when the link is fetched past its expiry. No background cron job required for the current scale.
- **Composite index** — `(user_id, created_at)` covers the dashboard query that lists a user's links sorted by creation date.

---

## 5. API design

Routes are grouped by concern. All authenticated routes require a valid Better Auth session cookie.

| Group | Routes | Auth |
|---|---|---|
| Health | `GET /health` | Public |
| Auth | `POST /api/auth/sign-in/social`, `GET /api/auth/callback/google`, `GET /api/auth/get-session`, `POST /api/auth/sign-out` | Public |
| Shorten | `POST /api/shorten` | Required |
| Redirect | `GET /:key` | Public |
| Preview | `GET /:key/peek` | Public |
| Admin | `GET /api/admin/urls`, `PATCH /api/admin/urls/:id`, `PATCH /api/admin/urls/:id/key`, `PATCH /api/admin/urls/:id/status`, `DELETE /api/admin/urls/:id` | Required |
| OpenAPI | `GET /openapi` | Public |

OpenAPI is auto-generated by the `@elysiajs/openapi` plugin from the route `.body`, `.response`, and `.params` schemas defined inline. No separate spec file exists — the running server is the source of truth.

---

## 6. Authentication flow

```
Client                       Elysia API            Better Auth          Google
  │                              │                      │                   │
  │─ POST /sign-in/social ──────▶│─ auth.handler ──────▶│                   │
  │  { provider: "google" }      │                      │ build OAuth URL   │
  │◀── { url } ──────────────────│◀─────────────────────│                   │
  │                              │                      │                   │
  │── window.location = url ──────────────────────────────────────────────▶ │
  │                              │                      │       user consents
  │◀──────── redirect to /api/auth/callback/google?code=… ───────────────────│
  │─ GET /callback/google ──────▶│─ auth.handler ──────▶│ exchange code,     │
  │                              │                      │ upsert user+account│
  │◀── Set-Cookie: session ───────────────────────────────│ + redirect /dashboard
  │                              │                      │                   │
  │── POST /api/shorten ────────▶│─ auth-middleware ───▶│                   │
  │   (with session cookie)      │◀── { user } ─────────│                   │
  │◀── 201 { shortUrl } ─────────│                      │                   │
```

The login button issues `POST /api/auth/sign-in/social` and follows the returned `url` to Google. After consent, Better Auth handles the callback, upserts the `user` and `account` rows, sets the session cookie, and redirects to `/dashboard`.

`auth-middleware.ts` calls `auth.api.getSession()` on each protected request. If no valid session is found, it returns `401`. The authenticated user is attached to the Elysia context and passed to route handlers without re-fetching from the database.

On the web side, `proxy.ts` (Next.js middleware) guards `/dashboard` and `/my-links` by checking for the session cookie, and redirects authenticated users away from `/login`.

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
├── sign-in/page.tsx      ← Redirects to /login
├── sign-up/page.tsx      ← Redirects to /login
components/
├── app-topbar.tsx
├── app-sidebar.tsx
├── dashboard-shell.tsx
├── short-url-result.tsx
├── edit-url-dialog.tsx
└── delete-url-action.tsx
hooks/                    ← React Query hooks (Client)
lib/                      ← Utilities: api.ts, url.ts, activity.ts, expiry.ts
```

---

## 8. Testing strategy

| Layer | Tool | Location | Scope |
|---|---|---|---|
| Unit | Bun test | `apps/api/tests/keygen.test.ts` | Key generation & validation logic |
| Unit | Bun test | `apps/api/tests/validator.test.ts` | URL reachability checks |
| Integration | Bun test | `apps/api/tests/peek-route.test.ts` | Peek endpoint with in-process server |
| E2E (API) | Bun test | `apps/api/tests/peek-route.e2e.test.ts` | Full request cycle against PostgreSQL |
| Load | k6 | `apps/api/k6/latency.js` | p95 < 200ms at 50 VUs (create + peek + redirect) |
| CI | GitHub Actions | `.github/workflows/tests.yml` | E2E tests against PostgreSQL 16 service on every PR and push to main |

---

## 9. Known limitations

- No IP-based rate limiting on the shorten or redirect endpoints.
- Click analytics are a simple counter; there is no time-series aggregation (clicks per day/week).
- The CSV export button in the My Links UI is wired to the UI layer but the file download is not yet implemented.
- The `isUrlReachable` validator uses a 5-second HTTP HEAD/GET timeout; unreachable but eventually-consistent URLs will be rejected.
