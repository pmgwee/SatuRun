import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { useRunChat, type ChatMessage } from '@/hooks/useRunChat';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Deterministic avatar color from a userId, drawn from the brand-friendly palette. */
const AVATAR_COLORS = ['#7FA862', '#5C8A86', '#B08D57', '#5AA0A0', '#8B5CF6', '#0EA5E9', '#EF4444'];
function avatarColor(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function Bubble({ msg, mine }: { msg: ChatMessage; mine: boolean }) {
  const colors = useColors();
  if (mine) {
    return (
      <View style={[styles.row, { justifyContent: 'flex-end' }]}>
        <View style={[styles.bubble, styles.bubbleMine, { backgroundColor: colors.primary }]}>
          <Text style={[styles.bubbleText, { color: colors.primaryForeground }]}>{msg.body}</Text>
          <Text style={[styles.time, { color: colors.primaryForeground, opacity: 0.6 }]}>{formatTime(msg.createdAt)}</Text>
        </View>
      </View>
    );
  }
  const initials = msg.displayName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={[styles.row, { justifyContent: 'flex-start' }]}>
      <View style={[styles.avatar, { backgroundColor: avatarColor(msg.userId) }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleOther, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sender, { color: colors.accentInk }]}>{msg.displayName}</Text>
        <Text style={[styles.bubbleText, { color: colors.foreground }]}>{msg.body}</Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(msg.createdAt)}</Text>
      </View>
    </View>
  );
}

export default function RunChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { runId } = useLocalSearchParams<{ runId: string }>();
  const { events, userProfile } = useApp();
  const event = events.find(e => e.id === runId);
  const { messages, identity, loading, isLive, send } = useRunChat(runId ?? '', userProfile.name);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    send(text);
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="chevron-left" size={26} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {event?.title ?? 'Run Chat'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
            {event ? `${event.neighborhood} · ${event.displayTime}` : 'Group chat'}
          </Text>
        </View>
        <View style={[styles.livePill, { backgroundColor: isLive ? colors.successSoft : colors.muted }]}>
          <View style={[styles.liveDot, { backgroundColor: isLive ? colors.success : colors.mutedForeground }]} />
          <Text style={{ color: isLive ? colors.success : colors.mutedForeground, fontSize: 10, fontWeight: '700' }}>
            {isLive ? 'LIVE' : 'LOCAL'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => <Bubble msg={item} mine={item.userId === identity?.userId} />}
          contentContainerStyle={[
            styles.listContent,
            { justifyContent: messages.length ? 'flex-end' : 'center', flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
                  <Feather name="message-circle" size={28} color={colors.accentInk} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Say hi to the crew 👋</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Coordinate the meetup point, pace, and parking before the run.
                </Text>
              </View>
            ) : null
          }
        />

        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={text}
            onChangeText={setText}
            placeholder="Message the group…"
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim()}
            activeOpacity={0.8}
            style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.muted }]}
          >
            <Feather name="send" size={18} color={text.trim() ? colors.primaryForeground : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 4,
  },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 1 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  listContent: { padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bubble: { maxWidth: '76%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleMine: { borderBottomRightRadius: 6 },
  bubbleOther: { borderBottomLeftRadius: 6, borderWidth: 1 },
  sender: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  bubbleText: { fontSize: 14, lineHeight: 19 },
  time: { fontSize: 9, marginTop: 4, alignSelf: 'flex-end' },
  empty: { alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 14, maxHeight: 120 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
