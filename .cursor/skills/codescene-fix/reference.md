# CodeScene warning reference

## Terms you may see in warnings

- **Hotspot**: File or module that is both complex and changed often; top refactoring target.
- **Code becoming a hotspot**: Not yet a hotspot but climbing quickly; proactive refactor recommended.
- **Complexity trend / steep increase**: Unusual rise in complexity in a short time window.
- **Delivery risk**: Combined technical + social risk (e.g. critical path, many dependents, congestion).
- **Code health**: Aggregate of 25+ factors (brain methods, nesting, DRY, congestion, etc.).
- **Brain method / brain class**: Single unit with too many responsibilities or behaviors.
- **Goal: Planned refactoring / Supervise / Critical code**: Goal-based alerts; apply the corresponding strategy from SKILL.md.

## Parsing tips

- File paths may be repository-relative (e.g. `src/foo/bar.ts` or `app/api/route.ts`).
- Function/method names or line ranges are often included; use them to narrow the fix.
- If the warning mentions “with X other modules” or “coordination”, the fix may span multiple files (reduce coupling, narrow interfaces).

## Fix patterns (short)

- **Extract function**: Take a block of logic → new function with a clear name; call it from the original site.
- **Early return / guard clause**: Replace `if (cond) { lots of code }` with `if (!cond) return;` + straight-line code.
- **Split file/module**: Move a coherent subset of exports to a new file; re-export or import where needed.
- **Parameterize duplication**: Same logic in 2+ places → single function with parameters for the varying parts.
- **Replace deep nesting**: Nested if/else/loop → helper functions or lookup tables/keyed logic.

Use these in line with the warning type → fix strategy table in SKILL.md.
