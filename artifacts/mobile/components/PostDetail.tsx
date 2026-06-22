import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { MediaCarousel } from '@/components/MediaCarousel';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import type { CommunityPost } from '@/data/communityData';

const STRAVA_LOGO = require('../assets/strava.png');

/** Compact relative time, e.g. "3h ago". Shared by the post page and comments. */
export function timeAgo(iso: string): string {
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

interface PostDetailProps {
  post: CommunityPost;
  /** Media + content width (typically the screen width). */
  width: number;
  /** Render the author row (avatar, handle, follow). Default true. */
  showAuthor?: boolean;
  /** Render an inline like / comment / save row. Default false — the post page uses a bottom bar. */
  showActions?: boolean;
  /** Called when the author avatar/name is pressed (e.g. open their profile). */
  onOpenAuthor?: () => void;
  /** Called when the post body / comment count is pressed (e.g. open full post detail). */
  onOpenPost?: () => void;
  /** Optional node rendered over the media (e.g. a back button). */
  overlay?: React.ReactNode;
}

/**
 * Reusable post-detail body: media carousel, optional author row, title,
 * caption, Strava-style run stats, tags, location + timestamp, and an optional
 * inline like/comment/save action row. Used by the post page (with its own
 * comment thread + bottom bar) and by the user profile (showAuthor=false,
 * showActions=true, tapping opens the full post).
 */
export function PostDetail({
  post,
  width,
  showAuthor = true,
  showActions = false,
  onOpenAuthor,
  onOpenPost,
  overlay,
}: PostDetailProps) {
  const colors = useColors();
  const { likedPostIds, savedPostIds, toggleLikePost, toggleSavePost } = useApp();
  const [following, setFollowing] = useState(false);

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

  return (
    <View>
      <View>
        <MediaCarousel media={post.media} width={width} />
        {overlay}
      </View>

      <View style={styles.content}>
        {showAuthor && (
          <View style={styles.authorRow}>
            <TouchableOpacity
              onPress={onOpenAuthor}
              disabled={!onOpenAuthor}
              activeOpacity={0.7}
              style={styles.authorIdentity}
            >
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
            </TouchableOpacity>
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
        )}

        {showActions ? (
          <TouchableOpacity activeOpacity={0.85} onPress={onOpenPost} disabled={!onOpenPost}>
            <Text style={[styles.title, { color: colors.foreground }]}>{post.title}</Text>
            <Text style={[styles.caption, { color: colors.foreground }]} numberOfLines={4}>
              {post.caption}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>{post.title}</Text>
            <Text style={[styles.caption, { color: colors.foreground }]}>{post.caption}</Text>
          </>
        )}

        {post.runStats && (
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statsHeader}>
              <Image source={STRAVA_LOGO} style={styles.stravaBadge} contentFit="cover" />
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

        {showActions && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.action} onPress={onLike} hitSlop={6}>
              <Feather name="heart" size={18} color={liked ? colors.danger : colors.mutedForeground} />
              <Text style={[styles.actionCount, { color: liked ? colors.danger : colors.mutedForeground }]}>
                {post.likeCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={onOpenPost} disabled={!onOpenPost} hitSlop={6}>
              <Feather name="message-circle" size={18} color={colors.mutedForeground} />
              <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>{post.commentCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={onSave} hitSlop={6}>
              <Feather name="bookmark" size={18} color={saved ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.actionCount, { color: saved ? colors.primary : colors.mutedForeground }]}>
                {post.savedCount}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  authorIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  authorName: { fontSize: 14, fontWeight: '700' },
  handle: { fontSize: 12, marginTop: 1 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 18 },
  followText: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  caption: { fontSize: 14, lineHeight: 21 },
  statsCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stravaBadge: { width: 22, height: 22, borderRadius: 6 },
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
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 22, paddingTop: 4 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 13, fontWeight: '600' },
});
