# TypeScript rules

- Use strict TypeScript; prefer `unknown` over `any` and narrow with type guards.
- Define interfaces for complex objects; prefer `interface` over `type` for object shapes.
- Use Zod (or similar) for runtime validation at API/form boundaries.
- Prefer `as const` or enums for finite string unions.
