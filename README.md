# Link Arch

Link Arch is a fast, lightweight link management platform built with Next.js and Bun. It supports authenticated URL shortening, custom aliases, click tracking, URL lifecycle management, and Google OAuth sign-in.

## Features

- Authenticated link management with Google sign-in (Better Auth OAuth)
- Create short URLs with custom keys or generated aliases
- URL reachability validation before creating or updating links
- Link administration: update destination, update key, toggle active status, set expiry date, and soft delete
- Redirect and non-redirect preview (`/:key/peek`) endpoints
- Dashboard and My Links UI with search, filtering, sorting, pagination, and CSV export

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [Next.js](https://nextjs.org) 16 (App Router, Turbopack) — serves both frontend and API via Route Handlers
- **Auth:** [Better Auth](https://www.better-auth.com) with Google OAuth
- **Database:** PostgreSQL
- **ORM:** [Drizzle ORM](https://orm.drizzle.team) (with [postgres.js](https://github.com/porsager/postgres) driver)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com) v4
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query) v5
- **Monorepo:** [Turborepo](https://turbo.build)
- **Linter/Formatter:** [Biome](https://biomejs.dev)

## Prerequisites

- [Bun](https://bun.sh) v1.2.0+
- [PostgreSQL](https://www.postgresql.org) running locally or remotely

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/carvalhocaio/link-arch.git
cd link-arch
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Set values in `apps/web/.env.local`:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | _(required)_ |
| `BETTER_AUTH_SECRET` | Better Auth signing secret | _(required)_ |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID | _(required)_ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret | _(required)_ |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (used by Better Auth) | `http://localhost:3001` |
| `FORWARD_TIMEOUT_MS` | Timeout in milliseconds for URL reachability checks | `5000` |

> Create the Google OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (type: Web application) and set the authorized redirect URI to `<NEXT_PUBLIC_APP_URL>/api/auth/callback/google`.

### 4. Run database migrations

```bash
bun run db:migrate
```

### 5. Start development

```bash
bun run dev
```

The app runs at `http://localhost:3001`.

## Available Scripts

Run all commands from the monorepo root with `bun run <script>`.

| Script | Description |
|---|---|
| `dev` | Start the web app in development mode |
| `dev:web` | Start only the web app |
| `build` | Build all apps and packages |
| `lint` | Run lint tasks in workspaces |
| `check` | Run Biome checks in workspaces |
| `format` | Format repository files with Biome |
| `db:generate` | Generate Drizzle migration files |
| `db:migrate` | Apply pending migrations |

## Project Structure

This repository is a Turborepo monorepo:

- `apps/web` - Next.js app: frontend + API Route Handlers (shorten, redirect, auth, admin)
- `packages/db` - Drizzle migration scripts
- `packages/biome-config` - Shared Biome configuration
- `packages/tsconfig` - Shared TypeScript configuration

## API Overview

All API routes are served from the Next.js app (`apps/web`):

- `GET /api/health` - Health and metadata
- `POST /api/auth/sign-in/social` - Start Google OAuth sign-in (returns redirect URL)
- `GET /api/auth/callback/google` - Google OAuth callback (handled by Better Auth)
- `GET /api/auth/get-session` - Current user session
- `POST /api/auth/sign-out` - End session
- `POST /api/shorten` - Create short URL (authenticated)
- `GET /:key` - Redirect to target URL
- `GET /:key/peek` - Preview URL metadata without redirect
- `GET /api/admin/urls` - List current user URLs (authenticated)
- `PATCH /api/admin/urls/:id` - Update destination URL and expiry (authenticated)
- `PATCH /api/admin/urls/:id/key` - Update short key (authenticated)
- `PATCH /api/admin/urls/:id/status` - Activate/deactivate link (authenticated)
- `DELETE /api/admin/urls/:id` - Soft delete link (authenticated)

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed breakdown of the monorepo layout, tech stack decisions, database schema, API design, authentication flow, and testing strategy.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

## License

[MIT](LICENSE) — free to use, modify, and distribute. Attribution appreciated.
