## ship — iteratively fix errors, run tests, and build

Iteratively fix errors, run tests, and build until the project passes all checks. Use when user provides errors or when fixing compilation/build issues.

## Workflow

1. **Receive errors**: User provides errors (compilation, lint, test, or build errors)
2. **Fix errors**: Analyze and fix all provided errors
3. **Run tests**: Execute `npm test` to verify fixes
4. **Build project**: Execute `npm run build` to verify build passes
5. **Iterate**: If errors remain, repeat steps 2-4 until all pass

## Execution order

1. Fix all provided errors in code
2. Run `npm test` (capture output)
3. If tests fail, fix test errors and repeat from step 2
4. Run `npm run build` (capture output)
5. If build fails, fix build errors and repeat from step 2
6. Continue until both tests and build pass

## Error sources to check

- TypeScript compilation errors (`tsc` or Next.js build)
- ESLint errors (`npm run lint`)
- Jest test failures (`npm test`)
- Build errors (`npm run build`)
- Runtime errors (if applicable)

## Best practices

- Fix errors systematically (one type at a time if possible)
- Read linter errors using `read_lints` tool
- Verify fixes by running the appropriate command
- Don't skip steps - always run tests before build
- If errors persist after multiple iterations, ask user for clarification

## Commands reference

- Tests: `npm test`
- Build: `npm run build`
- Lint: `npm run lint` (or `read_lints` tool)
- Format: `npm run format` (if needed)

## Success criteria

- All tests pass (`npm test` exits with code 0)
- Build succeeds (`npm run build` exits with code 0)
- No compilation errors
- No linting errors (or only acceptable warnings)
