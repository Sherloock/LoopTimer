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
    advanced-timer.tsx        # main advanced timer (edit + play)
    list/
    saved/
    editor/
      advanced/
        advanced-timer-editor-panel.tsx
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
  - `templates/`: template library browser and cards.
  - `editor/`: creating/editing timers.
    - `advanced/`: advanced builder/editor.
      - `dnd/`: drag-and-drop builder pieces + dialogs.
  - `player/`: running timer UI (display, controls, completion, fullscreen).
  - `import/`: import dialog with file/clipboard/QR scan.
  - `share/`: share dialog with QR code generation.

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

- **AdvancedTimer**: canonical path `components/timers/advanced-timer.tsx`. Orchestrates editor + player; uses `useFlattenedIntervals`, `useAdvancedTimerPlayback`, and `AdvancedTimerEditorPanel` (editor/advanced/advanced-timer-editor-panel.tsx). Flatten logic lives in `lib/timer-tree/flatten.ts`; playback state/effects in `hooks/timers/use-advanced-timer-playback.ts`.
