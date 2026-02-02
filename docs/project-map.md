# Project map (TIMER)

## Quick orientation

- **Runtime**: Next.js App Router (`app/`)
- **UI**: Tailwind + shadcn (`components/ui/`)
- **Data**: React Query hooks (`hooks/`) -> API routes (`app/api/`) -> server actions (`actions/`) -> Prisma (`prisma/`)
- **Auth**: Clerk (`middleware.ts`, `lib/clerk.ts`, `actions/auth/*`)
- **DB**: PostgreSQL via Prisma (`prisma/schema.prisma`)

## Folder-by-folder

### `app/`

- **What**: Next.js routes, layouts, and route-level UI composition.
- **Key files**:
  - `app/layout.tsx`: global providers (Clerk, theme, query) + global UI (toasts).
  - `app/page.tsx`: landing page.
  - `app/app/*`: “in-app” routes (menu, timer list/edit/play).
  - `app/api/*`: API routes that call server actions.

### `components/`

Feature-first component tree. See `docs/components.md` for the taxonomy and rules.

### `components/ui/`

- **What**: design system primitives (shadcn / Radix wrappers).
- **Rule**: only generic, reusable UI; no feature logic.

### `actions/`

- **What**: server actions (`\"use server\"`) for DB operations and business logic.
- **Rule**: auth/ownership checks happen here (via `actions/auth/authCheck.ts`).

### `hooks/`

- **What**: client hooks (React Query hooks, state hooks).
- **Key files**:
  - `hooks/use-timers.ts`: React Query CRUD for `/api/timers`.
  - `hooks/use-timer-state.ts`: shared timer playback state helpers.
  - `hooks/timers/use-flattened-intervals.ts`: flattened playback order from workout items.
  - `hooks/timers/use-advanced-timer-playback.ts`: advanced timer countdown, completion, beep, speak, auto-start.

### `lib/`

- **What**: app and feature infrastructure (constants, navigation, feature modules, UI-coupled helpers).
- **Rule**: No standalone pure domain/tree logic files here that belong in `utils/` or `types/`; tree logic lives under `lib/timer-tree/`.
- **Key folders**:
  - `lib/constants/*`: centralized constants (routes, query keys, event names, UI text).
  - `lib/navigation.ts`: navigation helpers (`useNavigation()`).
  - `lib/timer-utils.ts`: timer state, toasts, progress; re-exports time formatters from `utils/format-time`.
  - `lib/timer-tree/`: tree helpers (`tree-helpers.ts`), tree operations (`tree-operations.ts`), flatten for playback.
  - `lib/sound-utils.ts`: sound + TTS utilities.

### `schema/`

- **What**: Zod schemas for validating inputs at API/form boundaries only.

### `types/`

- **What**: domain types and type-related pieces only — interfaces for the timer domain, domain const enums (e.g. `TIMER_TYPES`), type guards (e.g. `isLoop`, `isInterval`), and ambient declarations (`*.d.ts`). No business logic, no React, no Zod.

### `utils/`

- **What**: pure, framework-agnostic helpers. No React, no Node-only APIs, no app-specific imports from `lib/` or `app/`. Examples: `compute-total-time`, `format-time`, `time-input`.

### `prisma/`

- **What**: Prisma schema, migrations, DB helpers, and DB tests.

## “Where do I put X?”

- **New route/page**: `app/.../page.tsx`
- **Feature component**: `components/<feature>/...`
- **Reusable UI primitive**: `components/ui/...`
- **Client data hook**: `hooks/...` (prefer React Query for server data)
- **Server-side business logic**: `actions/...`
- **API boundary**: `app/api/.../route.ts` (thin controller, call actions)
- **Constants**: `lib/constants/...`
- **Pure logic utilities**: `utils/...` (pure functions with no app/lib deps). App/feature glue and UI-coupled helpers: `lib/...`
- **Domain types / type guards**: `types/...`
- **Validation schemas**: `schema/...`

**Rule**: Components are UI only. Pure domain or tree logic belongs in `lib/` or `utils/`, not as standalone `.ts` files under `components/`.
