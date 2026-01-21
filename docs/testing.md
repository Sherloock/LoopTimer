# Testing

## What we test (layers)

- **Unit tests (pure)**: `lib/`, `utils/` functions (no DOM, no network).
- **Integration tests (server/data)**: Prisma + DB connectivity/CRUD, API routes with mocked auth.
- **Component tests (DOM)**: React components rendering and user interactions (recommended).
- **E2E tests (browser)**: full flows in a real browser (recommended).

## Current test setup

- **Runner**: Jest (`jest.config.js`)
- **Current coverage**: DB integration tests in `prisma/__tests__/db-connection.test.ts`

## Commands

- `npm test`: run Jest tests
- `npm run test:watch`: watch mode
- `npm run test:coverage`: coverage
- `npm run test:e2e:install`: install Playwright browsers
- `npm run test:e2e`: run Playwright tests
- `npm run lint`: lint (must be clean before merging)
- `npm run build`: production build validation

## Recommended additions (to keep refactors safe)

### Unit tests

Target deterministic logic:

- `utils/compute-total-time.ts`
- `lib/timer-utils.ts` (formatting/progress calculations)

### Component tests (recommended)

Add React Testing Library + jsdom environment to verify:

- `components/timers/list/timers-list.tsx`:
  - loading skeleton state
  - empty state
  - error state
- `components/timers/player/timer-display.tsx`:
  - interval type rendering (prepare/work/rest)
  - next interval rendering
- `components/timers/player/running-timer-view.tsx`:
  - keyboard controls (space, arrows, escape)
  - mute toggle
  - fullscreen toggle (mock `document.fullscreenElement` / requests)

### Integration tests

- API routes:
  - `app/api/timers/route.ts`
  - `app/api/timers/[id]/route.ts`
- Server actions:
  - ownership checks (must not allow cross-user access)

### E2E tests (recommended)

Use Playwright to validate user journeys end-to-end:

- open timer list
- create timer
- start timer
- pause/resume
- stop

## Testing conventions

- Don’t swallow errors in tests; assert on the error message and status codes.
- Prefer constants for query keys and event names:
  - `QUERY_KEYS.*` (`lib/constants/query-keys.ts`)
  - `CUSTOM_EVENTS.*` (`lib/constants/custom-events.ts`)
