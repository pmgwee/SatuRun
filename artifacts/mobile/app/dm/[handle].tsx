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
import { Avatar } from '@/components/Avatar';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { INITIAL_DMS, type DmMessage } from '@/data/dmData';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function DirectMessageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const { posts } = useApp();

  const author = posts.find(p => p.authorHandle === handle);
  const [messages, setMessages] = useState<DmMessage[]>(() =>
    handle && INITIAL_DMS[handle] ? [...INITIAL_DMS[handle]] : [],
  );
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<DmMessage>>(null);

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 80);
    }
  }, [messages.length]);

  const send = () => {
    if (!text.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: `me_${Date.now()}`, from: 'me', body: text.trim(), createdAt: new Date().toISOString() },
    ]);
    setText('');
  };

  const name = author?.authorName ?? 'Direct Message';
  const firstName = name.split(' ')[0];

  const renderItem = ({ item }: { item: DmMessage }) => {
    if (item.from === 'me') {
      return (
        <View style={[styles.row, { justifyContent: 'flex-end' }]}>
          <View style={[styles.bubble, styles.bubbleMine, { backgroundColor: colors.primary }]}>
            <Text style={[styles.bubbleText, { color: colors.primaryForeground }]}>{item.body}</Text>
            <Text style={[styles.time, { color: colors.primaryForeground, opacity: 0.6 }]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.row, { justifyContent: 'flex-start' }]}>
        <View style={styles.bubbleAvatar}>
          <Avatar
            uri={author?.authorAvatar}
            initials={author?.authorInitials ?? '?'}
            color={author?.authorColor ?? colors.muted}
            size={28}
            textSize={11}
          />
        </View>
        <View style={[styles.bubble, styles.bubbleOther, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.bubbleText, { color: colors.foreground }]}>{item.body}</Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="chevron-left" size={26} color={colors.foreground} />
        </TouchableOpacity>
        <Avatar
          uri={author?.authorAvatar}
          initials={author?.authorInitials ?? '?'}
          color={author?.authorColor ?? colors.muted}
          size={38}
          textSize={14}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
              {name}
            </Text>
            {author?.isVerified && <Feather name="check-circle" size={13} color={colors.primary} />}
          </View>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
            Active now
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { flexGrow: 1, justifyContent: messages.length ? 'flex-end' : 'center' }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
                <Feather name="message-circle" size={28} color={colors.accentInk} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Say hi 👋</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                This is the start of your conversation with {firstName}.
              </Text>
            </View>
          }
        />

        <View
          style={[
            styles.inputBar,
            { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            value={text}
            onChangeText={setText}
            placeholder={firstName ? `Message ${firstName}…` : 'Message…'}
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
          <TouchableOpacity
            onPress={send}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 1 },
  listContent: { padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  bubbleAvatar: { marginRight: 8 },
  bubble: { maxWidth: '76%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleMine: { borderBottomRightRadius: 6 },
  bubbleOther: { borderBottomLeftRadius: 6, borderWidth: 1 },
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
