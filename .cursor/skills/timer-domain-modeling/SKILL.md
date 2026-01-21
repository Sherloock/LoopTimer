---
name: timer-domain-modeling
description: Use when changing timer structures (intervals, loops, advanced sequences), types, schemas, or serialization.
---

## Goal
Keep timer modeling consistent across UI, actions, API routes, and Prisma boundaries.

## Checklist
- Define/adjust TypeScript types in `types/*` (and re-use them everywhere).
- Validate at boundaries with Zod (prefer updating `schema/timerSchema.ts` or adjacent schemas).
- Avoid magic values: centralize defaults/labels/thresholds in `lib/constants/*`.
- For finite states, prefer `as const` objects over scattered string unions.

## Edge cases to consider
- Zero/negative durations (reject at boundary).
- Empty sequences (reject or provide safe defaults).
- Loop boundaries (inclusive/exclusive) and off-by-one issues.
- Serialization/deserialization stability (local storage / URL / API payloads).

## Quick references (repo)
- Zod schemas: `schema/timerSchema.ts`
- Shared timer helpers: `lib/timer-utils.ts`, `utils/timer-shared.ts`, `utils/compute-total-time.ts`
- Advanced timer UI: `components/advanced-timer.tsx`
