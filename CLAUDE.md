# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# SatuRun (PACE) — Claude Code Project Guide

## Overview

SatuRun (PACE) is a running community mobile app for Malaysia — a mobile-first running event discovery and community platform. Originally built with Replit AI, now developed locally with VS Code + Claude Code. The mobile app is currently **demo/mock-data driven**: screens read from local mock data files (`artifacts/mobile/data/`) and AsyncStorage, not the API server or database (the Drizzle schema is still empty).

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
- **Tabs** (in `artifacts/mobile/app/(tabs)/`):
  - `index.tsx` → Discover (Leaflet map via WebView)
  - `community.tsx` → Community feed (posts, comments, likes)
  - `rewards.tsx` → Rewards (points, streak, missions, vouchers)
  - `leaderboard.tsx` → Trending
  - `my-runs.tsx` → My Runs (also hosts the old "Saved" content)
  - `profile.tsx` → Organizer
  - `saved.tsx` exists but is **hidden** (`href: null`) — its content moved into My Runs
- **Stack routes** (outside tabs): `chat/[runId].tsx` (per-run group chat), `dm/[handle].tsx` (direct messages), `post/create.tsx` + `post/[id].tsx` (community posts), `user/[handle].tsx` (author profile)
- **State**: `AppContext.tsx` is the single global store — events, saved/joined IDs, user profile, rewards (points/streak/missions/vouchers), Strava connection + runs, and the community feed (posts/comments/likes). `ThemeContext.tsx` holds the light/dark palette and persists the choice.
- **Tab layout**: `_layout.tsx` renders `NativeTabs` when `isLiquidGlassAvailable()` (iOS 26), otherwise a classic `Tabs` fallback. Adding/removing a tab means editing **both** layouts.
- **Persistence**: `@react-native-async-storage/async-storage`

## Data Layer (mock-first)

The app does not call the API server yet. Screen data comes from `artifacts/mobile/data/`:

- `mockData.ts` — running events, KL neighborhood coordinates (`coordsForNeighborhood`, `KL_CENTER`), mock Strava runs
- `communityData.ts` — initial posts + comments
- `rewardsData.ts` — missions, voucher templates, check-in rewards
- `dmData.ts` — direct-message threads
- `types/strava.ts` — Strava connection/run types

Strava is mocked via `hooks/useStrava.ts`; run chat via `hooks/useRunChat.ts`. When wiring real data, replace these mock sources with the generated React Query hooks from `@workspace/api-client-react`.

## Design Identity

- **Theme**: Matcha green, **light by default** with a dark mode. Palettes live in `context/ThemeContext.tsx` (matcha `#7FA862` light / `#A8C686` dark). Never hardcode colors in screens — read them via `useColors()` (`hooks/useColors.ts`) or `useTheme()` so light/dark both work.
- **Typography**: Inter font via `@expo-google-fonts/inter`
- **KL Map**: Leaflet map rendered inside a WebView (`components/MapWebView.tsx`) using free OpenStreetMap/CARTO tiles — **no API key**. Pins are clustered per neighborhood from `coordsForNeighborhood` in `mockData.ts`.
- **Animations**: `react-native-reanimated` + `expo-haptics` for bottom sheets and modals

## Key Files

- `artifacts/mobile/app/(tabs)/_layout.tsx` — Tab navigator (NativeTabs on iOS 26, classic `Tabs` fallback)
- `artifacts/mobile/components/MapWebView.tsx` — Leaflet/WebView KL map (self-contained HTML, OSM tiles)
- `artifacts/mobile/components/EventBottomSheet.tsx` — Animated event detail sheet
- `artifacts/mobile/context/AppContext.tsx` — Global app state (events, rewards, Strava, community)
- `artifacts/mobile/context/ThemeContext.tsx` — Light/dark matcha palettes + persistence
- `artifacts/mobile/data/` — Mock data sources backing the UI (see Data Layer)
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
2. Run: `pnpm --filter @workspace/mobile run dev -- --tunnel`
3. Scan the QR code with your phone camera

### iOS Simulator (macOS only)
- Requires Xcode on macOS. Not available on Windows.

## Gotchas

- **Platform**: This project was originally built on Replit (Linux). Some Replit-specific configs have been removed for Windows compatibility.
- **pnpm required**: The `preinstall` script blocks npm/yarn usage
- **esbuild**: Build scripts need approval via `allowBuilds` in `pnpm-workspace.yaml`
- **React version**: Pinned to `19.1.0` because Expo requires this exact version
- **Database schema**: Still empty — no tables defined yet in Drizzle ORM. The mobile app runs entirely on mock data + AsyncStorage.
- **No test runner**: There is no Jest/Vitest setup yet. "Verifying" a change means `pnpm run typecheck` plus running the app — there are no unit tests to run.
- **Tabs are defined twice**: `_layout.tsx` has both `NativeTabLayout` and `ClassicTabLayout`. Any tab change must be made in both.
- **Colors are theme-driven**: Hardcoded hex in screens breaks dark mode. Always go through `useColors()` / `useTheme()`.
- **React Compiler**: Enabled via experiment flag in `app.json`

## Windows Development Notes

- Android SDK is at `%LOCALAPPDATA%\Android\Sdk`
- `ANDROID_HOME` environment variable must be set
- Android Studio emulators are available (Pixel_3_API_33, Pixel_4_XL_API_33, Pixel_6_API_33, etc.)
- Use `cross-env` for cross-platform env var setting in scripts
