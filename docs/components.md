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
      timer-editor.tsx        # edit-only: config, persistence, editor panel, dialogs
      advanced/
        advanced-timer-editor-panel.tsx
        dnd/
    player/
      timer-player.tsx        # play-only: run + completion; no editor
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
    - `advanced/`: advanced builder/editor (UI only; tree helpers in `lib/timer-tree/`, id generator in `hooks/timers/use-id-generator.ts`).
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

- **TimerEditor**: `components/timers/editor/timer-editor.tsx`. Edit-only: config management, persistence, settings, editor panel (`AdvancedTimerEditorPanel`), and dialogs (settings, AI, save template, share, unsaved confirm). Used on the edit route. No playback.
- **TimerPlayer**: `components/timers/player/timer-player.tsx`. Play-only: loads timer from `loadedTimer`, runs playback (`useFlattenedIntervals`, `useTimerState`, `useAdvancedTimerPlayback`), shows ready screen → running view → completion. Used on the play route. No editor panel or save dialogs.
