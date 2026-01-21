# Workout Timer

A modern, responsive workout timer application built with Next.js 15, TypeScript, and Tailwind CSS. Perfect for interval training, HIIT workouts, and custom timing needs.

## ✨ Features

- **Interval Workout Timer**: Configurable work/rest periods with multiple rounds
- **Custom Timer**: Set any duration for general timing needs
- **Visual Feedback**: Progress bars, visual indicators, and color-coded states
- **Audio Alerts**: Toast notifications for timer state changes
- **Dark/Light Mode**: System-aware theme switching
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: Keyboard navigation and screen reader friendly

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Theme**: next-themes
- **State Management**: React hooks

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

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run prisma:migrate` - Apply migrations to your local DB (development)
- `npm run prisma:studio` - Open Prisma Studio

## 🗄️ Database (PostgreSQL + Prisma)

### Local (Docker)

- Start DB:

```bash
docker compose up -d
```

- Stop DB:

```bash
docker compose down
```

### Production (Neon + Vercel)

- Set the following environment variables in Vercel:
  - `DATABASE_URL`: Neon **pooled** Postgres connection string
  - `DIRECT_URL`: Neon **direct/non-pooled** Postgres connection string (used for migrations)
- Ensure both URLs include `sslmode=require`.
- Deploys run migrations via `prisma migrate deploy` during the Vercel build step (`vercel.json`).

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/new-feature`
3. Commit changes: `git commit -m "feat: add new feature"`
4. Push to branch: `git push origin feat/new-feature`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

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
