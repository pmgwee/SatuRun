/**
 * React hook that wraps the Strava service layer and AppContext state.
 *
 * Usage:
 *   const { connection, stravaRuns, isLoading, connect, disconnect, syncActivities } = useStrava();
 */

import { useCallback, useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  exchangeCodeForToken,
  fetchStravaActivities,
  initiateStravaOAuth,
  refreshStravaToken,
} from '@/services/strava';
import type { StravaConnection, StravaRun } from '@/types/strava';

export interface UseStravaReturn {
  /** Current Strava connection state. */
  connection: StravaConnection;
  /** Imported Strava runs (mock or real). */
  stravaRuns: StravaRun[];
  /** True while an OAuth flow or sync is in progress. */
  isLoading: boolean;
  /** Kick off the Strava OAuth flow. */
  connect: () => Promise<void>;
  /** Disconnect Strava and revert to mock data. */
  disconnect: () => Promise<void>;
  /** Re-fetch activities from Strava (refreshes token if needed). */
  syncActivities: () => Promise<void>;
}

export function useStrava(): UseStravaReturn {
  const { stravaConnection, stravaRuns, connectStrava, disconnectStrava, updateStravaRuns } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const code = await initiateStravaOAuth();
      if (!code) return; // user cancelled or no client id

      const tokenRes = await exchangeCodeForToken(code);

      const connection: StravaConnection = {
        isConnected: true,
        athleteId: tokenRes.athlete.id,
        athleteName: `${tokenRes.athlete.firstname} ${tokenRes.athlete.lastname}`.trim(),
        accessToken: tokenRes.access_token,
        refreshToken: tokenRes.refresh_token,
        expiresAt: tokenRes.expires_at,
        lastFetchedAt: Date.now(),
      };

      // Fetch activities with the new token
      const runs = await fetchStravaActivities(tokenRes.access_token);
      connectStrava(connection, runs);
    } catch (err) {
      console.error('[useStrava] connect failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [connectStrava]);

  const syncActivities = useCallback(async () => {
    if (!stravaConnection.isConnected || !stravaConnection.accessToken) return;

    setIsLoading(true);
    try {
      let accessToken = stravaConnection.accessToken;

      // Refresh token if expired (with 5 min buffer)
      if (
        stravaConnection.expiresAt &&
        stravaConnection.expiresAt * 1000 < Date.now() + 5 * 60 * 1000 &&
        stravaConnection.refreshToken
      ) {
        const tokenRes = await refreshStravaToken(stravaConnection.refreshToken);
        accessToken = tokenRes.access_token;

        const updatedConnection: StravaConnection = {
          ...stravaConnection,
          accessToken: tokenRes.access_token,
          refreshToken: tokenRes.refresh_token,
          expiresAt: tokenRes.expires_at,
          lastFetchedAt: Date.now(),
        };
        // Re-connect with updated tokens + existing runs (will be overwritten below)
        connectStrava(updatedConnection, stravaRuns);
      }

      const runs = await fetchStravaActivities(accessToken);
      updateStravaRuns(runs);
    } catch (err) {
      console.error('[useStrava] sync failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [stravaConnection, stravaRuns, connectStrava, updateStravaRuns]);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      disconnectStrava();
    } finally {
      setIsLoading(false);
    }
  }, [disconnectStrava]);

  return {
    connection: stravaConnection,
    stravaRuns,
    isLoading,
    connect,
    disconnect,
    syncActivities,
  };
}
