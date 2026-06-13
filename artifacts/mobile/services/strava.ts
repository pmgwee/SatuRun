/**
 * Strava API service for SatuRun (PACE).
 *
 * Handles OAuth2 Authorization Code Grant via expo-web-browser deep linking
 * and fetches running activities from the Strava API.
 *
 * For the demo, the client secret is read from EXPO_PUBLIC env vars.
 * Production should proxy through the backend to keep the secret safe.
 */

import * as WebBrowser from 'expo-web-browser';
import type { StravaRun } from '@/types/strava';

// ── Configuration ─────────────────────────────────────────────

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities';
const REDIRECT_URI = 'saturun://strava-callback';
const SCOPES = 'read,activity:read';

function getClientId(): string {
  return process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID ?? '';
}

function getClientSecret(): string {
  return process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET ?? '';
}

// ── OAuth ─────────────────────────────────────────────────────

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

/**
 * Open the Strava OAuth authorization page.
 * Returns the authorization code on success, or null if the user cancelled.
 */
export async function initiateStravaOAuth(): Promise<string | null> {
  const clientId = getClientId();
  if (!clientId) {
    console.warn('[Strava] Missing EXPO_PUBLIC_STRAVA_CLIENT_ID — skipping OAuth');
    return null;
  }

  const authUrl =
    `${STRAVA_AUTH_URL}?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPES)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

  if (result.type === 'success' && result.url) {
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    if (code) return code;
  }

  return null;
}

/**
 * Exchange an authorization code for access + refresh tokens.
 */
export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava token exchange failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Refresh an expired access token.
 */
export async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava token refresh failed (${res.status}): ${text}`);
  }

  return res.json();
}

// ── Activities ────────────────────────────────────────────────

interface RawStravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;          // metres
  moving_time: number;       // seconds
  start_date: string;        // ISO 8601
  location_city?: string;
  location_country?: string;
}

/**
 * Convert metres → km to one decimal place.
 */
function metresToKm(m: number): number {
  return Math.round(m / 100) / 10;
}

/**
 * Convert seconds → minutes (rounded).
 */
function secondsToMinutes(s: number): number {
  return Math.round(s / 60);
}

/**
 * Calculate pace as "M:SS /km" from moving time (seconds) and distance (km).
 */
function calcPace(seconds: number, km: number): string {
  if (km <= 0) return '0:00 /km';
  const secsPerKm = seconds / km;
  const m = Math.floor(secsPerKm / 60);
  const s = Math.round(secsPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')} /km`;
}

/**
 * Map a raw Strava activity into our StravaRun type.
 */
function convertActivity(raw: RawStravaActivity): StravaRun {
  const km = metresToKm(raw.distance);
  return {
    id: `strava_${raw.id}`,
    stravaId: raw.id,
    title: raw.name,
    distanceKm: km,
    durationMinutes: secondsToMinutes(raw.moving_time),
    pacePerKm: calcPace(raw.moving_time, km),
    startDate: raw.start_date,
    location: raw.location_city ?? '',
    source: 'strava',
  };
}

/**
 * Fetch running activities from Strava (paginated, up to 90 runs = 3 pages).
 * Only activities with type "Run" are returned.
 */
export async function fetchStravaActivities(accessToken: string): Promise<StravaRun[]> {
  const allRuns: StravaRun[] = [];
  const maxPages = 3;
  const perPage = 30;

  for (let page = 1; page <= maxPages; page++) {
    const url =
      `${STRAVA_ACTIVITIES_URL}?per_page=${perPage}&page=${page}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      console.warn(`[Strava] Activities fetch failed on page ${page} (${res.status})`);
      break;
    }

    const data: RawStravaActivity[] = await res.json();
    const runs = data.filter(a => a.type === 'Run').map(convertActivity);
    allRuns.push(...runs);

    // If fewer than perPage results, no more pages
    if (data.length < perPage) break;
  }

  return allRuns;
}
