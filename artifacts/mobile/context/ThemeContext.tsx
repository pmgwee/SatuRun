import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ─── Palettes ────────────────────────────────────────────────────────

// Matcha green — calm, premium, modern. Light is the default aesthetic.
const MATCHA_LIGHT = '#7FA862';
const MATCHA_DARK = '#A8C686';

const darkPalette = {
  text: '#F2F5EE',
  tint: MATCHA_DARK,
  background: '#0E1311',
  foreground: '#F2F5EE',
  surface: '#161D18',
  card: '#1A221C',
  cardBorder: 'rgba(255,255,255,0.10)',
  primary: MATCHA_DARK,
  primaryForeground: '#0E1311',
  primarySoft: 'rgba(168,198,134,0.14)',
  primaryBorder: 'rgba(168,198,134,0.32)',
  accentInk: '#C2E0A0',
  secondary: '#1C2620',
  secondaryForeground: '#F2F5EE',
  muted: '#222A24',
  mutedForeground: '#8A9584',
  accent: MATCHA_DARK,
  accentForeground: '#0E1311',
  success: '#5BBA66',
  successSoft: 'rgba(91,186,102,0.16)',
  danger: '#FF6B6B',
  dangerSoft: 'rgba(255,107,107,0.16)',
  destructive: '#FF6B6B',
  destructiveForeground: '#0E1311',
  border: 'rgba(255,255,255,0.08)',
  input: 'rgba(255,255,255,0.12)',
};

const lightPalette = {
  text: '#1C2A1A',
  tint: MATCHA_LIGHT,
  background: '#F3F6EE',
  foreground: '#1C2A1A',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E6EADF',
  primary: MATCHA_LIGHT,
  primaryForeground: '#13210F',
  primarySoft: 'rgba(127,168,98,0.12)',
  primaryBorder: 'rgba(127,168,98,0.35)',
  accentInk: '#4A6B36',
  secondary: '#EFF3E8',
  secondaryForeground: '#1C2A1A',
  muted: '#EAEFE2',
  mutedForeground: '#6B7A63',
  accent: MATCHA_LIGHT,
  accentForeground: '#13210F',
  success: '#3FA64A',
  successSoft: 'rgba(63,166,74,0.12)',
  danger: '#E5484D',
  dangerSoft: 'rgba(229,72,77,0.12)',
  destructive: '#E5484D',
  destructiveForeground: '#FFFFFF',
  border: '#E6EADF',
  input: '#EFF3E8',
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
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        // Default to light matcha; only go dark when explicitly chosen.
        setIsDark(stored === 'dark');
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

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
