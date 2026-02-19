# CLAUDE.md

This file provides guidance for AI assistants working with this codebase.

## Project Overview

**FireSim Factory 3** (제3공장 화재사고 문제해결 시뮬레이션) is an interactive problem-based learning (PBL) simulation platform built with React and TypeScript. Users work through a factory fire accident scenario using a structured 5-step problem-solving methodology:

1. **Situation Assessment** - Collect facts from info cards
2. **Problem Definition** - Gap analysis (current vs. ideal state)
3. **Root Cause Analysis** - 4M method (Human, Machine, Material, Method)
4. **Solution Planning** - Short-term, long-term, and prevention measures
5. **Final Report** - Submit report and generate AI-powered infographic via Gemini API

The platform supports two roles: **Admin** (session management, monitoring) and **Student** (simulation participant).

## Repository Structure

```
jjh-3fire/
├── vercel.json                          # Root-level Vercel deployment config (SPA rewrites)
└── firesim-factory3/                    # Main application directory
    ├── index.html                       # HTML entry point (loads Tailwind CDN, html2canvas)
    ├── index.tsx                        # React entry point
    ├── index.css                        # Global styles
    ├── App.tsx                          # Root component, routing, and top-level state
    ├── types.ts                         # All TypeScript type definitions
    ├── constants.tsx                    # Step guides, scenario content, info card URLs
    ├── firebase.ts                      # Firebase app initialization (Firestore + Storage)
    ├── vite.config.ts                   # Vite build configuration
    ├── tsconfig.json                    # TypeScript compiler options
    ├── package.json                     # Dependencies and scripts
    ├── vercel.json                      # API route rewrites for serverless functions
    ├── .env.example                     # Environment variable template
    │
    ├── components/                      # React UI components
    │   ├── StudentLayout.tsx            # Main student game layout and step navigation
    │   ├── ScenarioIntro.tsx            # Scenario introduction screen
    │   ├── StepOneSituation.tsx         # Fact collection step
    │   ├── StepTwoDefinition.tsx        # Gap analysis step
    │   ├── StepThreeAnalysis.tsx        # Root cause analysis (4M + 5 Whys)
    │   ├── StepFourSolution.tsx         # Solution planning step
    │   ├── StepFiveReport.tsx           # Report submission + AI infographic generation
    │   ├── AdminLogin.tsx               # Admin authentication
    │   ├── AdminSessionManager.tsx      # Session CRUD management
    │   ├── AdminDashboard.tsx           # Real-time team monitoring dashboard
    │   ├── AdminSetup.tsx               # Admin configuration
    │   ├── StudentLogin.tsx             # Student login (name + team selection)
    │   ├── InfoCardModal.tsx            # Info card display modal
    │   └── LearningGuide.tsx            # Learning objectives overlay
    │
    ├── services/                        # Business logic and external API integrations
    │   ├── firestore.ts                 # Firestore CRUD, real-time subscriptions, Storage uploads
    │   └── gemini.ts                    # Gemini API client for infographic generation
    │
    └── api/                             # Vercel serverless functions
        └── generate-image.ts            # Gemini 3 Pro Image Preview API handler (Node.js runtime)
```

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| TypeScript | 5.8.x | Type safety |
| Vite | 6.x | Build tool and dev server |
| Firebase (Firestore) | 12.x | Real-time database |
| Firebase Storage | 12.x | Image/file uploads |
| Gemini API | 3 Pro Image Preview | AI infographic generation |
| Tailwind CSS | CDN | Styling (loaded via `<script>` in index.html) |
| Recharts | 3.x | Data visualization |
| Lucide React | 0.561.x | Icon library |
| Vercel | - | Deployment platform + serverless functions |

## Development Commands

All commands must be run from the `firesim-factory3/` directory:

```bash
cd firesim-factory3

npm install          # Install dependencies
npm run dev          # Start dev server (port 3000, host 0.0.0.0)
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build
```

## Environment Variables

Create a `.env` file in `firesim-factory3/` (see `.env.example`):

```
GEMINI_API_KEY=your_gemini_api_key_here
```

The Vite config exposes this as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`.

## Architecture & Patterns

### State Management
- All application state is lifted to `App.tsx` using React `useState`
- State is passed down via props (no Redux, Zustand, or Context API)
- Real-time data from Firebase uses `onSnapshot` subscriptions in service functions

### Component Conventions
- Functional components with `React.FC<Props>` typing
- Each component defines a `Props` interface at the top of the file
- PascalCase for component names, camelCase for functions and variables
- Named exports for services, default-style exports for components

### Service Layer
- `services/firestore.ts`: All Firestore CRUD operations, real-time subscriptions (`onSnapshot`), and Firebase Storage file uploads
- `services/gemini.ts`: Gemini API integration with prompt engineering for bento grid infographic generation

### Serverless API
- `api/generate-image.ts`: Vercel serverless function (Node.js runtime, 120s max duration) that proxies requests to the Gemini 3 Pro Image Preview API to avoid CORS issues

### Styling
- **Tailwind CSS** via CDN (not installed as a dependency)
- **Neo-Brutalism** design aesthetic: thick black borders (`border-2 border-black`), drop shadows (`shadow-[4px_4px_0px_#000]`)
- Mobile-first responsive design
- Custom scrollbar styling defined in `index.css`
- Google Font: Noto Sans KR

### Type Definitions
- All shared types are centralized in `types.ts`
- Key types: `SimulationStep`, `SimulationState`, `SessionConfig`, `ReportData`, `FinalReportData`, `UserProfile`, `PowerData`

### Application Flow
```
App.tsx (Root)
├── SELECT_ROLE → Role selection screen
├── ADMIN path:
│   ├── ADMIN_LOGIN → AdminLogin
│   ├── ADMIN_SESSION_MANAGER → AdminSessionManager
│   └── ADMIN_DASHBOARD → AdminDashboard
└── STUDENT path:
    ├── STUDENT_LOGIN → StudentLogin
    └── STUDENT_GAME → StudentLayout
        ├── ScenarioIntro (INTRO step)
        ├── StepOneSituation (SITUATION step)
        ├── StepTwoDefinition (DEFINITION step)
        ├── StepThreeAnalysis (ANALYSIS step)
        ├── StepFourSolution (SOLUTION step)
        └── StepFiveReport (REPORT step)
```

## Key Data Models

### SimulationStep Flow
`INTRO` → `SITUATION` → `DEFINITION` → `ANALYSIS` → `SOLUTION` → `REPORT` → `FEEDBACK`

### Firebase Collections
- **`sessions`**: Session configuration (group name, team count, timer settings, report toggle)
- **`reports`**: Submitted reports with optional AI-generated infographic URLs

## Testing

No testing framework is currently configured. There are no test files or test scripts.

## Linting & Formatting

No ESLint or Prettier configuration is present in the repository.

## Deployment

- **Platform**: Vercel
- **Build command**: `npm run build`
- **Output directory**: `dist/`
- **SPA routing**: All routes rewrite to `/index.html` (root `vercel.json`)
- **API routes**: `/api/*` routes handled by Vercel serverless functions (inner `vercel.json`)
- **Serverless function**: `api/generate-image.ts` runs on Node.js runtime with 120s max duration

## Important Notes for AI Assistants

1. **Working directory**: The main app code lives in `firesim-factory3/`, not the repo root. Run `npm` commands from that directory.
2. **No linting/testing**: There are no lint or test commands to verify changes. Rely on `npm run build` for type-checking (TypeScript with `noEmit`).
3. **Tailwind via CDN**: Tailwind is loaded from a CDN `<script>` tag in `index.html`, not as a PostCSS plugin. Do not try to configure `tailwind.config.js`.
4. **Firebase config is hardcoded**: The Firebase configuration in `firebase.ts` contains API keys committed to the repo. This is standard for Firebase web apps (security is enforced via Firestore rules, not API key secrecy).
5. **Two `vercel.json` files**: The root one handles SPA routing and build config; the one inside `firesim-factory3/` handles API route rewrites.
6. **Korean language**: Much of the UI text, comments, and variable names reference Korean terminology. The app's target audience is Korean-speaking users.
7. **Path alias**: `@/` resolves to the `firesim-factory3/` root directory (configured in both `vite.config.ts` and `tsconfig.json`).
8. **Build verification**: After making changes, always run `npm run build` from `firesim-factory3/` to verify there are no TypeScript errors.
