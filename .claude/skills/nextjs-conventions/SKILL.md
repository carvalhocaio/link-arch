---
name: nextjs-conventions
description: Next.js + React + TypeScript conventions — App Router, Server vs Client Components, typing, accessibility and styling. Auto-loaded when editing .ts/.tsx files.
user-invocable: false
paths:
  - "**/*.tsx"
  - "**/*.ts"
  - "!**/*.test.*"
  - "!**/*.spec.*"
---

Apply these conventions whenever you read or write TypeScript/React files in this project.

## Tooling

- Run `biome check .` and `tsc --noEmit` before considering a file done
- We use **Bun** (`bun`) as our runtime and package manager. Always use `bun` for script running and package installations.

## TypeScript

- `strict: true` is assumed — never use `any`; use `unknown` and narrow explicitly
- All component props typed with `interface` (public contracts) or `type` (unions/aliases)
- Shared types live in `types/` or colocated `*.types.ts`, never inlined in components

## Components

- One component per file; PascalCase filenames (`UserCard.tsx`)
- Hook files use camelCase (`useAuthState.ts`)
- No logic inside JSX — extract to variables or functions before `return`
- No inline object/array literals in JSX props (unnecessary re-renders)

## Server vs Client Components

- **Server Component by default** — do not add `"use client"` unless required
- Add `"use client"` only when you need: `useState`, `useEffect`, browser APIs, event handlers, or client-only context
- Push `"use client"` down to the leaf — never make an entire page client just because one leaf needs it
- Data fetching belongs in Server Components or `lib/`/`services/`

## Data fetching

- Always handle loading, error and empty states — never assume data exists
- Type and normalize API responses at the boundary, not inside the component
- Isolate fetch logic in `lib/` or `services/`, not inside the component body

## Hooks

- Custom hook name always starts with `use`; hooks do not return JSX
- Extract reusable logic — not to hide complexity
- Avoid `useMemo`/`useCallback` speculatively — only after profiling

## Styling

- We use **Tailwind CSS v4** for styling. No inline `style={{}}` when Tailwind classes are available.
- Responsive classes follow mobile-first: `text-sm md:text-base lg:text-lg`.
- Leverage dynamic Tailwind classes combinations with the `cn` utility function.

## Accessibility

- Use semantic HTML before ARIA (`<button>` not `<div onClick>`)
- Every `<img>` has meaningful `alt` (or `alt=""` if decorative)
- Form inputs always have an associated `<label>`
- Interactive elements are keyboard-navigable with visible focus styles
