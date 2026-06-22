import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { INITIAL_EVENTS, MOCK_STRAVA_RUNS, RunningEvent } from '@/data/mockData';
import {
  CHECK_IN_REWARDS,
  DEFAULT_REWARDS,
  DEMO_VOUCHERS,
  VOUCHER_TEMPLATES,
  type Mission,
  type RewardState,
  type UserVoucher,
  getTodayString,
} from '@/data/rewardsData';
import {
  INITIAL_COMMENTS,
  INITIAL_POSTS,
  type CommunityPost,
  type PostComment,
} from '@/data/communityData';
import type { StravaConnection, StravaRun } from '@/types/strava';

interface UserProfile {
  name: string;
  role: string;
  isVerified: boolean;
}

interface AppContextType {
  events: RunningEvent[];
  savedEventIds: string[];
  joinedEventIds: string[];
  userProfile: UserProfile;
  hostedCount: number;
  // Rewards
  userPoints: number;
  checkInStreak: number;
  lastCheckInDate: string | null;
  missions: Mission[];
  userVouchers: UserVoucher[];
  checkIn: () => void;
  startMission: (id: string) => void;
  claimMissionReward: (id: string) => void;
  redeemVoucher: (templateId: string) => void;
  useVoucher: (id: string) => void;
  // Strava integration
  stravaConnection: StravaConnection;
  stravaRuns: StravaRun[];
  connectStrava: (connection: StravaConnection, runs: StravaRun[]) => void;
  disconnectStrava: () => void;
  updateStravaRuns: (runs: StravaRun[]) => void;
  // Community feed
  posts: CommunityPost[];
  comments: PostComment[];
  likedPostIds: string[];
  savedPostIds: string[];
  addPost: (post: CommunityPost) => void;
  toggleLikePost: (id: string) => void;
  toggleSavePost: (id: string) => void;
  addComment: (postId: string, body: string) => void;
  // Existing actions
  addEvent: (event: RunningEvent) => void;
  toggleSaveEvent: (id: string) => void;
  toggleJoinEvent: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const SAVED_KEY = '@pace_saved';
const JOINED_KEY = '@pace_joined';
const USER_EVENTS_KEY = '@pace_user_events';
const STRAVA_CONNECTION_KEY = '@pace_strava_connection';
const STRAVA_RUNS_KEY = '@pace_strava_runs';
const REWARDS_KEY = '@pace_rewards';
const USER_POSTS_KEY = '@pace_user_posts';
const USER_COMMENTS_KEY = '@pace_user_comments';
const LIKED_POSTS_KEY = '@pace_liked_posts';
const SAVED_POSTS_KEY = '@pace_saved_posts';

const DEFAULT_STRAVA_CONNECTION: StravaConnection = {
  isConnected: false,
  athleteId: null,
  athleteName: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  lastFetchedAt: null,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<RunningEvent[]>(INITIAL_EVENTS);
  const [savedEventIds, setSavedEventIds] = useState<string[]>(['1', '4']);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>(['2', '5']);
  const [userProfile] = useState<UserProfile>({
    name: 'Alex Chen',
    role: 'Community Runner',
    isVerified: false,
  });
  // Strava state — pre-loaded with mock runs for demo
  const [stravaConnection, setStravaConnection] = useState<StravaConnection>(DEFAULT_STRAVA_CONNECTION);
  const [stravaRuns, setStravaRuns] = useState<StravaRun[]>(MOCK_STRAVA_RUNS);
  // Rewards state
  const [rewards, setRewards] = useState<RewardState>(DEFAULT_REWARDS);
  // Community feed state
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [comments, setComments] = useState<PostComment[]>(INITIAL_COMMENTS);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);

  const hostedCount = events.filter(e => e.isUserCreated).length;

  // ── Hydrate all persisted state on mount ────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [
          savedRaw,
          joinedRaw,
          userEventsRaw,
          stravaConnRaw,
          stravaRunsRaw,
          rewardsRaw,
          userPostsRaw,
          userCommentsRaw,
          likedPostsRaw,
          savedPostsRaw,
        ] = await Promise.all([
          AsyncStorage.getItem(SAVED_KEY),
          AsyncStorage.getItem(JOINED_KEY),
          AsyncStorage.getItem(USER_EVENTS_KEY),
          AsyncStorage.getItem(STRAVA_CONNECTION_KEY),
          AsyncStorage.getItem(STRAVA_RUNS_KEY),
          AsyncStorage.getItem(REWARDS_KEY),
          AsyncStorage.getItem(USER_POSTS_KEY),
          AsyncStorage.getItem(USER_COMMENTS_KEY),
          AsyncStorage.getItem(LIKED_POSTS_KEY),
          AsyncStorage.getItem(SAVED_POSTS_KEY),
        ]);
        if (savedRaw) setSavedEventIds(JSON.parse(savedRaw));
        if (joinedRaw) setJoinedEventIds(JSON.parse(joinedRaw));
        if (userEventsRaw) {
          const userEvents: RunningEvent[] = JSON.parse(userEventsRaw);
          setEvents([...INITIAL_EVENTS, ...userEvents]);
        }
        // Restore Strava state; keep mock runs if no persisted data
        if (stravaConnRaw) {
          setStravaConnection(JSON.parse(stravaConnRaw));
        }
        if (stravaRunsRaw) {
          const persisted: StravaRun[] = JSON.parse(stravaRunsRaw);
          if (persisted.length > 0) setStravaRuns(persisted);
        }
        // Restore rewards state; merge in any new demo vouchers missing from cache
        if (rewardsRaw) {
          const persisted: RewardState = JSON.parse(rewardsRaw);
          const existingIds = new Set(persisted.userVouchers.map(v => v.id));
          const newDemoVouchers = DEMO_VOUCHERS.filter(v => !existingIds.has(v.id));
          if (newDemoVouchers.length > 0) {
            persisted.userVouchers = [...persisted.userVouchers, ...newDemoVouchers];
          }
          setRewards(persisted);
        }
        // Restore community feed: user posts prepend the seed feed (newest first).
        if (userPostsRaw) {
          const userPosts: CommunityPost[] = JSON.parse(userPostsRaw);
          if (userPosts.length > 0) setPosts([...userPosts, ...INITIAL_POSTS]);
        }
        if (userCommentsRaw) {
          const userComments: PostComment[] = JSON.parse(userCommentsRaw);
          if (userComments.length > 0) setComments([...INITIAL_COMMENTS, ...userComments]);
        }
        if (likedPostsRaw) setLikedPostIds(JSON.parse(likedPostsRaw));
        if (savedPostsRaw) setSavedPostIds(JSON.parse(savedPostsRaw));
      } catch (_) {}
    })();
  }, []);

  // ── Persist rewards on change ───────────────────────────────────
  useEffect(() => {
    AsyncStorage.setItem(REWARDS_KEY, JSON.stringify(rewards)).catch(() => {});
  }, [rewards]);

  const toggleSaveEvent = useCallback((id: string) => {
    setSavedEventIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleJoinEvent = useCallback((id: string) => {
    setJoinedEventIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      AsyncStorage.setItem(JOINED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addEvent = useCallback((event: RunningEvent) => {
    setEvents(prev => {
      const next = [...prev, event];
      const userEvents = next.filter(e => e.isUserCreated);
      AsyncStorage.setItem(USER_EVENTS_KEY, JSON.stringify(userEvents));
      return next;
    });
  }, []);

  // ── Strava actions ──────────────────────────────────────────────

  const connectStrava = useCallback((connection: StravaConnection, runs: StravaRun[]) => {
    setStravaConnection(connection);
    setStravaRuns(runs);
    AsyncStorage.setItem(STRAVA_CONNECTION_KEY, JSON.stringify(connection));
    AsyncStorage.setItem(STRAVA_RUNS_KEY, JSON.stringify(runs));
  }, []);

  const disconnectStrava = useCallback(() => {
    setStravaConnection(DEFAULT_STRAVA_CONNECTION);
    // Revert to mock runs for demo continuity
    setStravaRuns(MOCK_STRAVA_RUNS);
    AsyncStorage.removeItem(STRAVA_CONNECTION_KEY);
    AsyncStorage.setItem(STRAVA_RUNS_KEY, JSON.stringify(MOCK_STRAVA_RUNS));
  }, []);

  const updateStravaRuns = useCallback((runs: StravaRun[]) => {
    setStravaRuns(runs);
    AsyncStorage.setItem(STRAVA_RUNS_KEY, JSON.stringify(runs));
  }, []);

  // ── Rewards actions ─────────────────────────────────────────────

  const checkIn = useCallback(() => {
    setRewards(prev => {
      const today = getTodayString();
      if (prev.lastCheckInDate === today) return prev; // already checked in
      const reward = CHECK_IN_REWARDS[prev.checkInStreak % 7];
      return {
        ...prev,
        userPoints: prev.userPoints + reward,
        checkInStreak: prev.checkInStreak + 1,
        lastCheckInDate: today,
      };
    });
  }, []);

  const startMission = useCallback((id: string) => {
    setRewards(prev => ({
      ...prev,
      missions: prev.missions.map(m =>
        m.id === id ? { ...m, status: 'in_progress' as const } : m,
      ),
    }));
  }, []);

  const claimMissionReward = useCallback((id: string) => {
    setRewards(prev => {
      const mission = prev.missions.find(m => m.id === id);
      if (!mission || mission.status !== 'completed') return prev;
      return {
        ...prev,
        userPoints: prev.userPoints + mission.pointsReward,
        missions: prev.missions.map(m =>
          m.id === id ? { ...m, status: 'claimed' as const } : m,
        ),
      };
    });
  }, []);

  const useVoucher = useCallback((id: string) => {
    setRewards(prev => ({
      ...prev,
      userVouchers: prev.userVouchers.map(v =>
        v.id === id ? { ...v, status: 'used' as const } : v,
      ),
    }));
  }, []);

  const redeemVoucher = useCallback((templateId: string) => {
    setRewards(prev => {
      const template = VOUCHER_TEMPLATES.find(v => v.id === templateId);
      if (!template || prev.userPoints < template.pointsCost) return prev;
      const voucher: UserVoucher = {
        id: `voucher_${Date.now()}`,
        templateId: template.id,
        title: template.title,
        description: template.description,
        partnerName: template.partnerName,
        partnerInitials: template.partnerInitials,
        partnerColor: template.partnerColor,
        rewardValue: template.rewardValue,
        status: 'active',
        redeemedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + template.validityDays * 86400000).toISOString(),
        minSpend: template.minSpend,
      };
      return {
        ...prev,
        userPoints: prev.userPoints - template.pointsCost,
        userVouchers: [...prev.userVouchers, voucher],
      };
    });
  }, []);

  // ── Community feed actions ──────────────────────────────────────

  const addPost = useCallback((post: CommunityPost) => {
    setPosts(prev => {
      const next = [post, ...prev];
      const userPosts = next.filter(p => p.isUserCreated);
      AsyncStorage.setItem(USER_POSTS_KEY, JSON.stringify(userPosts));
      return next;
    });
  }, []);

  const toggleLikePost = useCallback((id: string) => {
    setLikedPostIds(prev => {
      const liked = prev.includes(id);
      const next = liked ? prev.filter(x => x !== id) : [...prev, id];
      AsyncStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(next));
      // Keep the displayed like count in sync with the toggle.
      setPosts(ps => ps.map(p => (p.id === id ? { ...p, likeCount: p.likeCount + (liked ? -1 : 1) } : p)));
      return next;
    });
  }, []);

  const toggleSavePost = useCallback((id: string) => {
    setSavedPostIds(prev => {
      const saved = prev.includes(id);
      const next = saved ? prev.filter(x => x !== id) : [...prev, id];
      AsyncStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(next));
      setPosts(ps => ps.map(p => (p.id === id ? { ...p, savedCount: p.savedCount + (saved ? -1 : 1) } : p)));
      return next;
    });
  }, []);

  const addComment = useCallback((postId: string, body: string) => {
    const text = body.trim();
    if (!text) return;
    const comment: PostComment = {
      id: `comment_${Date.now()}`,
      postId,
      authorName: 'Alex Chen',
      authorInitials: 'AC',
      authorColor: '#7FA862',
      body: text,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => {
      const userComments = [...prev.filter(c => c.id.startsWith('comment_')), comment];
      AsyncStorage.setItem(USER_COMMENTS_KEY, JSON.stringify(userComments));
      return [...prev, comment];
    });
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)));
  }, []);

  return (
    <AppContext.Provider
      value={{
        events,
        savedEventIds,
        joinedEventIds,
        userProfile,
        hostedCount,
        // Rewards
        userPoints: rewards.userPoints,
        checkInStreak: rewards.checkInStreak,
        lastCheckInDate: rewards.lastCheckInDate,
        missions: rewards.missions,
        userVouchers: rewards.userVouchers,
        checkIn,
        startMission,
        claimMissionReward,
        redeemVoucher,
        useVoucher,
        // Strava
        stravaConnection,
        stravaRuns,
        connectStrava,
        disconnectStrava,
        updateStravaRuns,
        // Community feed
        posts,
        comments,
        likedPostIds,
        savedPostIds,
        addPost,
        toggleLikePost,
        toggleSavePost,
        addComment,
        // Actions
        addEvent,
        toggleSaveEvent,
        toggleJoinEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
