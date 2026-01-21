---
name: timer-crud
description: Use when adding or modifying timer CRUD (API routes, server actions, Prisma ownership checks, react-query invalidation).
---

## Workflow
- Decide the entrypoint:
  - API route handlers: `app/api/**/route.ts`
  - Server actions: `actions/**`
- Validate inputs at boundaries with Zod (reject early with helpful messages).
- Auth: enforce server-side user identity and ownership checks.
- Prisma: `select` only required fields; use transactions when multiple writes must be atomic.
- Client: wire `@tanstack/react-query` with centralized `QUERY_KEYS`; invalidate minimally and predictably.

## Ownership + auth checklist
- Use `checkAuth()` in server actions: `actions/auth/authCheck.ts`
- For any update/delete, verify the timer belongs to `userId` before mutating.
- Never leak sensitive details in error messages/logs.

## Repo references
- Actions: `actions/timers/*`
- API routes: `app/api/timers/route.ts`, `app/api/timers/[id]/route.ts`
- Prisma client: `prisma/index.ts`
