import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { PostDetail } from '@/components/PostDetail';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { getAuthorProfile } from '@/data/communityData';

/** Compact number formatting — 2.4M, 12.5K, 412. */
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${n}`;
}

export default function UserProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const { posts } = useApp();
  const [following, setFollowing] = useState(false);

  const authorPosts = useMemo(() => posts.filter(p => p.authorHandle === handle), [posts, handle]);

  if (authorPosts.length === 0) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: colors.mutedForeground }}>This profile is not available.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ref = authorPosts[0];
  const profile = getAuthorProfile(handle);
  const bio = profile?.bio ?? 'SatuRun community member.';
  const stats = [
    { label: 'Following', value: profile?.following ?? 0 },
    { label: 'Followers', value: profile?.followers ?? 0 },
    { label: 'Likes', value: authorPosts.reduce((sum, p) => sum + p.likeCount, 0) },
  ];
  const latestPosts = [...authorPosts]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 2);

  const openPost = (id: string) => router.push({ pathname: '/post/[id]', params: { id } });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Hero header */}
        <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { top: insets.top + 4 }]}
            hitSlop={8}
          >
            <Feather name="chevron-left" size={26} color={colors.foreground} />
          </TouchableOpacity>

          <View style={styles.heroTop}>
            <Avatar uri={ref.authorAvatar} initials={ref.authorInitials} color={ref.authorColor} size={88} />
            <View style={styles.identity}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                  {ref.authorName}
                </Text>
                {ref.isVerified && <Feather name="check-circle" size={16} color={colors.primary} />}
              </View>
              <Text style={[styles.handle, { color: colors.mutedForeground }]}>{ref.authorHandle}</Text>
            </View>
          </View>

          <Text style={[styles.bio, { color: colors.foreground }]}>{bio}</Text>

          <View style={styles.statsRow}>
            {stats.map(s => (
              <View key={s.label} style={styles.statCell}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{formatCount(s.value)}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => setFollowing(f => !f)}
              style={[
                styles.followBtn,
                {
                  backgroundColor: following ? 'transparent' : colors.primary,
                  borderWidth: following ? 1 : 0,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.followText, { color: following ? colors.foreground : colors.primaryForeground }]}>
                {following ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]}>
              <Feather name="message-circle" size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Posts</Text>

        <View style={styles.posts}>
          {latestPosts.map(p => (
            <View key={p.id} style={[styles.postItem, { borderBottomColor: colors.border }]}>
              <PostDetail
                post={p}
                width={width}
                showAuthor={false}
                showActions
                onOpenPost={() => openPost(p.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute',
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  hero: { paddingHorizontal: 20, paddingBottom: 8 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  identity: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 20, fontWeight: '800' },
  handle: { fontSize: 13, marginTop: 2 },
  bio: { fontSize: 14, lineHeight: 20, marginTop: 14 },
  statsRow: { flexDirection: 'row', gap: 28, marginTop: 16 },
  statCell: { alignItems: 'flex-start' },
  statValue: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  followBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  followText: { fontSize: 14, fontWeight: '700' },
  iconBtn: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, marginVertical: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', paddingHorizontal: 20, marginBottom: 4 },
  posts: { gap: 20 },
  postItem: { borderBottomWidth: StyleSheet.hairlineWidth },
});
