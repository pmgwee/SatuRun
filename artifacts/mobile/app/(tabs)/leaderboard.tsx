import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { INITIAL_EVENTS, ORGANIZERS, getOrganizerLogo, type Organizer } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import { CARD_SHADOW } from '@/constants/brand';

const GOLD = '#FFD700';
const SILVER = '#C0C0C0';
const BRONZE = '#CD7F32';
const RANK_COLORS = [GOLD, SILVER, BRONZE];
const RING_COLORS = ['rgba(255,215,0,0.35)', 'rgba(192,192,192,0.35)', 'rgba(205,127,50,0.35)'];

interface OrgRowProps { org: Organizer; rank: number }

function OrgRow({ org, rank }: OrgRowProps) {
  const colors = useColors();
  const [following, setFollowing] = useState(false);
  const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : colors.mutedForeground;
  const ringColor = rank <= 3 ? RING_COLORS[rank - 1] : 'transparent';
  const logo = getOrganizerLogo(org.handle);

  return (
    <View style={[styles.orgRow, { backgroundColor: colors.card, borderColor: rank <= 3 ? ringColor : colors.border }]}>
      <Text style={[styles.rankNum, { color: rankColor }]}>#{rank}</Text>
      <View style={[styles.orgAvatar, { backgroundColor: org.color, borderWidth: rank <= 3 ? 2 : 0, borderColor: ringColor }]}>
        {logo ? (
          <Image source={logo} style={styles.orgAvatarImg} contentFit="cover" />
        ) : (
          <Text style={styles.orgAvatarText}>{org.initials}</Text>
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={styles.orgNameRow}>
          <Text style={[styles.orgName, { color: colors.foreground }]} numberOfLines={1}>{org.name}</Text>
          {org.isVerified && <Feather name="check-circle" size={12} color={colors.accentInk} style={{ marginLeft: 4 }} />}
        </View>
        <Text style={[styles.orgHandle, { color: colors.mutedForeground }]}>{org.handle}</Text>
        <View style={styles.orgStats}>
          <Text style={[styles.orgRunners, { color: colors.primary }]}>{org.activeRunners.toLocaleString()} runners</Text>
          <View style={[styles.growthBadge, { backgroundColor: colors.primarySoft }]}>
            <Feather name="trending-up" size={10} color={colors.accentInk} />
            <Text style={[styles.growthText, { color: colors.accentInk }]}>+{org.weeklyGrowth}%</Text>
          </View>
        </View>
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
  );
}

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<'organizers' | 'events'>('organizers');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const sortedOrgs = [...ORGANIZERS].sort((a, b) => b.activeRunners - a.activeRunners);
  const topEvents = [...INITIAL_EVENTS].sort((a, b) => b.participantsCount - a.participantsCount).slice(0, 6);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Trending</Text>
        <View style={[styles.toggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(['organizers', 'events'] as const).map(v => (
            <TouchableOpacity
              key={v}
              onPress={() => setView(v)}
              style={[styles.toggleBtn, view === v && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.toggleText, { color: view === v ? colors.primaryForeground : colors.mutedForeground }]}>
                {v === 'organizers' ? 'Organizers' : 'Events'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 90 }}>
        {view === 'organizers' ? (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TOP RUNNING ORGANIZERS THIS MONTH</Text>
            {sortedOrgs.map((org, i) => <OrgRow key={org.id} org={org} rank={i + 1} />)}
          </>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TOP TRENDING EVENTS THIS WEEK</Text>
            {topEvents.map((event, i) => {
              const rankColor = i < 3 ? RANK_COLORS[i] : colors.mutedForeground;
              const fillPct = Math.round((event.participantsCount / event.maxParticipants) * 100);
              return (
                <View key={event.id} style={[styles.eventRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.eventRank, { color: rankColor }]}>#{i + 1}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={2}>{event.title}</Text>
                    <View style={styles.eventMeta}>
                      <View style={[styles.orgDot, { backgroundColor: event.organizerColor }]}>
                        {getOrganizerLogo(event.organizerHandle) ? (
                          <Image source={getOrganizerLogo(event.organizerHandle)!} style={styles.orgDotImg} contentFit="cover" />
                        ) : (
                          <Text style={styles.orgDotText}>{event.organizerInitials}</Text>
                        )}
                      </View>
                      <Text style={[styles.eventOrg, { color: colors.mutedForeground }]}>{event.organizer}</Text>
                      {event.isVerified && <Feather name="check-circle" size={11} color={colors.primary} />}
                    </View>
                    <View style={styles.barRow}>
                      <View style={[styles.bar, { backgroundColor: colors.muted }]}>
                        <View style={[styles.barFill, { width: `${fillPct}%`, backgroundColor: colors.primary }]} />
                      </View>
                      <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{event.participantsCount}</Text>
                    </View>
                  </View>
                  <View style={[styles.distBadge, { backgroundColor: colors.primarySoft }]}>
                    <Text style={[styles.distText, { color: colors.primary }]}>{event.distance}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, gap: 14 },
  title: { fontSize: 24, fontWeight: '700' },
  toggle: { flexDirection: 'row', borderRadius: 10, padding: 3, borderWidth: 1 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  toggleText: { fontSize: 13, fontWeight: '600' },
  sectionLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '600', marginBottom: 14 },
  orgRow: { ...CARD_SHADOW, flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  rankNum: { fontSize: 14, fontWeight: '800', minWidth: 28 },
  orgAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  orgAvatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  orgAvatarImg: { width: '100%', height: '100%' },
  orgNameRow: { flexDirection: 'row', alignItems: 'center' },
  orgName: { fontSize: 14, fontWeight: '700', flex: 1 },
  orgHandle: { fontSize: 11, marginTop: 2, marginBottom: 4 },
  orgStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orgRunners: { fontSize: 11, fontWeight: '600' },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  growthText: { fontSize: 10, fontWeight: '600' },
  followBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18 },
  followText: { fontSize: 12, fontWeight: '600' },
  eventRow: { ...CARD_SHADOW, flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  eventRank: { fontSize: 16, fontWeight: '800', minWidth: 28 },
  eventTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6, lineHeight: 18 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  orgDot: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  orgDotText: { color: '#fff', fontSize: 7, fontWeight: '700' },
  orgDotImg: { width: '100%', height: '100%' },
  eventOrg: { fontSize: 11 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bar: { flex: 1, height: 3, borderRadius: 2 },
  barFill: { height: 3, borderRadius: 2 },
  barLabel: { fontSize: 10 },
  distBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginLeft: 10 },
  distText: { fontSize: 12, fontWeight: '700' },
});
