import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostCard } from '@/components/PostCard';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { splitIntoColumns, type FeedFilter } from '@/data/communityData';

const FILTERS: { key: FeedFilter; label: string }[] = [
  { key: 'discover', label: 'Discover' },
  { key: 'following', label: 'Following' },
  { key: 'nearby', label: 'Nearby' },
];

const FOLLOWING_IDS = new Set(['p1', 'p3']);
const NEARBY_IDS = new Set(['p2', 'p5']);

const H_PADDING = 20;
const COL_GAP = 12;

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { posts } = useApp();
  const [filter, setFilter] = useState<FeedFilter>('discover');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const columnWidth = (width - H_PADDING * 2 - COL_GAP) / 2;

  const filtered = useMemo(() => {
    const sorted = [...posts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (filter === 'following') return sorted.filter(p => FOLLOWING_IDS.has(p.id));
    if (filter === 'nearby') return sorted.filter(p => NEARBY_IDS.has(p.id));
    return sorted;
  }, [posts, filter]);

  const [leftCol, rightCol] = useMemo(
    () => splitIntoColumns(filtered, columnWidth),
    [filtered, columnWidth],
  );

  const openCreate = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/post/create');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Community</Text>
        <View style={styles.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.pill,
                {
                  backgroundColor: filter === f.key ? colors.primary : colors.card,
                  borderColor: filter === f.key ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: filter === f.key ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingTop: 16, paddingBottom: insets.bottom + 100 }}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="image" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing here yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Be the first to share a run with the community.
            </Text>
          </View>
        ) : (
          <View style={styles.masonry}>
            <View style={{ width: columnWidth }}>
              {leftCol.map(post => (
                <PostCard key={post.id} post={post} width={columnWidth} />
              ))}
            </View>
            <View style={{ width: columnWidth }}>
              {rightCol.map(post => (
                <PostCard key={post.id} post={post} width={columnWidth} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={openCreate}
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 80 }]}
      >
        <Feather name="plus" size={26} color={colors.primaryForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, gap: 14 },
  title: { fontSize: 24, fontWeight: '700' },
  filters: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 13, fontWeight: '600' },
  masonry: { flexDirection: 'row', justifyContent: 'space-between' },
  empty: { alignItems: 'center', gap: 10, paddingTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center', maxWidth: 240 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
