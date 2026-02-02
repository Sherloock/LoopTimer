# Workout Timer

[![License: All Rights Reserved](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

A modern, full-stack workout timer application with AI-powered workout generation, drag-and-drop timer builder, and real-time playback. Built with Next.js 15, TypeScript, PostgreSQL, and deployed on Vercel.

🚀 **[Live Demo](https://loop-timer.vercel.app)**
Perfect for interval training, HIIT workouts, Tabata, boxing rounds, yoga flows, and custom timing needs.

## 📸 Screenshots

_Screenshots coming soon - showcasing timer editor, player, AI generation, and template library_

## ✨ Features

### Custom Intervals

Create precise work and rest intervals tailored to your specific workout needs. Build complex timing sequences with drag-and-drop interface, nested loops, and rest periods. Perfect for interval training, HIIT workouts, Tabata, boxing rounds, yoga flows, and custom timing requirements.

### Loop Control

Set up complex workout routines with multiple loops and rounds for advanced training. Design intricate sequences with nested loops, interval groups, and customizable rest periods between rounds. Ideal for progressive training programs and multi-phase workouts.

### Easy to Use

Intuitive interface that gets out of your way so you can focus on your workout. Clean, modern design with drag-and-drop timer builder, keyboard shortcuts (Space for play/pause, Arrow keys for navigation, Escape to stop), and visual progress indicators. Mobile-first responsive design optimized for desktop, tablet, and mobile devices.

### Precision Timing

Accurate to the second timing ensures you get the most out of every workout session. Real-time playback with visual progress bars, countdown display, interval indicators, and audio/visual cues. Wake Lock API keeps your screen on during workouts, and keyboard controls provide full timer management.

### Progress Tracking

Monitor your workout patterns and stay consistent with your fitness goals. Cloud sync with PostgreSQL database ensures your timers are saved and accessible across devices. Track your workout history, save favorite routines, and build a library of personalized timers.

### Community Driven

Built by fitness enthusiasts for fitness enthusiasts with continuous improvements. Features include:

- **AI-Powered Workout Generation**: Natural language prompts generate complete workout routines (powered by Groq)
- **Template Library**: Pre-built workouts (Tabata, HIIT, Boxing, Yoga, Pomodoro) that you can clone and customize
- **Export/Import**: JSON export, QR code sharing, and shareable links for easy workout sharing
- **User Authentication**: Secure auth with Clerk (Google, GitHub, email) for personalized experience
- **Real-Time Updates**: React Query for optimistic updates and seamless cache management
- **Type-Safe**: Strict TypeScript throughout with Zod validation at boundaries

### Additional Features

- **Dark/Light Mode**: System-aware theme with smooth transitions
- **PWA Support**: Install as standalone app with offline capability
- **Accessibility**: WCAG-compliant, keyboard navigation, screen reader friendly
- **Audio & Visual Cues**: Sound effects, text-to-speech announcements, color-coded states

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Language**: TypeScript 5.8 (strict mode)
- **Styling**: Tailwind CSS with custom design system
- **UI Library**: Radix UI primitives + shadcn/ui components
- **Animations**: Tailwind CSS animations, Framer Motion patterns
- **Icons**: Lucide React
- **State Management**: React hooks, React Query for server state
- **Drag & Drop**: @dnd-kit (sortable, sensors, utilities)

### Backend

- **Database**: PostgreSQL (local: Docker, production: Neon)
- **ORM**: Prisma (type-safe queries, migrations, seeding)
- **Authentication**: Clerk (OAuth, magic links, session management)
- **API Layer**: Next.js API routes + Server Actions
- **AI Integration**: Groq SDK (Llama 3.3 70B for workout generation)

### DevOps & Tooling

- **Deployment**: Vercel (automatic previews, edge functions)
- **Testing**: Jest (unit/integration), Playwright (E2E), React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Version Control**: Git with conventional commits
- **CI/CD**: Vercel build checks, automated migrations

## 🏗️ Architecture

```mermaid
flowchart TD
    Client[Client Components] --> Hooks[React Query Hooks]
    Hooks --> API[API Routes]
    API --> Actions[Server Actions]
    Actions --> Auth[Clerk Auth Check]
    Actions --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL)]

    Client --> SC[Server Components]
    SC --> Actions

    AI[AI Prompt] --> AIRoute[AI API Route]
    AIRoute --> Groq[Groq API]
    Groq --> Validate[Zod Validation]
    Validate --> Actions
```

**Data Flow:**

1. **UI Layer** (`components/`) renders client/server components
2. **Hooks Layer** (`hooks/`) manages React Query state and mutations
3. **API Layer** (`app/api/`) thin controllers calling server actions
4. **Business Logic** (`actions/`) auth checks, validation, Prisma calls
5. **Database** (PostgreSQL via Prisma) stores timers, templates, shared links

**Key Patterns:**

- **Server Actions** for mutations (create, update, delete)
- **React Query** for client-side caching and optimistic updates
- **Zod Schemas** for runtime validation at API boundaries
- **Clerk Middleware** for route protection and session management

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Docker Desktop (recommended for local PostgreSQL via `docker compose`)

## 🛠️ Installation

1. **Clone or download the project**

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start local PostgreSQL (Docker)**:

   ```bash
   docker compose up -d
   ```

4. **Configure environment variables**:

   Copy `env.example` to `.env` and adjust if needed:

   ```bash
   cp env.example .env
   ```

5. **Apply Prisma migrations (local)**:

   ```bash
   npm run prisma:migrate
   ```

6. **Start the development server**:

   ```bash
   npm run dev
   ```

7. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

> **📖 Detailed Documentation**: See [package.json.scripts.md](package.json.scripts.md) for comprehensive documentation of all scripts, including what they do, when to use them, and troubleshooting tips.

### Development

- `npm run dev` - Start dev server (auto-starts Docker DB + Next.js)
- `npm run dev:turbo` - Start dev server with Turbopack (experimental)
- `npm run dev:db` - Start local PostgreSQL (Docker)
- `npm run npmi:clean` - Clean install (removes node_modules and package-lock.json)

### Build & Production

- `npm run build` - Build for production (includes Prisma generate + format)
- `npm run start` - Start production server
- `npm run vercel-build` - Vercel build command (runs migrations + seed + build)

### Testing

- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:db` - Test database connection

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run remove-unused` - Remove unused imports

### Database - Prisma (Development)

- `npm run db:migrate` - Create + apply migrations (local dev)
- `npm run db:migrate:create` - Create migration file without applying
- `npm run db:migrate:reset` - **DESTRUCTIVE** - Drop DB and re-run all migrations
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to DB without migrations
- `npm run db:pull` - Pull schema from DB to prisma/schema.prisma
- `npm run db:studio` - Open Prisma Studio (DB GUI)
- `npm run db:validate` - Validate Prisma schema
- `npm run db:format` - Format Prisma schema file

### Database - Migrations (Production)

- `npm run db:migrate:deploy` - Apply pending migrations (safe for prod)
- `npm run db:migrate:deploy:prod` - Deploy migrations with .env.prod (Windows-safe)

### Database - Seeding

- `npm run db:seed` - Seed database with `.env`
- `npm run db:seed:local` - Seed with `.env.local`
- `npm run db:seed:dev` - Seed with `.env.development.local`
- `npm run db:seed:prod` - Seed with `.env.prod`

### Database - Docker (Local PostgreSQL)

- `npm run db:up` - Start PostgreSQL container
- `npm run db:down` - Stop and remove containers
- `npm run db:ps` - List running containers
- `npm run db:start` - Start existing timer-postgres container
- `npm run db:stop` - Stop timer-postgres container
- `npm run db:logs` - View PostgreSQL logs
- `npm run db:restart` - Restart timer-postgres container

### Vercel Deployment

- `npm run deploy` - Deploy to production
- `npm run vercel:deploy` - Deploy preview
- `npm run vercel:deploy:prod` - Deploy to production
- `npm run vercel:env:pull` - Pull environment variables to .env.local
- `npm run vercel:env:pull:prod` - Pull production env vars to .env.prod
- `npm run vercel:logs` - View deployment logs
- `npm run vercel:inspect` - Inspect deployment details

## 🔐 Environment Variables

### Required Variables

#### Database (Neon PostgreSQL)

- **`DATABASE_URL`** - Neon **pooled** connection string (for app runtime queries)
  - Format: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`
  - Used by: Prisma Client at runtime
  - Connection pooling enabled for concurrent requests

- **`DIRECT_URL`** - Neon **direct** connection string (for migrations)
  - Format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`
  - Used by: Prisma Migrate, schema introspection
  - Direct connection required for exclusive schema locks

#### Authentication (Clerk)

- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** - Clerk publishable key (public)
- **`CLERK_SECRET_KEY`** - Clerk secret key (private)
- **`CLERK_WEBHOOK_SECRET`** - Clerk webhook signing secret

#### AI (Groq)

- **`GROQ_API_KEY`** - Groq API key for AI workout generation

### Environment Files

- **`.env`** - Local development (Docker PostgreSQL)
- **`.env.local`** - Local development with Neon (preview)
- **`.env.prod`** - Local production testing (never commit!)
- **`env.example`** - Template with variable names (commit this)

### Setup Instructions

1. **Local Development** (Docker PostgreSQL):

   ```bash
   cp env.example .env
   # Uses Docker PostgreSQL (auto-started with `npm run dev`)
   ```

2. **Pull Vercel Secrets** (for testing with prod DB):

   ```bash
   npm run vercel:env:pull:prod
   # Downloads all env vars from Vercel to .env.prod
   ```

3. **Add Secrets to Vercel**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add `DATABASE_URL`, `DIRECT_URL`, `CLERK_*`, `GROQ_API_KEY`
   - Or use: `npm run vercel:env:add`

### Security Notes

- `.gitignore` excludes all `.env*` files except `env.example`
- Never commit actual secrets to git
- Rotate keys if accidentally exposed
- Use Vercel's encrypted storage for production secrets

## 🗄️ Database (PostgreSQL + Prisma)

### Local Development (Docker)

Start PostgreSQL:

```bash
npm run dev:db
# or manually:
docker compose up -d
```

Apply migrations:

```bash
npm run db:migrate
```

Seed database:

```bash
npm run db:seed
```

Stop database:

```bash
npm run db:down
```

### Production (Neon + Vercel)

1. **Create Neon Database**:
   - Go to [Neon Console](https://console.neon.tech)
   - Create new project → Get connection strings
   - Copy **pooled** connection → `DATABASE_URL`
   - Copy **direct** connection → `DIRECT_URL`

2. **Configure Vercel**:
   - Add environment variables in Vercel dashboard
   - Ensure both URLs include `?sslmode=require`

3. **Deploy**:

   ```bash
   npm run deploy
   ```

   - Vercel runs `vercel-build` script
   - Automatically applies migrations via `prisma migrate deploy`
   - Seeds database with default templates

### Migration Workflow

#### Development (Local)

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run db:migrate
# 3. Name your migration (e.g., "add_user_preferences")
# 4. Commit migration files
git add prisma/migrations
git commit -m "feat: add user preferences table"
```

#### Production (Vercel)

```bash
# Automatically runs on deploy:
# - prisma migrate deploy (applies pending migrations)
# - prisma db seed (seeds templates)
# - next build (builds app)
```

### Database Commands Reference

See [Available Scripts](#-available-scripts) for full list of `db:*` commands.

## 🎯 Usage

### Interval Workout Timer

1. **Configure Settings**: Set work time, rest time, and number of rounds
2. **Start Timer**: Click the start button to begin your workout
3. **Follow Visual Cues**:
   - "WORK" badge indicates active work period
   - "REST" badge indicates rest period
   - Progress bar shows time remaining
   - Timer flashes red in final 5 seconds

### Custom Timer

1. **Set Duration**: Configure the timer for any number of seconds
2. **Start/Pause/Stop**: Full control over timer state
3. **Visual Progress**: Progress bar and large timer display

### Controls

- **Play**: Start or resume the timer
- **Pause**: Pause the current timer
- **Stop**: Stop and reset to initial state
- **Reset**: Reset timer to configured settings

## 🎨 Customization

### Theme Colors

Modify CSS variables in `app/globals.css` to customize the color scheme:

```css
:root {
	--primary: 221.2 83.2% 53.3%;
	--secondary: 210 40% 96%;
	/* ... other variables */
}
```

### Timer Durations

Default advanced timer configuration lives in `components/advanced-timer.tsx` (public import path: `components/timers/editor/advanced/advanced-timer.tsx`).

```typescript
// See: components/advanced-timer.tsx
```

## 📚 Documentation

- `docs/project-map.md` - what is where
- `docs/components.md` - component taxonomy and rules
- `docs/data-flow.md` - UI -> hooks -> API -> actions -> Prisma
- `docs/testing.md` - test layers and commands

## 🏗️ Project Structure

```
workout-timer/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Design system primitives (shadcn)
│   ├── providers/        # App-wide providers and client-only helpers
│   ├── layout/           # Cross-route layout components
│   ├── debug/            # Hydration/debug helpers
│   ├── clock/            # Clock feature components
│   └── timers/           # Timer feature (list/editor/player)
├── actions/              # Server actions (DB + business logic)
├── hooks/                # Client hooks (React Query, timer state)
├── lib/                  # Cross-cutting utilities + constants
├── prisma/               # Prisma schema, migrations, DB utilities/tests
└── Configuration files...
```

## 🎯 Project Goals

This project was built as a **closed-source portfolio piece** to demonstrate:

- **Full-stack development**: Frontend, backend, database, auth, AI integration
- **Modern React patterns**: Server Components, Server Actions, React Query
- **Type safety**: TypeScript strict mode, Zod validation, Prisma type generation
- **Production-ready code**: Testing, error handling, performance optimization
- **DevOps practices**: CI/CD, migrations, Docker, environment management
- **UX/UI design**: Responsive, accessible, keyboard navigation, dark mode

## 🤝 Contributing

This is a **proprietary portfolio project** and is not open for public contributions. The code is shared publicly for educational and demonstration purposes only.

If you have suggestions or found a bug, please open an issue for discussion. Any contributions would require explicit permission and a contributor agreement.

**For Inspiration/Learning:**

- Feel free to review the code to learn architectural patterns
- Use the concepts as inspiration for your own projects
- Do NOT copy or fork this project for your own portfolio without permission

## 📄 License

Copyright © 2025 Bálint Deák. All Rights Reserved.

This project is proprietary software. The source code is publicly viewable for educational and portfolio purposes, but **all rights are reserved**. You may NOT use, copy, modify, or distribute this code without explicit written permission from the copyright holder.

For licensing inquiries or permission requests, please contact the author.

See the [LICENSE](LICENSE) file for full details.

## 👤 Author

**Bálint Deák** (Deák, Bálint)

- Location: Budapest, Hungary
- Role: Full Stack Developer

Note: This is a proprietary project. See the [License](#-license) section for usage restrictions.

## 🔧 Development Notes

- Built with modern React patterns and hooks
- Fully typed with TypeScript
- Follows accessibility best practices
- Optimized for performance with proper cleanup
- Mobile-first responsive design

## 🐛 Bug Reports

If you find a bug, please create an issue with:

- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser and device information
