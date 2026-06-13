import { useTheme } from '@/context/ThemeContext';

/**
 * Backward-compatible hook — returns theme-aware palette.
 * All existing useColors() call sites work without changes.
 */
export function useColors() {
  const { colors } = useTheme();
  return colors;
}
