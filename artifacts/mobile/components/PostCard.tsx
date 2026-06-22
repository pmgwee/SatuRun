import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { CARD_SHADOW } from '@/constants/brand';

const STRAVA_LOGO = require('../assets/strava.png');
import type { CommunityPost } from '@/data/communityData';

// Clamp cover height so a very tall/wide image never breaks the masonry rhythm.
const MIN_AR = 0.65; // tallest portrait
const MAX_AR = 1.4; // widest landscape

interface PostCardProps {
  post: CommunityPost;
  width: number;
}

export function PostCard({ post, width }: PostCardProps) {
  const colors = useColors();
  const router = useRouter();
  const { likedPostIds, toggleLikePost } = useApp();

  const liked = likedPostIds.includes(post.id);
  const cover = post.media[0];
  const isVideo = cover?.type === 'video';
  const ar = Math.min(MAX_AR, Math.max(MIN_AR, cover?.aspectRatio || 1));
  const coverHeight = Math.round(width / ar);
  const posterUri = isVideo ? cover?.poster : cover?.uri;

  const onLike = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLikePost(post.id);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
      style={[styles.card, { width, backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={{ width, height: coverHeight }}>
        {posterUri ? (
          <Image
            source={typeof posterUri === 'number' ? posterUri : { uri: posterUri }}
            style={styles.cover}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <LinearGradient colors={[colors.primary, colors.accentInk]} style={styles.cover} />
        )}
        {isVideo && (
          <View style={styles.playBadge}>
            <Feather name="play" size={12} color="#fff" />
          </View>
        )}
        {post.media.length > 1 && (
          <View style={styles.countBadge}>
            <Feather name="copy" size={9} color="#fff" />
            <Text style={styles.countText}>{post.media.length}</Text>
          </View>
        )}
        {post.runStats && (
          <View style={styles.statPill}>
            <Image source={STRAVA_LOGO} style={styles.stravaIcon} contentFit="cover" />
            <Text style={styles.statPillText}>
              {post.runStats.distanceKm.toFixed(1)} km · {post.runStats.pace.replace(' /km', '/km')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {post.title}
        </Text>

        <View style={styles.footer}>
          <View style={styles.authorRow}>
            <Avatar uri={post.authorAvatar} initials={post.authorInitials} color={post.authorColor} size={20} textSize={8} />
            <Text style={[styles.authorName, { color: colors.mutedForeground }]} numberOfLines={1}>
              {post.authorName}
            </Text>
            {post.isVerified && <Feather name="check-circle" size={10} color={colors.primary} />}
          </View>

          <TouchableOpacity style={styles.likeBtn} onPress={onLike} hitSlop={8}>
            <Feather
              name="heart"
              size={13}
              color={liked ? colors.danger : colors.mutedForeground}
              style={liked ? undefined : { opacity: 0.9 }}
            />
            <Text style={[styles.likeCount, { color: liked ? colors.danger : colors.mutedForeground }]}>
              {post.likeCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { ...CARD_SHADOW, borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
  cover: { width: '100%', height: '100%', backgroundColor: 'rgba(127,168,98,0.10)' },
  playBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  countText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  statPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  stravaIcon: { width: 14, height: 14, borderRadius: 3 },
  statPillText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  body: { padding: 10, gap: 8 },
  title: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, marginRight: 6 },
  authorName: { fontSize: 11, flexShrink: 1 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likeCount: { fontSize: 11, fontWeight: '600' },
});
