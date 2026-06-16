# Changelog

All notable changes to this project will be documented in this file.

Follows [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.0.1] - 2026-06-16

### Fixed
- Sign-out returning 400 in production: replaced raw `fetch` with Better Auth client SDK (`authClient.signOut()`) which handles CSRF tokens automatically.
- Sign-out returning 415: `POST /api/auth/sign-out` now sends `Content-Type: application/json`.
- Vercel build warnings: exposed all required env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FORWARD_TIMEOUT_MS`, `NEXT_PUBLIC_APP_URL`) to the Turbo build pipeline via `turbo.json`.
- `api.ts` marked as `"use client"` to prevent accidental import in server components after `better-auth/react` dependency was introduced.

### Changed
- Vercel project renamed from `web` to `link-arch`; stable production domain migrated to `https://linkarch.vercel.app`.
- GitHub repository connected to Vercel for continuous deployment — push to `main` triggers automatic production deploy.
- `apps/web` is now fully self-contained: DB schema moved from `packages/db` into `apps/web/lib/db/`, `@link-arch/db` workspace dependency removed, `vercel.json` install command simplified to `bun install`.

## [2.0.0] - 2026-06-15

### Breaking Changes
- Authentication switched from email/password to Google OAuth exclusively — existing credential accounts cannot log in; users must authenticate via Google. (#e2b7381)

### Added
- Public landing page at `/` with hero, feature highlights, and call-to-action. (#8fb3839)
- `/dashboard` route (previously `/`) protected by middleware — unauthenticated users are redirected to `/login`. (#8fb3839)
- `/login` route replacing `/sign-in`, managed by Better Auth's OAuth handler. (#8fb3839)
- Next.js proxy middleware protecting `/dashboard` and `/my-links`, and redirecting already-authenticated users away from `/login`. (#8fb3839)
- Account linking support: users with a pre-existing email can connect their Google account automatically. (#12a1ed2)

### Fixed
- Google sign-in button now correctly initiates OAuth via `POST /api/auth/sign-in/social` (GET returned 404). (#12a1ed2)
- Sign-in failures now surface a toast notification instead of silently freezing the button. (#8a4e6e5)

## [1.0.0] - 2026-06-11

### Added

- Authenticated URL shortening with optional custom key support
- URL reachability validation before creating or updating links
- Link administration: update destination, change key, toggle active status, set expiry date, soft delete
- Redirect endpoint (`GET /:key`) with atomic click counter increment
- Non-redirect preview endpoint (`GET /:key/peek`) returning link metadata without following the redirect
- Auto-deactivation of expired links on read — no background cron required
- Dashboard with recent activity feed and quick stats (total links, active links, total clicks)
- My Links page with search, filtering, sorting, and pagination UI
- Email/password authentication via Better Auth with cookie-based sessions
- Auto-generated OpenAPI 3.0 documentation served at `GET /openapi`
- k6 load test script targeting p95 latency under 200ms at 50 virtual users
- GitHub Actions CI pipeline running integration tests against a PostgreSQL 16 service

[Unreleased]: https://github.com/carvalhocaio/link-arch/compare/v2.0.1...HEAD
[2.0.1]: https://github.com/carvalhocaio/link-arch/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/carvalhocaio/link-arch/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/carvalhocaio/link-arch/releases/tag/v1.0.0
