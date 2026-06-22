# SatuRun (PACE) — Claude Code Project Guide

## Overview

SatuRun (PACE) is a luxury running community mobile app for Malaysia — a mobile-first running event discovery and community platform with a dark luxury aesthetic. Originally built with Replit AI, now developed locally with VS Code + Claude Code.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces with catalog versioning |
| Runtime | Node.js 24, TypeScript 5.9 |
| Mobile App | Expo 54, React Native 0.81.5, React 19.1, Expo Router 6 |
| API Server | Express 5, esbuild bundling, pino logging |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod, drizzle-zod |
| API Codegen | Orval (OpenAPI 3.1 → React Query hooks + Zod schemas) |
| Mobile UI | react-native-reanimated, expo-haptics, react-native-svg |
| Mockup Sandbox | Vite 7, React, Tailwind CSS 4, shadcn/ui |

## Workspace Structure

```
Asset-Manager/
├── artifacts/
│   ├── mobile/         # Expo mobile app (@workspace/mobile)
│   ├── api-server/     # Express 5 API (@workspace/api-server)
│   └── mockup-sandbox/ # Vite design sandbox (@workspace/mockup-sandbox)
├── lib/
│   ├── api-spec/       # OpenAPI spec + Orval codegen config (@workspace/api-spec)
│   ├── api-client-react/ # Generated React Query hooks + custom fetch wrapper
│   ├── api-zod/        # Generated Zod schemas
│   └── db/             # Drizzle ORM + PostgreSQL schema (@workspace/db)
├── scripts/            # Utility scripts
├── package.json        # Workspace root
└── pnpm-workspace.yaml # Workspace config + dependency catalog
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Full typecheck
pnpm run typecheck

# Typecheck shared libs only
pnpm run typecheck:libs

# Full build (typecheck + build all packages)
pnpm run build

# Mobile app
pnpm --filter @workspace/mobile run dev           # Start Expo dev server
pnpm --filter @workspace/mobile run dev:android    # Start on Android emulator
pnpm --filter @workspace/mobile run dev:ios        # Start on iOS simulator
pnpm --filter @workspace/mobile run dev:web        # Start on web

# API server
pnpm --filter @workspace/api-server run dev        # Build + start in dev mode
pnpm --filter @workspace/api-server run build      # Bundle with esbuild
pnpm --filter @workspace/api-server run start      # Run built server

# Database
pnpm --filter @workspace/db run push               # Push schema changes to DB

# API codegen
pnpm --filter @workspace/api-spec run codegen      # Regenerate from OpenAPI spec

# Mockup sandbox
PORT=3001 BASE_PATH=/ pnpm --filter @workspace/mockup-sandbox run dev
```

## Environment Variables

Required env vars (see `.env.example`):

- `DATABASE_URL` — PostgreSQL connection string (e.g. `postgresql://postgres:postgres@localhost:5432/saturun`)
- `PORT` — API server port (default: 5000)
- `BASE_PATH` — Base path for mockup-sandbox (default: `/`)

## Mobile App Architecture

- **Entry**: `expo-router/entry` (file-based routing via Expo Router v6)
- **Tabs** (5 tabs in `artifacts/mobile/app/(tabs)/`):
  - `index.tsx` → Discover (map view with SVG KL map)
  - `saved.tsx` → Saved events
  - `my-runs.tsx` → My Runs
  - `leaderboard.tsx` → Trending
  - `profile.tsx` → Organizer
- **State**: `AppContext.tsx` manages events, saved/joined IDs, user profile
- **Persistence**: `@react-native-async-storage/async-storage`

## Design Identity

- **Theme**: Dark luxury — background `#050505`, accent `#CCFF00` (lime green)
- **Typography**: Inter font via `@expo-google-fonts/inter`
- **KL Map**: SVG-based map of Kuala Lumpur neighborhoods in `MapCanvas.tsx`
- **Animations**: `react-native-reanimated` + `expo-haptics` for bottom sheets and modals

## Key Files

- `artifacts/mobile/app/(tabs)/_layout.tsx` — Tab navigator (NativeTabs on iOS 26, classic fallback)
- `artifacts/mobile/components/MapCanvas.tsx` — SVG KL map with neighborhood coordinates
- `artifacts/mobile/components/EventBottomSheet.tsx` — Animated event detail sheet
- `artifacts/mobile/context/AppContext.tsx` — Global app state
- `lib/api-spec/openapi.yaml` — OpenAPI 3.1 spec (source of truth for API contracts)
- `lib/db/src/schema/index.ts` — Drizzle ORM schema (currently empty, tables TBD)
- `lib/api-client-react/custom-fetch.ts` — Cross-platform fetch wrapper (RN + web)

## Phone Simulator Setup

### Android (already configured)
1. Open Android Studio → Device Manager
2. Start one of the available emulators (Pixel_3_API_33, Pixel_4_XL_API_33, etc.)
3. Run: `pnpm --filter @workspace/mobile run dev:android`
4. cd c:\Users\quekm\Desktop\projects\Asset-Manager\Asset-Manager\artifacts\mobile


### Using Expo Go on Physical Phone
1. Install **Expo Go** app on your phone
2. Run: `npx expo start --tunnel`
3. Scan the QR code with your phone camera

### iOS Simulator (macOS only)
- Requires Xcode on macOS. Not available on Windows.

## Gotchas

- **Platform**: This project was originally built on Replit (Linux). Some Replit-specific configs have been removed for Windows compatibility.
- **pnpm required**: The `preinstall` script blocks npm/yarn usage
- **esbuild**: Build scripts need approval via `allowBuilds` in `pnpm-workspace.yaml`
- **React version**: Pinned to `19.1.0` because Expo requires this exact version
- **Database schema**: Still empty — no tables defined yet in Drizzle ORM
- **React Compiler**: Enabled via experiment flag in `app.json`

## Windows Development Notes

- Android SDK is at `%LOCALAPPDATA%\Android\Sdk`
- `ANDROID_HOME` environment variable must be set
- Android Studio emulators are available (Pixel_3_API_33, Pixel_4_XL_API_33, Pixel_6_API_33, etc.)
- Use `cross-env` for cross-platform env var setting in scripts
