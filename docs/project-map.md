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

### `lib/`

- **What**: cross-cutting utilities and app infrastructure.
- **Key folders**:
  - `lib/constants/*`: centralized constants (routes, query keys, event names, UI text).
  - `lib/navigation.ts`: navigation helpers (`useNavigation()`).
  - `lib/timer-utils.ts`: timer time/progress helpers + toasts.
  - `lib/sound-utils.ts`: sound + TTS utilities.

### `schema/`

- **What**: Zod schemas for validating inputs at boundaries.

### `types/`

- **What**: domain model types (advanced timer structures etc).

### `utils/`

- **What**: pure utilities (e.g. computing total time, timer shared helpers).

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
- **Pure logic utilities**: `lib/...` or `utils/...` (prefer `utils/` for pure functions)
