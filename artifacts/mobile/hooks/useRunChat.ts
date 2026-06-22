/**
 * Real-time group chat for a single run.
 *
 * When Supabase is configured, messages sync live across devices via Realtime.
 * Otherwise they persist on-device (AsyncStorage) so the UI still works for a demo.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { getIdentity, type ChatIdentity } from '@/services/identity';

export interface ChatMessage {
  id: string;
  runId: string;
  userId: string;
  displayName: string;
  body: string;
  createdAt: string;
}

const TABLE = 'run_messages';
const localKey = (runId: string) => `@pace_chat_${runId}`;

function rowToMsg(r: any): ChatMessage {
  return {
    id: String(r.id),
    runId: r.run_id,
    userId: r.user_id,
    displayName: r.display_name,
    body: r.body,
    createdAt: r.created_at,
  };
}

export interface UseRunChat {
  messages: ChatMessage[];
  identity: ChatIdentity | null;
  loading: boolean;
  /** True when backed by live Supabase realtime; false = on-device fallback. */
  isLive: boolean;
  send: (body: string) => Promise<void>;
}

export function useRunChat(runId: string, defaultName: string): UseRunChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [identity, setIdentity] = useState<ChatIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const idRef = useRef<ChatIdentity | null>(null);

  useEffect(() => {
    let active = true;
    getIdentity(defaultName).then(id => {
      if (active) {
        setIdentity(id);
        idRef.current = id;
      }
    });
    return () => {
      active = false;
    };
  }, [defaultName]);

  useEffect(() => {
    if (!runId) return;
    let active = true;

    if (!isSupabaseConfigured || !supabase) {
      AsyncStorage.getItem(localKey(runId)).then(raw => {
        if (active) {
          setMessages(raw ? JSON.parse(raw) : []);
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }

    const sb = supabase;

    (async () => {
      const { data } = await sb
        .from(TABLE)
        .select('*')
        .eq('run_id', runId)
        .order('created_at', { ascending: true });
      if (active && data) setMessages(data.map(rowToMsg));
      if (active) setLoading(false);
    })();

    const channel = sb
      .channel(`run_${runId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLE, filter: `run_id=eq.${runId}` },
        payload => {
          const msg = rowToMsg(payload.new);
          setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
        },
      )
      .subscribe();

    return () => {
      active = false;
      sb.removeChannel(channel);
    };
  }, [runId]);

  const send = useCallback(
    async (body: string) => {
      const text = body.trim();
      const id = idRef.current;
      if (!text || !id) return;

      if (!isSupabaseConfigured || !supabase) {
        const msg: ChatMessage = {
          id: `local_${Date.now()}`,
          runId,
          userId: id.userId,
          displayName: id.displayName,
          body: text,
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => {
          const next = [...prev, msg];
          AsyncStorage.setItem(localKey(runId), JSON.stringify(next)).catch(() => {});
          return next;
        });
        return;
      }

      const sb = supabase;
      await sb.from(TABLE).insert({
        run_id: runId,
        user_id: id.userId,
        display_name: id.displayName,
        body: text,
      });
      // The realtime subscription will append the inserted row.
    },
    [runId],
  );

  return { messages, identity, loading, isLive: isSupabaseConfigured, send };
}
