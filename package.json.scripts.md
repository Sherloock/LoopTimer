# Package.json Scripts Documentation

This document explains every npm script defined in `package.json`. Keep this file in sync with actual scripts.

## 📑 Table of Contents

- [Development](#development)
- [Build & Production](#build--production)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Database - Prisma (Development)](#database---prisma-development)
- [Database - Migrations (Production)](#database---migrations-production)
- [Database - Seeding](#database---seeding)
- [Database - Docker](#database---docker)
- [Database - Aliases](#database---aliases)
- [Vercel Deployment](#vercel-deployment)
- [Deployment Aliases](#deployment-aliases)

---

## Development

### `postinstall`

```bash
npm run postinstall
# or automatically runs after: npm install
```

**What it does**: Generates Prisma Client from `prisma/schema.prisma`

**When to use**: Automatically runs after `npm install`. Ensures Prisma Client is always up-to-date.

**Important**: Required for TypeScript to recognize Prisma types.

---

### `nvm-use`

```bash
npm run nvm-use
```

**What it does**: Switches to Node.js version 20 using nvm

**When to use**: Manually when you need to ensure correct Node version

**Note**: Only works if you have [nvm](https://github.com/nvm-sh/nvm) installed

---

### `npmi:clean`

```bash
npm run npmi:clean
```

**What it does**: Deletes `node_modules` and `package-lock.json`, then runs fresh install

**When to use**:

- After dependency conflicts
- When node_modules is corrupted
- After major package updates
- When weird errors appear that seem dependency-related

**Warning**: Takes longer than regular install

---

### `dev`

```bash
npm run dev
```

**What it does**:

1. Switches to Node 20 (`nvm use 20`)
2. Starts Docker PostgreSQL (`docker compose up -d db`)
3. Starts Next.js dev server (`next dev`)

**When to use**: Primary command for local development

**URL**: [http://localhost:3000](http://localhost:3000)

**Requirements**:

- Docker Desktop running (for PostgreSQL)
- nvm installed (for Node version switching)

---

### `dev:turbo`

```bash
npm run dev:turbo
```

**What it does**: Same as `dev` but uses Turbopack bundler (experimental Next.js feature)

**When to use**:

- Faster cold starts (experimental)
- Testing Turbopack compatibility

**Note**: Turbopack is still in beta, may have edge cases

---

### `dev:db`

```bash
npm run dev:db
```

**What it does**: Starts local PostgreSQL container in Docker

**When to use**:

- If you stopped the database manually
- If `npm run dev` fails to start database

**Equivalent to**: `docker compose up -d db`

**Container name**: `timer-postgres`

---

## Build & Production

### `build`

```bash
npm run build
```

**What it does**:

1. Generates Prisma Client
2. Formats code with Prettier
3. Builds Next.js production bundle

**When to use**:

- Before deploying manually
- Testing production build locally
- CI/CD pipelines

**Output**: `.next/` directory with optimized build

---

### `vercel-build`

```bash
npm run vercel-build
```

**What it does**:

1. Applies pending Prisma migrations (`prisma migrate deploy`)
2. Seeds database with templates (`prisma db seed`)
3. Builds Next.js app

**When to use**: Automatically used by Vercel during deployment

**Important**: This is the production build command referenced in `vercel.json`

**Safety**: Uses `migrate deploy` (safe for prod), not `migrate dev`

---

### `start`

```bash
npm run start
```

**What it does**: Starts Next.js production server

**When to use**: After running `npm run build` to test production locally

**Prerequisites**: Must run `npm run build` first

**URL**: [http://localhost:3000](http://localhost:3000)

---

## Testing

### `test`

```bash
npm test
# or
npm run test
```

**What it does**: Runs all Jest unit and integration tests

**When to use**:

- Before committing code
- During development to verify logic
- In CI/CD pipelines

**Test files**: `**/*.test.ts`, `**/*.test.tsx`

---

### `test:watch`

```bash
npm run test:watch
```

**What it does**: Runs Jest in watch mode, re-runs tests on file changes

**When to use**: During active development with TDD workflow

**Tip**: Press `p` to filter by filename, `t` to filter by test name

---

### `test:coverage`

```bash
npm run test:coverage
```

**What it does**: Runs tests and generates coverage report

**When to use**:

- Before major releases
- To identify untested code
- In CI/CD for coverage tracking

**Output**: `coverage/` directory with HTML report

---

### `test:e2e`

```bash
npm run test:e2e
```

**What it does**: Runs Playwright end-to-end tests in headless mode

**When to use**:

- Before deploying
- To test full user flows
- In CI/CD pipelines

**Test files**: `e2e/**/*.spec.ts`

**Prerequisites**: Dev server must be running (`npm run dev`)

---

### `test:e2e:ui`

```bash
npm run test:e2e:ui
```

**What it does**: Opens Playwright UI for interactive E2E test debugging

**When to use**:

- Debugging failing E2E tests
- Writing new E2E tests
- Inspecting test traces

**Features**: Step through tests, view screenshots, network requests

---

### `test:e2e:install`

```bash
npm run test:e2e:install
```

**What it does**: Installs Playwright browsers (Chromium, Firefox, WebKit)

**When to use**:

- First time setting up project
- After Playwright version updates
- If browsers are missing

---

### `test:db`

```bash
npm run test:db
```

**What it does**: Runs database connection tests only

**When to use**:

- Verifying database is accessible
- Testing Prisma configuration
- Debugging connection issues

**Test file**: `prisma/__tests__/db-connection.test.ts`

---

## Code Quality

### `lint`

```bash
npm run lint
```

**What it does**: Runs ESLint with Next.js config

**When to use**:

- Before committing
- To check for code quality issues
- In CI/CD pipelines

**Config**: `.eslintrc.json`

---

### `lint:fix`

```bash
npm run lint:fix
```

**What it does**: Runs ESLint and automatically fixes fixable issues

**When to use**:

- After writing code to auto-fix issues
- Before committing
- To clean up formatting issues

**Note**: Some issues may require manual fixes

---

### `lint2`

```bash
npm run lint2
```

**What it does**: Alternative ESLint command with explicit file extensions

**When to use**: If `npm run lint` doesn't catch certain files

**Difference**: Explicitly targets `.js`, `.jsx`, `.ts`, `.tsx` files

---

### `remove-unused`

```bash
npm run remove-unused
```

**What it does**: Removes all unused import statements

**When to use**:

- After refactoring
- Before committing
- To clean up dead code

**Warning**: Only removes unused imports, not unused variables/functions

---

### `format`

```bash
npm run format
```

**What it does**: Formats all files with Prettier

**When to use**:

- Before committing
- After major refactoring
- To ensure consistent code style

**Config**: `.prettierrc` + `prettier-plugin-tailwindcss`

**Affects**: All `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md` files

---

### `format:check`

```bash
npm run format:check
```

**What it does**: Checks if files are formatted without modifying them

**When to use**:

- In CI/CD to enforce formatting
- Before running `format` to see what changes

**Exit code**: Non-zero if files need formatting

---

## Database - Prisma (Development)

### `db:generate`

```bash
npm run db:generate
```

**What it does**: Generates Prisma Client from `prisma/schema.prisma`

**When to use**:

- After modifying `prisma/schema.prisma`
- After pulling schema changes from DB
- When TypeScript can't find Prisma types

**Output**: `node_modules/.prisma/client/`

---

### `db:push`

```bash
npm run db:push
```

**What it does**: Pushes schema changes to database WITHOUT creating migrations

**When to use**:

- Rapid prototyping
- Local experiments
- When you don't want migration files

**Warning**: NOT for production. Use `db:migrate` for tracked changes.

---

### `db:pull`

```bash
npm run db:pull
```

**What it does**: Introspects database and updates `prisma/schema.prisma`

**When to use**:

- After manual database changes
- Reverse-engineering existing database
- Syncing schema with prod database

**Warning**: Overwrites `schema.prisma`

---

### `db:migrate`

```bash
npm run db:migrate
```

**What it does**:

1. Compares `schema.prisma` with current database
2. Creates migration SQL file
3. Applies migration to local database
4. Regenerates Prisma Client

**When to use**: Every time you change `prisma/schema.prisma`

**Workflow**:

```bash
# 1. Edit prisma/schema.prisma
# 2. Run migration
npm run db:migrate
# 3. Enter migration name (e.g., "add_user_table")
# 4. Commit migration files to git
```

**Output**: `prisma/migrations/<timestamp>_<name>/migration.sql`

**Important**: Commit migration files to git!

---

### `db:migrate:create`

```bash
npm run db:migrate:create
```

**What it does**: Creates migration file WITHOUT applying it

**When to use**:

- When you need to manually edit SQL
- For complex migrations (data transformations, custom SQL)
- To review migration before applying

**Next step**: Manually run `prisma migrate dev` to apply

---

### `db:migrate:reset`

```bash
npm run db:migrate:reset
```

**What it does**:

1. **DROPS DATABASE** (deletes all data)
2. Re-creates database
3. Applies all migrations from scratch
4. Runs seed file

**When to use**:

- Local dev when you need clean slate
- After messing up migrations locally
- Testing migration sequence

**⚠️ WARNING**: DESTRUCTIVE - deletes all data. **NEVER run in production!**

---

### `db:validate`

```bash
npm run db:validate
```

**What it does**: Validates `prisma/schema.prisma` syntax and consistency

**When to use**:

- After editing schema
- In CI/CD pipelines
- Before committing schema changes

**Checks**: Syntax errors, relation issues, invalid types

---

### `db:format`

```bash
npm run db:format
```

**What it does**: Auto-formats `prisma/schema.prisma`

**When to use**: After editing schema manually

**Formatting**: Aligns fields, sorts properties, fixes indentation

---

### `db:studio`

```bash
npm run db:studio
```

**What it does**: Opens Prisma Studio (visual database browser)

**When to use**:

- Viewing database records
- Editing data manually
- Debugging data issues

**URL**: [http://localhost:5555](http://localhost:5555)

**Features**: CRUD operations, relations, filters

---

### `db:verify`

```bash
npm run db:verify
```

**What it does**: Runs custom database verification script

**When to use**:

- Checking database connectivity
- Verifying environment variables
- Testing database configuration

**Script**: `scripts/verify-db.mjs`

---

## Database - Migrations (Production)

### `db:migrate:deploy`

```bash
npm run db:migrate:deploy
```

**What it does**: Applies pending migrations to database (production-safe)

**When to use**:

- In production deployments
- In CI/CD pipelines
- When deploying to staging/prod

**Safety**:

- ✅ Only applies existing migrations
- ✅ Does NOT create new migrations
- ✅ Idempotent (safe to run multiple times)
- ✅ Uses transactions

**Requires**: Migrations already created and committed to git

---

### `db:migrate:deploy:prod`

```bash
npm run db:migrate:deploy:prod
```

**What it does**: Same as `db:migrate:deploy` but loads `.env.prod` file

**When to use**:

- Testing production migrations locally
- Deploying to production database manually
- Windows environments (where `DOTENV_CONFIG_PATH=.env.prod` syntax doesn't work)

**Requires**: `.env.prod` file with production `DATABASE_URL` and `DIRECT_URL`

**Script**: Uses `scripts/prisma-with-env.mjs` for cross-platform env loading

---

## Database - Seeding

### `db:seed`

```bash
npm run db:seed
```

**What it does**: Runs `prisma/seed.ts` with `.env` environment

**When to use**:

- After running migrations
- To populate database with initial data
- Testing with sample data

**Seed file**: `prisma/seed.ts`

**Data**: Creates default timer templates (HIIT, Tabata, Boxing, etc.)

---

### `db:seed:local`

```bash
npm run db:seed:local
```

**What it does**: Runs seed script with `.env.local` environment

**When to use**: Seeding local database with custom env config

---

### `db:seed:dev`

```bash
npm run db:seed:dev
```

**What it does**: Runs seed script with `.env.development.local` environment

**When to use**: Seeding development environment database

---

### `db:seed:prod`

```bash
npm run db:seed:prod
```

**What it does**: Runs seed script with `.env.prod` environment

**When to use**:

- Initial production database setup
- Restoring default templates to prod
- Testing seed with prod connection

**⚠️ Caution**: Ensure idempotency in seed script (use `upsert`, not `create`)

---

## Database - Docker

### `db:up`

```bash
npm run db:up
```

**What it does**: Starts PostgreSQL container in Docker

**When to use**:

- Starting database for first time
- After `npm run db:down`
- When Docker Desktop was stopped

**Container**: `timer-postgres` (defined in `docker-compose.yml`)

**Port**: `5432:5432`

---

### `db:down`

```bash
npm run db:down
```

**What it does**: Stops and removes Docker containers

**When to use**:

- Stopping database when not in use
- Freeing up Docker resources
- Before recreating containers

**Warning**: Does NOT delete data (volume persists)

---

### `db:ps`

```bash
npm run db:ps
```

**What it does**: Lists running Docker containers for this project

**When to use**: Checking if database is running

**Output**: Shows container status, ports, names

---

### `db:start`

```bash
npm run db:start
```

**What it does**: Starts existing `timer-postgres` container

**When to use**: After stopping container (not removing it)

**Difference from `db:up`**: Starts existing container, doesn't create new one

---

### `db:stop`

```bash
npm run db:stop
```

**What it does**: Stops `timer-postgres` container without removing it

**When to use**: Temporarily stopping database

**Difference from `db:down`**: Container still exists, can be started with `db:start`

---

### `db:logs`

```bash
npm run db:logs
```

**What it does**: Shows PostgreSQL container logs

**When to use**:

- Debugging database connection issues
- Checking for PostgreSQL errors
- Monitoring database activity

**Tip**: Add `-f` to follow logs in real-time: `docker logs -f timer-postgres`

---

### `db:restart`

```bash
npm run db:restart
```

**What it does**: Restarts PostgreSQL container

**When to use**:

- After configuration changes
- When database becomes unresponsive
- Applying environment variable changes

---

## Database - Aliases

### `prisma:migrate`

```bash
npm run prisma:migrate
```

**What it does**: Alias for `db:migrate`

**When to use**: If you prefer `prisma:*` naming convention

---

### `prisma:studio`

```bash
npm run prisma:studio
```

**What it does**: Alias for `db:studio`

**When to use**: If you prefer `prisma:*` naming convention

---

### `prisma:seed`

```bash
npm run prisma:seed
```

**What it does**: Alias for `db:seed`

**When to use**: If you prefer `prisma:*` naming convention

---

## Vercel Deployment

### `vercel:deploy`

```bash
npm run vercel:deploy
```

**What it does**: Deploys to Vercel preview environment

**When to use**:

- Testing deployment
- Creating preview deployments
- Sharing work-in-progress with team

**Output**: Preview URL (e.g., `https://timer-abc123.vercel.app`)

---

### `vercel:deploy:prod`

```bash
npm run vercel:deploy:prod
```

**What it does**: Deploys to Vercel production environment

**When to use**: Deploying to live production site

**Important**: Always test with preview deployment first!

**URL**: Production URL (e.g., `https://timer.vercel.app`)

---

### `vercel:env:pull`

```bash
npm run vercel:env:pull
```

**What it does**: Downloads environment variables from Vercel to `.env.local`

**When to use**:

- Setting up project on new machine
- Syncing env vars from Vercel
- Getting latest secrets locally

**Output**: `.env.local` file

**Prerequisites**: Must be logged in to Vercel CLI (`vercel login`)

---

### `vercel:env:pull:prod`

```bash
npm run vercel:env:pull:prod
```

**What it does**: Downloads **production** environment variables to `.env.prod`

**When to use**:

- Testing with production database locally
- Debugging production-specific issues
- Running production migrations locally

**⚠️ Security**: Never commit `.env.prod` to git!

---

### `vercel:env:add`

```bash
npm run vercel:env:add
```

**What it does**: Interactive prompt to add environment variable to Vercel

**When to use**:

- Adding new secrets (API keys, DB URLs)
- Updating existing environment variables

**Alternative**: Use Vercel dashboard: Project → Settings → Environment Variables

---

### `vercel:inspect`

```bash
npm run vercel:inspect
```

**What it does**: Shows detailed information about latest deployment

**When to use**:

- Debugging deployment issues
- Checking build logs
- Viewing deployment configuration

---

### `vercel:inspect:prod`

```bash
npm run vercel:inspect:prod
```

**What it does**: Inspects production deployment at `https://timer.vercel.app/`

**When to use**: Checking production deployment details

---

### `vercel:logs`

```bash
npm run vercel:logs
```

**What it does**: Shows runtime logs from Vercel serverless functions

**When to use**:

- Debugging API routes
- Monitoring errors in production
- Checking function execution

**Tip**: Add `--follow` to stream logs in real-time

---

### `vercel:logs:prod`

```bash
npm run vercel:logs:prod
```

**What it does**: Shows logs specifically from production deployment

**When to use**: Debugging production-only issues

---

## Deployment Aliases

### `deploy`

```bash
npm run deploy
```

**What it does**: Alias for `vercel:deploy:prod`

**When to use**: Quick production deployment command

---

### `vercel`

```bash
npm run vercel
```

**What it does**: Alias for `vercel:deploy`

**When to use**: Quick preview deployment

---

### `vercel:prod`

```bash
npm run vercel:prod
```

**What it does**: Alias for `vercel:deploy:prod`

**When to use**: Alternative production deployment command

---

## Common Workflows

### Starting Development

```bash
npm install              # Install dependencies (runs postinstall → prisma generate)
npm run dev              # Start dev server + database
```

### Making Database Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Create and apply migration
npm run db:migrate       # Creates migration + applies it
# 3. Name migration (e.g., "add_user_settings")
# 4. Commit files
git add prisma/migrations
git commit -m "feat: add user settings table"
```

### Running Tests

```bash
npm test                 # Unit tests
npm run test:e2e         # E2E tests (requires dev server running)
npm run test:coverage    # Coverage report
```

### Code Quality Check

```bash
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code
npm run remove-unused    # Remove unused imports
npm test                 # Run tests
```

### Deploying to Production

```bash
# 1. Ensure migrations are committed
git status

# 2. Test locally
npm run build
npm run start

# 3. Deploy
npm run deploy           # Vercel handles migrations + seed
```

### Pulling Production Secrets

```bash
# Download production env vars
npm run vercel:env:pull:prod

# Test with production database
npm run db:migrate:deploy:prod
```

---

## Troubleshooting

### Database Connection Errors

```bash
npm run db:verify        # Check database connectivity
npm run db:logs          # Check PostgreSQL logs
npm run db:restart       # Restart database
```

### Prisma Type Errors

```bash
npm run db:generate      # Regenerate Prisma Client
npm run npmi:clean       # Clean install if persists
```

### Build Errors

```bash
npm run lint:fix         # Fix linting issues
npm run format           # Format code
npm run db:generate      # Ensure Prisma types exist
npm run build            # Rebuild
```

### Migration Conflicts

```bash
# Local dev only - resets database
npm run db:migrate:reset

# Production - create new migration to fix conflicts
npm run db:migrate:create
```

---

## Environment Files Reference

| File                    | Purpose                       | Committed? |
| ----------------------- | ----------------------------- | ---------- |
| `.env`                  | Local dev (Docker PostgreSQL) | ❌ No      |
| `.env.local`            | Local dev (Neon preview)      | ❌ No      |
| `.env.prod`             | Local prod testing            | ❌ No      |
| `env.example`           | Template (no values)          | ✅ Yes     |
| `env.prod.example`      | Prod template (no values)     | ✅ Yes     |
| Vercel Environment Vars | Production secrets            | N/A        |

---

## Security Notes

- **Never commit** `.env`, `.env.local`, or `.env.prod` files
- Use `npm run vercel:env:pull:prod` to get secrets locally
- Rotate keys immediately if accidentally exposed
- Use Vercel dashboard for managing production secrets
- Enable `.gitignore` rules for all env files

---

**Last Updated**: 2025-01-22

**Keep in sync with**: `package.json`, `README.md`, `.cursor/rules/091-documentation-sync.mdc`
