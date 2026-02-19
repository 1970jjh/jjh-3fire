# CLAUDE.md — AI Assistant Guide for FireSim 3rd Factory

## Project Overview

**FireSim 3rd Factory** (`firesim-factory3`) is a Korean-language, interactive problem-based learning (PBL) simulation web application. Students work through a 5-step structured problem-solving process in response to a fictional factory fire incident at "우리산업(주) 제3공장" (Woori Industries 3rd Factory). An admin manages sessions, monitors student progress, and controls timers and report submission.

The app is built with **React 19 + TypeScript**, uses **Firebase** (Firestore + Storage) as the backend, **Google Gemini API** for AI-generated infographic reports, and is deployed on **Vercel**.

## Repository Structure

```
jjh-3fire/                          # Git root
├── CLAUDE.md                       # This file
├── .gitignore
├── vercel.json                     # Vercel deployment config (root)
└── firesim-factory3/               # Main application directory
    ├── index.html                  # HTML entry point
    ├── index.tsx                   # React entry point (ReactDOM.createRoot)
    ├── index.css                   # Global styles
    ├── App.tsx                     # Root component — routing and state management
    ├── types.ts                    # All TypeScript type/interface definitions
    ├── constants.tsx               # Step definitions, scenario data, info card image URLs
    ├── firebase.ts                 # Firebase app initialization (Firestore + Storage)
    ├── metadata.json               # App metadata
    ├── package.json                # Dependencies and scripts
    ├── tsconfig.json               # TypeScript configuration
    ├── vite.config.ts              # Vite build configuration
    ├── vercel.json                 # Vercel config (project-level)
    ├── .env.example                # Environment variable template
    ├── components/                 # React UI components
    │   ├── AdminLogin.tsx          # Admin password login
    │   ├── AdminSessionManager.tsx # Session CRUD management
    │   ├── AdminDashboard.tsx      # Admin monitoring dashboard (largest component)
    │   ├── AdminSetup.tsx          # Admin initial setup
    │   ├── StudentLogin.tsx        # Student session join + name/team entry
    │   ├── StudentLayout.tsx       # Main student interface with step navigation
    │   ├── ScenarioIntro.tsx       # Step 0: Scenario briefing with audio effects
    │   ├── StepOneSituation.tsx    # Step 1: Fact finding (3현주의)
    │   ├── StepTwoDefinition.tsx   # Step 2: Gap analysis (As-Is vs To-Be)
    │   ├── StepThreeAnalysis.tsx   # Step 3: Root cause analysis (5 Whys / Fishbone)
    │   ├── StepFourSolution.tsx    # Step 4: Solution planning
    │   ├── StepFiveReport.tsx      # Step 5: Report + AI infographic generation
    │   ├── LearningGuide.tsx       # Learning guide modal
    │   └── InfoCardModal.tsx       # Information card image modal
    ├── services/                   # Business logic / API layer
    │   ├── firestore.ts            # All Firestore CRUD + real-time subscriptions
    │   └── gemini.ts               # Google Gemini AI API client
    └── api/                        # Vercel serverless functions
        └── generate-image.ts       # Gemini image generation endpoint (Node.js runtime)
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.2.3 |
| Language | TypeScript | 5.8.2 |
| Build Tool | Vite | 6.2.0 |
| Database | Firebase Firestore | 12.7.0 |
| File Storage | Firebase Storage | 12.7.0 |
| AI | Google Gemini API (gemini-2.0-flash) | via serverless function |
| Icons | Lucide React | 0.561.0 |
| Charts | Recharts | 3.6.0 |
| Deployment | Vercel | — |
| Styling | Tailwind CSS (CDN) + custom CSS | — |

## Development Commands

All commands run from `firesim-factory3/`:

```bash
cd firesim-factory3
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
```

## Environment Variables

Copy `.env.example` to `.env` in `firesim-factory3/`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

The Vite config injects this as `process.env.GEMINI_API_KEY` and `process.env.API_KEY` at build time.

## Architecture & Key Patterns

### Application Flow

The app uses a simple state-machine routing pattern in `App.tsx` via `AppMode`:

```
SELECT_ROLE → ADMIN_LOGIN → ADMIN_SESSION_MANAGER → ADMIN_DASHBOARD
            → STUDENT_LOGIN → STUDENT_GAME
```

### Student Simulation Steps (SimulationStep type)

1. **INTRO** — Scenario briefing with siren audio effect
2. **SITUATION** — Fact collection using 3현주의 (현장/현물/현상)
3. **DEFINITION** — Gap analysis (Current state vs. Ideal state)
4. **ANALYSIS** — Root cause analysis (5 Whys + Fishbone diagram: human/machine/material/method)
5. **SOLUTION** — Action plan (short-term / long-term / prevention)
6. **REPORT** — Final report submission + AI infographic generation via Gemini

### State Management

- **No external state library** — uses React `useState` + `useEffect`
- **Real-time sync** — Firebase `onSnapshot` listeners for sessions and reports
- Cleanup via `useEffect` return for unsubscribe functions

### Firebase Collections

- **`sessions`** — Session configuration (group name, team count, timer, report-enabled flag)
- **`reports`** — Student report submissions (per session/team/user, includes AI report data)

### Serverless API

- **`/api/generate-image`** — Vercel serverless function (Node.js runtime, 120s timeout) that proxies Gemini API calls for AI infographic generation. This avoids CORS issues and keeps the API key server-side.

## Code Conventions

### File Naming
- **PascalCase** for React components: `AdminDashboard.tsx`, `StepThreeAnalysis.tsx`
- **camelCase** for services/utilities: `firestore.ts`, `gemini.ts`

### Component Patterns
- Functional components with hooks (no class components)
- Props interface defined as `type Props = { ... }` or inline
- Exported as default: `export default function ComponentName()`
- Korean comments throughout the codebase (the app is Korean-language)

### TypeScript
- All types centralized in `types.ts`
- Path alias: `@/*` maps to project root (`./`)
- Target: ES2022, Module: ESNext, JSX: react-jsx
- `noEmit: true` — Vite handles transpilation, tsc for type checking only
- Strict mode is NOT enabled

### Styling
- **Brutalist design aesthetic**: thick black borders, box shadows (`shadow-[8px_8px_0px_0px_#000]`), bold typography
- Tailwind CSS utility classes loaded via CDN (not PostCSS build)
- Color palette: Yellow `#fbbf24`, Fire red `#ff5d5d`, Black `#1a1a1a`, White
- Font: Noto Sans KR (Google Fonts via CDN)

### Firebase Patterns
- All Firestore operations are in `services/firestore.ts`
- Async/await for all database operations
- Real-time subscriptions return `Unsubscribe` functions
- Timestamps use `Timestamp.now()` for server-set fields

## Important Notes for AI Assistants

1. **Korean-language app** — UI text, comments, and user-facing strings are in Korean. Preserve this convention.
2. **No test suite** — There are no tests, no test framework, and no linter/formatter configured. The `build` command (`vite build`) is the primary validation.
3. **Firebase config is hardcoded** in `firebase.ts` — this is intentional for this educational app (client-side Firebase keys are safe by design with Firestore security rules).
4. **Tailwind via CDN** — Tailwind is loaded from CDN in `index.html`, not via PostCSS. Do not add `tailwind.config.js` or PostCSS config.
5. **Single-page app** — All Vercel routes rewrite to `index.html`. Routing is handled client-side via `AppMode` state.
6. **No ESLint/Prettier** — There are no linting or formatting configs. Keep code style consistent with existing files.
7. **Info card images** — 72 image URLs are hardcoded in `constants.tsx` (hosted on ibb.co). These represent physical evidence cards in the simulation.
8. **The `api/` directory** contains Vercel serverless functions, not client-side code. These run on the server at deployment.
9. **Build validation**: Run `cd firesim-factory3 && npm run build` to check for TypeScript/compilation errors before committing.
