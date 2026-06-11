import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { INITIAL_EVENTS, RunningEvent } from '@/data/mockData';

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
  addEvent: (event: RunningEvent) => void;
  toggleSaveEvent: (id: string) => void;
  toggleJoinEvent: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const SAVED_KEY = '@pace_saved';
const JOINED_KEY = '@pace_joined';
const USER_EVENTS_KEY = '@pace_user_events';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<RunningEvent[]>(INITIAL_EVENTS);
  const [savedEventIds, setSavedEventIds] = useState<string[]>(['1', '4']);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>(['2', '5']);
  const [userProfile] = useState<UserProfile>({
    name: 'Alex Chen',
    role: 'Community Runner',
    isVerified: false,
  });

  const hostedCount = events.filter(e => e.isUserCreated).length;

  useEffect(() => {
    (async () => {
      try {
        const [savedRaw, joinedRaw, userEventsRaw] = await Promise.all([
          AsyncStorage.getItem(SAVED_KEY),
          AsyncStorage.getItem(JOINED_KEY),
          AsyncStorage.getItem(USER_EVENTS_KEY),
        ]);
        if (savedRaw) setSavedEventIds(JSON.parse(savedRaw));
        if (joinedRaw) setJoinedEventIds(JSON.parse(joinedRaw));
        if (userEventsRaw) {
          const userEvents: RunningEvent[] = JSON.parse(userEventsRaw);
          setEvents([...INITIAL_EVENTS, ...userEvents]);
        }
      } catch (_) {}
    })();
  }, []);

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

  return (
    <AppContext.Provider value={{ events, savedEventIds, joinedEventIds, userProfile, hostedCount, addEvent, toggleSaveEvent, toggleJoinEvent }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
