---
name: api-conventions
description: REST API design conventions — URL structure, HTTP methods, status codes, response shape, pagination and security. Auto-loaded when editing route, router, handler or controller files.
user-invocable: false
paths:
  - "**/routes/**"
  - "**/router/**"
  - "**/controllers/**"
  - "**/handlers/**"
  - "**/api/**"
---

Apply these conventions whenever you design or modify API endpoints in this project.

## URL design

- Use **kebab-case** for path segments: `/user-profiles`, not `/userProfiles`
- Use **plural nouns** for resources: `/users`, `/orders`
- Use verbs in path only for actions: `/users/{id}/activate`, `/payments/{id}/refund`
- Version via prefix: `/v1/users` — never break a versioned contract without a new version
- No trailing slashes; nest resources max 2 levels deep

## HTTP methods

| Intent         | Method   | Notes                                   |
| -------------- | -------- | --------------------------------------- |
| List resources | `GET`    | Supports pagination, filtering, sorting |
| Get one        | `GET`    |                                         |
| Create         | `POST`   | Returns `201` + `Location` header       |
| Full replace   | `PUT`    | Idempotent                              |
| Partial update | `PATCH`  | Only send changed fields                |
| Delete         | `DELETE` | Returns `204 No Content`                |
| Trigger action | `POST`   | e.g. `POST /payments/{id}/refund`       |

## Status codes

- `200` success with body · `201` created · `204` no body
- `400` invalid input · `401` unauthenticated · `403` unauthorized · `404` not found
- `409` conflict · `422` business rule violation · `429` rate limit · `500` server error
- Never return `200` for errors; never return `500` for client errors

## Response format

- Always `Content-Type: application/json`
- **camelCase** field names
- Dates in ISO 8601: `2024-03-15T10:30:00Z`
- Monetary values as integers (cents) — never float
- Enums as uppercase strings: `"ACTIVE"`, not `1`

## Error shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable, safe to log",
    "details": [{ "field": "email", "message": "Invalid format" }]
  }
}
```

- `code`: `UPPER_SNAKE_CASE` constant
- Never expose stack traces, SQL, internal paths, or credentials in error responses

## Pagination

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 243,
    "totalPages": 13
  }
}
```

- Default `pageSize`: 20, max: 100 — use `?page=1&pageSize=20`

## Security

- Validate and sanitize all inputs before use. In **Elysia**, always define inputs/outputs using the native `t` schemas (e.g., `t.Object`, `t.String({ format: 'uri' })`) on routes to auto-validate and construct correct OpenAPI docs.
- Use our authentication middleware (`isAuthenticated`) to protect API routes.
- Never build queries with string concatenation. Use Drizzle's parameterized query builder.
- Sensitive fields (`password`, `token`, `secret`) never appear in responses or logs.
- Auth tokens and sessions are handled securely by **Better Auth** cookies and headers.

## Backwards compatibility

- Never remove or rename a response field — add new fields, deprecate old ones.
- Never change the type of an existing field.
- Breaking changes require a new API version (`/v2/`).

## Elysia.js & Better Auth Specifics

- **Type safety & schema**: Always define query, params, headers, and body constraints on routes. Elysia infers types automatically from schemas.
- **Route handlers**: Keep handlers lean. Offload complex business logic (e.g. key generation, reachability checking) to services inside `apps/api/src/services/`.
- **OpenAPI auto-generation**: Document descriptions and tags directly in route hooks to ensure the Swagger/OpenAPI spec remains rich and accurate.
