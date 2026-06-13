/**
 * Strava integration types for SatuRun (PACE).
 *
 * Strava runs are a separate domain from RunningEvent — they are pure activity
 * records with no organiser, participants, or event-specific fields.
 */

/** A single run imported from the Strava API. */
export interface StravaRun {
  id: string;               // "strava_" + stravaActivityId
  stravaId: number;         // original Strava activity id
  title: string;            // e.g. "Morning Run"
  distanceKm: number;       // converted from metres, rounded to 1 dp
  durationMinutes: number;  // converted from seconds
  pacePerKm: string;        // calculated "M:SS /km"
  startDate: string;        // ISO 8601 from Strava start_date
  location: string;         // city / suburb or empty string
  source: 'strava';         // discriminator for rendering
}

/** Persists the user's Strava OAuth connection in AppContext / AsyncStorage. */
export interface StravaConnection {
  isConnected: boolean;
  athleteId: number | null;
  athleteName: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;       // unix seconds
  lastFetchedAt: number | null;   // unix ms
}

/** UI model for the "Connected Apps" settings row. */
export interface ConnectedApp {
  id: 'strava' | 'apple-health';
  name: string;
  iconName: string;       // Feather icon name
  description: string;
  isConnected: boolean;
  isAvailable: boolean;   // false = "Coming Soon"
  brandColor: string;     // tint colour for the icon wrap
}
