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

## 🛠️ Installation

1. **Clone or download the project**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

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

Default configurations can be modified in `components/workout-timer.tsx`:

```typescript
const [config, setConfig] = useState<TimerConfig>({
  workoutTime: 45,  // seconds
  restTime: 15,     // seconds
  rounds: 8,        // number of rounds
  customTime: 300,  // seconds
});
```

## 🏗️ Project Structure

```
workout-timer/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── header.tsx        # Header with theme toggle
│   ├── workout-timer.tsx # Main timer component
│   ├── theme-provider.tsx
│   └── query-provider.tsx
├── lib/                  # Utility functions
│   └── utils.ts          # Class name utilities
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