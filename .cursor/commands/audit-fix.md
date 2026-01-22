## audit-fix — iteratively fix npm vulnerabilities with non-breaking updates

Iteratively run `npm audit`, apply non-breaking fixes, and validate with `npm run build` until vulnerabilities are resolved or no more fixes are available.

## Workflow

1. **Run audit**: Execute `npm audit` to identify vulnerabilities
2. **Apply fixes**: Run `npm audit fix` to apply non-breaking updates
3. **Validate build**: Execute `npm run build` to ensure fixes don't break the project
4. **Iterate**: If vulnerabilities remain and build passes, repeat steps 1-3
5. **Stop conditions**: Stop when either:
   - No vulnerabilities remain (`npm audit` exits with code 0)
   - Build fails (requires manual intervention)
   - No more fixes available (audit fix reports no changes)

## Execution order

1. Run `npm audit` (capture output and exit code)
2. If vulnerabilities found (exit code != 0):
   - Run `npm audit fix` (capture output)
   - Run `npm run build` (capture output)
   - If build fails, report error and stop (manual fix required)
   - If build succeeds, repeat from step 1
3. If no vulnerabilities (exit code == 0), report success and stop

## Commands reference

- Audit: `npm audit`
- Fix: `npm audit fix` (only applies non-breaking updates)
- Build: `npm run build`
- Alternative: `npm audit fix --force` (NOT recommended - may introduce breaking changes)

## Best practices

- Always validate with `npm run build` after each fix iteration
- Only use `npm audit fix` (not `--force`) to ensure non-breaking updates
- If build fails after a fix, stop and report - manual intervention required
- Track iteration count to avoid infinite loops (max 10 iterations recommended)
- If vulnerabilities persist after multiple iterations, they may require manual updates

## Success criteria

- `npm audit` exits with code 0 (no vulnerabilities)
- `npm run build` passes after all fixes
- All dependencies updated to secure, non-breaking versions

## Notes

- `npm audit fix` only updates packages within their semver ranges (non-breaking)
- Breaking changes require manual `package.json` updates
- Some vulnerabilities may require dependency replacements or removals
