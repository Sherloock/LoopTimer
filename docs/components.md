# Components taxonomy

## Principles
- **Feature-first**: group by domain/feature, not by technical type.
- **Stable imports**: prefer explicit imports (no “kitchen sink” barrels).
- **Separation**:
  - `components/ui/*` = design system primitives only.
  - Feature components live under `components/<feature>/...`.

## Current `components/` layout
```
components/
  ui/                         # shadcn design system primitives
  providers/                  # app-wide providers + client-only utilities
  layout/                     # cross-route layout components
  debug/                      # hydration / error boundary helpers
  clock/                      # clock feature
  timers/                     # timer feature (list/edit/play)
    list/
    saved/
    editor/
      advanced/
        dnd/
    player/
```

## Folder responsibilities

### `components/providers/`
- **Contains**: providers (`*-provider.tsx`), SSR/CSR boundary helpers, client-only wrappers.
- **Examples**: `query-provider.tsx`, `theme-provider.tsx`, `client-only.tsx`.

### `components/layout/`
- **Contains**: layout-level components used across routes.
- **Examples**: `header.tsx`.

### `components/debug/`
- **Contains**: dev/debug tooling, error boundaries, hydration debugging helpers.

### `components/clock/`
- **Contains**: the clock UI.

### `components/timers/`
- **Contains**: everything timers.
- **Sub-features**:
  - `list/`: timer list page UI (`TimersList`).
  - `saved/`: saved timers picker UI (`SavedTimers`).
  - `editor/`: creating/editing timers.
    - `advanced/`: advanced builder/editor.
      - `dnd/`: drag-and-drop builder pieces + dialogs.
  - `player/`: running timer UI (display, controls, completion, fullscreen).

## Naming conventions (enforced by convention + review)
- **Folders**: `kebab-case`, plural for collections (`timers/`, `providers/`).
- **Files**: `kebab-case.tsx`.
- **Exports**: `PascalCase` for React components.
- **Suffixes**:
  - `*-provider.tsx`: providers only.
  - `*-dialog.tsx`: dialog-only components.
  - `*-view.tsx`: full-screen views.

## Import guidance
- Prefer `@/components/timers/...` etc over deep relatives.
- Keep `components/ui/*` dependency direction one-way: feature code can import UI, UI must not import feature code.

## Notes
- `AdvancedTimer` is imported via `components/timers/editor/advanced/advanced-timer.tsx` (public path). The implementation currently lives in `components/advanced-timer.tsx` but depends on modules under `components/timers/editor/advanced/` and is being progressively decomposed.

