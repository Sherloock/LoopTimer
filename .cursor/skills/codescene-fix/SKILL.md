---
name: codescene-fix
description: Interprets CodeScene behavioral code analysis warnings and produces concrete code fixes. Use when the user provides a CodeScene warning, hotspot alert, complexity increase, delivery risk, or code health finding.
---

# CodeScene warning → fix

## What CodeScene is

CodeScene is **behavioral code analysis**: it combines complexity, change frequency, and social/organizational data (who changes what, coordination) to find maintenance risks. Warnings are contextual to the codebase and typically cite files, functions, or modules.

Common warning categories:

- **Hotspot / code becoming a hotspot**: High complexity + high change frequency; refactor into smaller, cohesive units.
- **Steep complexity increase**: Unusual complexity growth in a short period; simplify and add tests.
- **Delivery risk**: Risk profile from evolution + change patterns; address underlying code health.
- **Code health factors**: Brain methods/classes, nested complexity, DRY violations, developer congestion.

## Workflow when user provides a CodeScene warning

1. **Parse the warning**
   - Identify: warning type (hotspot, complexity, delivery risk, code health), affected file(s)/function(s)/module(s), and any metrics (e.g. complexity score, “code becoming hotspot”).
   - If the user pastes raw text, extract file paths, symbols, and the exact finding.

2. **Locate the code**
   - Open the reported file(s) and the specific function(s) or regions mentioned.
   - If multiple files are listed (e.g. coordination/coupling), open all relevant ones.

3. **Choose fix strategy** (see table below), then implement.
   - Prefer small, focused changes: extract functions, reduce nesting, remove duplication, split large modules.
   - Preserve behavior; do not change APIs or semantics unless the warning explicitly calls for it.
   - After editing, re-check: complexity and size should move in the right direction.

4. **Respond to the user**
   - State the warning in one line, the strategy chosen, and what was changed (files + brief summary).
   - If a fix would be too large, propose a minimal first step and list follow-ups.

## Warning type → fix strategy

| Warning / factor                    | Fix direction                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Hotspot / becoming hotspot**      | Break into smaller modules or functions; reduce single-file responsibility; lower coupling so fewer files change together.      |
| **Steep complexity increase**       | Reduce cyclomatic complexity: extract helpers, replace nested conditionals with early returns or lookup tables, simplify loops. |
| **Brain method / brain class**      | Split by responsibility: one function/class per concern; move unrelated logic to separate modules.                              |
| **Nested complexity**               | Flatten: guard clauses and early returns; extract nested blocks into named functions; avoid deep if/else/loop nesting.          |
| **DRY violations**                  | Extract shared logic into a single function or module; parameterize differences; ensure call sites use the abstraction.         |
| **Developer congestion**            | Reduce coordination surface: narrow interfaces, split large shared modules so teams touch fewer of the same files.              |
| **Delivery risk (generic)**         | Improve code health in the reported area using the factors above; add or tighten tests for the changed paths.                   |
| **Planned refactoring / Supervise** | Apply the planned refactor (e.g. extract module, simplify conditionals); avoid new complexity in that area.                     |
| **Critical code**                   | Minimize changes; if changing, add tests and keep edits small and reviewable.                                                   |

## Rules

- **Do not** invent warnings: work only from what the user provided (pasted message, screenshot description, or explicit “CodeScene says X”).
- **Do not** change behavior or contracts unless the warning explicitly requires it.
- Prefer **local, incremental fixes** over big rewrites unless the user asks for a larger refactor.
- If the codebase has project rules (e.g. no style constants, specific patterns), follow them when applying fixes.

## Optional reference

For more detail on mapping specific CodeScene terms to refactors, see [reference.md](reference.md).
