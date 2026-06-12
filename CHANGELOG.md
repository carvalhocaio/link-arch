# Changelog

All notable changes to this project will be documented in this file.

Follows [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
