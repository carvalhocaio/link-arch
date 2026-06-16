# Changelog

All notable changes to this project will be documented in this file.

Follows [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
