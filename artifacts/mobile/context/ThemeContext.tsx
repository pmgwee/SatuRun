import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// ─── Palettes ────────────────────────────────────────────────────────

const NEON_GREEN = '#CCFF00';

const darkPalette = {
  text: '#FFFFFF',
  tint: NEON_GREEN,
  background: '#050505',
  foreground: '#FFFFFF',
  surface: '#111111',
  card: '#1A1A1A',
  cardBorder: 'rgba(255,255,255,0.10)',
  primary: NEON_GREEN,
  primaryForeground: '#050505',
  secondary: '#1C1C1E',
  secondaryForeground: '#FFFFFF',
  muted: '#222222',
  mutedForeground: '#8E8E93',
  accent: NEON_GREEN,
  accentForeground: '#050505',
  destructive: '#FF453A',
  destructiveForeground: '#FFFFFF',
  border: 'rgba(255,255,255,0.08)',
  input: 'rgba(255,255,255,0.12)',
};

const lightPalette = {
  text: '#222222',
  tint: NEON_GREEN,
  background: '#F7F7F7',
  foreground: '#222222',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#EBEBEB',
  primary: NEON_GREEN,
  primaryForeground: '#050505',
  secondary: '#F0F0F0',
  secondaryForeground: '#222222',
  muted: '#E5E5E5',
  mutedForeground: '#717171',
  accent: NEON_GREEN,
  accentForeground: '#050505',
  destructive: '#FF453A',
  destructiveForeground: '#FFFFFF',
  border: '#E5E5E5',
  input: '#F0F0F0',
};

type Palette = typeof darkPalette;

// ─── Context ─────────────────────────────────────────────────────────

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  colors: Palette & { radius: number };
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_KEY = '@pace_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [isDark, setIsDark] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored === 'light') {
          setIsDark(false);
        } else if (stored === null) {
          // No preference saved — follow system
          setIsDark(systemScheme !== 'light');
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, [systemScheme]);

  const toggleTheme = useCallback(async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  const palette = isDark ? darkPalette : lightPalette;
  const colors = { ...palette, radius: 14 };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
