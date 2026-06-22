import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { MediaCarousel } from '@/components/MediaCarousel';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { STRAVA_ORANGE } from '@/constants/brand';

function timeAgo(iso: string): string {
  const diff = Date.now() - +new Date(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function PostDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, comments, likedPostIds, savedPostIds, toggleLikePost, toggleSavePost, addComment } = useApp();

  const post = posts.find(p => p.id === id);
  const postComments = useMemo(
    () => comments.filter(c => c.postId === id).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [comments, id],
  );
  const [following, setFollowing] = useState(false);
  const [draft, setDraft] = useState('');

  if (!post) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: colors.mutedForeground }}>This post is no longer available.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const liked = likedPostIds.includes(post.id);
  const saved = savedPostIds.includes(post.id);

  const statCells = post.runStats
    ? [
        { label: 'Distance', value: `${post.runStats.distanceKm.toFixed(1)} km` },
        { label: 'Time', value: post.runStats.durationLabel },
        { label: 'Pace', value: post.runStats.pace.replace(' /km', '/km') },
        ...(post.runStats.elevationM != null
          ? [{ label: 'Elev', value: `${post.runStats.elevationM} m` }]
          : []),
      ]
    : [];

  const onLike = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLikePost(post.id);
  };
  const onSave = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSavePost(post.id);
  };
  const onSend = () => {
    if (!draft.trim()) return;
    addComment(post.id, draft);
    setDraft('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View>
          <MediaCarousel media={post.media} width={width} />
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { top: insets.top + 8 }]}
            hitSlop={8}
          >
            <Feather name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Author */}
          <View style={styles.authorRow}>
            <Avatar uri={post.authorAvatar} initials={post.authorInitials} color={post.authorColor} size={40} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.authorName, { color: colors.foreground }]} numberOfLines={1}>
                  {post.authorName}
                </Text>
                {post.isVerified && <Feather name="check-circle" size={13} color={colors.primary} />}
              </View>
              <Text style={[styles.handle, { color: colors.mutedForeground }]}>{post.authorHandle}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setFollowing(f => !f)}
              style={[
                styles.followBtn,
                {
                  backgroundColor: following ? 'transparent' : colors.primary,
                  borderWidth: following ? 1 : 0,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.followText, { color: following ? colors.primary : colors.primaryForeground }]}>
                {following ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>{post.title}</Text>
          <Text style={[styles.caption, { color: colors.foreground }]}>{post.caption}</Text>

          {post.runStats && (
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statsHeader}>
                <View style={[styles.stravaBadge, { backgroundColor: STRAVA_ORANGE }]}>
                  <Feather name="activity" size={12} color="#fff" />
                </View>
                <Text style={[styles.statsSource, { color: colors.foreground }]}>
                  {post.runStats.source} Activity
                </Text>
              </View>
              <View style={styles.statsRow}>
                {statCells.map(cell => (
                  <View key={cell.label} style={styles.statCell}>
                    <Text style={[styles.statValue, { color: colors.foreground }]}>{cell.value}</Text>
                    <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{cell.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {post.tags.length > 0 && (
            <View style={styles.tags}>
              {post.tags.map(t => (
                <Text key={t} style={[styles.tag, { color: colors.primary }]}>
                  #{t}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.metaRow}>
            {post.location && (
              <View style={[styles.locationChip, { backgroundColor: colors.muted }]}>
                <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                <Text style={[styles.locationText, { color: colors.mutedForeground }]}>{post.location}</Text>
              </View>
            )}
            <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>{timeAgo(post.createdAt)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.commentsHeader, { color: colors.foreground }]}>
            {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
          </Text>

          {postComments.length === 0 ? (
            <Text style={[styles.noComments, { color: colors.mutedForeground }]}>
              No comments yet — say something nice.
            </Text>
          ) : (
            postComments.map(c => (
              <View key={c.id} style={styles.comment}>
                <Avatar uri={c.authorAvatar} initials={c.authorInitials} color={c.authorColor} size={32} textSize={11} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={styles.commentHead}>
                    <Text style={[styles.commentName, { color: colors.foreground }]}>{c.authorName}</Text>
                    <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>{timeAgo(c.createdAt)}</Text>
                  </View>
                  <Text style={[styles.commentBody, { color: colors.foreground }]}>{c.body}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + 10 },
          ]}
        >
          <View style={[styles.inputPill, { backgroundColor: colors.muted }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Add a comment…"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              returnKeyType="send"
              onSubmitEditing={onSend}
            />
            {draft.trim().length > 0 && (
              <TouchableOpacity onPress={onSend} hitSlop={8}>
                <Feather name="send" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.action} onPress={onLike} hitSlop={6}>
            <Feather name="heart" size={22} color={liked ? colors.danger : colors.mutedForeground} />
            <Text style={[styles.actionCount, { color: liked ? colors.danger : colors.mutedForeground }]}>
              {post.likeCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={onSave} hitSlop={6}>
            <Feather name="bookmark" size={22} color={saved ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.actionCount, { color: saved ? colors.primary : colors.mutedForeground }]}>
              {post.savedCount}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20, gap: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  authorName: { fontSize: 14, fontWeight: '700' },
  handle: { fontSize: 12, marginTop: 1 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 18 },
  followText: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  caption: { fontSize: 14, lineHeight: 21 },
  statsCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stravaBadge: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  statsSource: { fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCell: { flex: 1, alignItems: 'flex-start', gap: 2 },
  statValue: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 10, letterSpacing: 0.5, fontWeight: '600', textTransform: 'uppercase' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { fontSize: 13, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  locationText: { fontSize: 11, fontWeight: '500' },
  timestamp: { fontSize: 12 },
  divider: { height: 1, marginVertical: 4 },
  commentsHeader: { fontSize: 14, fontWeight: '700' },
  noComments: { fontSize: 13, paddingVertical: 8 },
  comment: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  commentHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentName: { fontSize: 13, fontWeight: '600' },
  commentTime: { fontSize: 11 },
  commentBody: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    borderRadius: 20,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
  action: { alignItems: 'center', gap: 2 },
  actionCount: { fontSize: 11, fontWeight: '600' },
});
