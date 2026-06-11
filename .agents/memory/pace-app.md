---
name: PACE app architecture
description: Key decisions and conventions for the PACE luxury running community Expo app
---

# PACE App

## Identity
- Dark luxury aesthetic: background `#050505`, neon volt green `#CCFF00`
- Both `light` and `dark` palettes in `constants/colors.ts` are set to the same dark values (app is always dark)
- `app.json` has `userInterfaceStyle: "dark"` at root and per-platform

## Key packages (pre-installed)
- `react-native-svg` (15.12.1) — KL SVG map in `MapCanvas.tsx`
- `react-native-reanimated` — pin pulse animations + bottom sheet slide-up
- `expo-linear-gradient` — event card gradient headers
- `@react-native-async-storage/async-storage` (2.2.0) — AppContext persistence
- `expo-haptics` — join/save button feedback

## Architecture
- `data/mockData.ts` owns the `RunningEvent` type + all static mock data
- `context/AppContext.tsx` imports RunningEvent from mockData (no circular dep)
- `Platform.OS === 'web' ? 67 : insets.top` pattern for safe-area padding (67px for Replit web header)

## MapCanvas SVG coordinate space
- Design space: 375×320 units. Scale factors: `SX = screenWidth/375`, `SY = 320/320`
- Neighbourhood coordinates (design space): Mont Kiara (115,103), TTDI (42,193), DPC (68,112), Bangsar (155,188), KLCC (244,133), Kiara Hill (94,90)
- Animated pins are Reanimated Views positioned absolutely over the SVG

## EventBottomSheet animation approach
- Reanimated `useSharedValue` starts at `CLOSED_Y=480`
- Animates to 0 via `withSpring` in `useEffect` on `event?.id` change
- Parent controls visibility: component returns null when `event === null` (no exit animation by design)

**Why:** Exit animations via Reanimated require `runOnJS` callbacks; skipped for first build simplicity.

## Web layout note
- `Platform.OS === 'web' ? 67 : insets.top` applies a 67px web-header offset. This makes the safe area look correct in the Replit preview iframe.
