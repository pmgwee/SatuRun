// Accents that sit ON the always-dark category gradient bands (EventCard header,
// event detail header, upcoming-run cards). These must stay bright in BOTH light
// and dark themes, so they're fixed constants rather than theme tokens.
export const ACCENT_ON_DARK = '#C2E0A0';
export const ACCENT_ON_DARK_INK = '#13210F';

// Third-party brand colors — identity, never themed.
export const STRAVA_ORANGE = '#FC4C02';

// Soft, cross-platform card elevation for a modern, premium feel.
// (Apply only to cards that don't use overflow:'hidden', which clips iOS shadows.)
export const CARD_SHADOW = {
  shadowColor: '#0E1A0B',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.07,
  shadowRadius: 14,
  elevation: 2,
} as const;
