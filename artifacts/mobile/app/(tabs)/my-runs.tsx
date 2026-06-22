import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventCard } from '@/components/EventCard';
import { useApp } from '@/context/AppContext';
import { ACHIEVEMENTS, CATEGORY_GRADIENTS, PAST_RUNS, type RunningEvent } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import type { StravaRun } from '@/types/strava';
import { ACCENT_ON_DARK, CARD_SHADOW } from '@/constants/brand';
import { useRouter } from 'expo-router';
import { QRModal } from '@/components/QRModal';

interface CountdownValues { d: number; h: number; m: number }

function Countdown({ date, time }: { date: string; time: string }) {
  const colors = useColors();
  const [left, setLeft] = useState<CountdownValues>({ d: 0, h: 0, m: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(`${date}T${time}:00`).getTime() - Date.now();
      if (diff > 0) {
        setLeft({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff % 86400000) / 3600000),
          m: Math.floor((diff % 3600000) / 60000),
        });
      }
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [date, time]);

  return (
    <View style={styles.countdown}>
      {([['d', 'DAYS'], ['h', 'HRS'], ['m', 'MIN']] as const).map(([key, label], i) => (
        <React.Fragment key={label}>
          <View style={styles.countUnit}>
            <Text style={[styles.countNum, { color: ACCENT_ON_DARK }]}>
              {String(left[key]).padStart(2, '0')}
            </Text>
            <Text style={[styles.countLabel, { color: colors.mutedForeground }]}>{label}</Text>
          </View>
          {i < 2 && <Text style={[styles.countSep, { color: colors.mutedForeground }]}>:</Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

/** Unified run item for the Past tab history list. */
interface PastRunItem {
  id: string;
  title: string;
  location: string;
  date: string;
  distanceKm: number;
  source: 'pace' | 'strava';
}

type Tab = 'saved' | 'upcoming' | 'past';

export default function MyRunsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events, savedEventIds, joinedEventIds, stravaRuns } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [qrEvent, setQrEvent] = useState<RunningEvent | null>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const now = Date.now();
  const savedEvents = events.filter(e => savedEventIds.includes(e.id));
  const joinedEvents = events.filter(e => joinedEventIds.includes(e.id));
  const upcoming = joinedEvents.filter(e => new Date(`${e.date}T${e.time}:00`).getTime() > now);
  const pastJoined = joinedEvents.filter(e => new Date(`${e.date}T${e.time}:00`).getTime() <= now);

  // ── Past tab data (combined PACE + Strava) ────────────────
  const totalKm = PAST_RUNS.reduce((s, r) => s + r.distanceKm, 0)
    + pastJoined.reduce((s, e) => s + parseInt(e.distance), 0)
    + stravaRuns.reduce((s, r) => s + r.distanceKm, 0);

  const totalRuns = PAST_RUNS.length + pastJoined.length + stravaRuns.length;

  // Build a unified history list sorted by date descending
  const allPastRuns: PastRunItem[] = [
    ...PAST_RUNS.map(r => ({
      id: r.id,
      title: r.title,
      location: r.location,
      date: r.date,
      distanceKm: r.distanceKm,
      source: 'pace' as const,
    })),
    ...pastJoined.map(e => ({
      id: `joined_${e.id}`,
      title: e.title,
      location: e.location,
      date: e.date,
      distanceKm: parseInt(e.distance) || 0,
      source: 'pace' as const,
    })),
    ...stravaRuns.map((r: StravaRun) => ({
      id: r.id,
      title: r.title,
      location: r.location || '—',
      date: r.startDate.split('T')[0],
      distanceKm: r.distanceKm,
      source: 'strava' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ── Dynamic achievements (computed from all run data) ──────
  const allDistances = [...PAST_RUNS.map(r => r.distanceKm), ...stravaRuns.map(r => r.distanceKm)];
  const computedAchievements = ACHIEVEMENTS.map(a => {
    switch (a.id) {
      case 'first-run':
        return { ...a, unlocked: totalRuns > 0 };
      case '5km':
        return { ...a, unlocked: allDistances.some(d => d >= 5) };
      case '10km':
        return { ...a, unlocked: allDistances.some(d => d >= 10) };
      case 'social':
        return { ...a, unlocked: joinedEventIds.length >= 5 };
      case 'night-owl':
        // Check if any past run or upcoming event is a Night category
        return { ...a, unlocked: events.some(e => e.category === 'Night' && joinedEventIds.includes(e.id)) };
      default:
        return a;
    }
  });

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'saved', label: 'Saved', count: savedEvents.length },
    { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { key: 'past', label: 'Past', count: totalRuns },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Runs</Text>
        <View style={[styles.toggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {tabs.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.toggleBtn, tab === t.key && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.toggleText, { color: tab === t.key ? colors.primaryForeground : colors.mutedForeground }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'saved' ? (
        savedEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Feather name="heart" size={28} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No saved runs yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Tap the heart icon on any event in Discover to save it here
            </Text>
          </View>
        ) : (
          <FlatList
            data={savedEvents}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <EventCard event={item} />}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : tab === 'upcoming' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}>
          <View style={{ padding: 20 }}>
            {upcoming.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Feather name="calendar" size={28} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No upcoming runs</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Join events from Discover to see them here
                </Text>
              </View>
            ) : upcoming.map(event => (
              <LinearGradient
                key={event.id}
                colors={CATEGORY_GRADIENTS[event.category]}
                style={[styles.upcomingCard, { borderColor: colors.cardBorder }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.upcomingTop}>
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{event.category.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.distText, { color: colors.primary }]}>{event.distance}</Text>
                </View>
                <Text style={styles.upcomingTitle}>{event.title}</Text>
                <View style={styles.upcomingMeta}>
                  <Feather name="map-pin" size={12} color="rgba(255,255,255,0.55)" />
                  <Text style={styles.upcomingMetaText}>{event.location}</Text>
                </View>
                <Countdown date={event.date} time={event.time} />
                <View style={styles.upcomingActions}>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/chat/[runId]', params: { runId: event.id } })}
                    style={styles.upcomingBtn}
                    activeOpacity={0.85}
                  >
                    <Feather name="message-circle" size={13} color={ACCENT_ON_DARK} />
                    <Text style={styles.upcomingBtnText}>Group Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setQrEvent(event)}
                    style={styles.upcomingBtn}
                    activeOpacity={0.85}
                  >
                    <Feather name="maximize" size={13} color={ACCENT_ON_DARK} />
                    <Text style={styles.upcomingBtnText}>Check-in</Text>
                  </TouchableOpacity>
                  {event.hasVoucher && (
                    <View style={styles.voucherChip}>
                      <Feather name="gift" size={11} color={ACCENT_ON_DARK} />
                      <Text style={styles.voucherChipText}>Voucher</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* ── Past Tab ─────────────────────────────────────────── */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}>
          <View style={{ padding: 20 }}>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{totalKm}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total KM</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{totalRuns}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Runs Done</Text>
              </View>
            </View>

            {/* Achievements */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {computedAchievements.map(a => (
                <View
                  key={a.id}
                  style={[
                    styles.achievement,
                    {
                      backgroundColor: a.unlocked ? colors.primarySoft : colors.card,
                      borderColor: a.unlocked ? colors.primaryBorder : colors.border,
                    },
                  ]}
                >
                  <Feather name={a.iconName as any} size={20} color={a.unlocked ? colors.primary : colors.mutedForeground} />
                  <Text style={[styles.achievementTitle, { color: a.unlocked ? colors.foreground : colors.mutedForeground }]}>
                    {a.title}
                  </Text>
                </View>
              ))}
            </View>

            {/* History (combined PACE + Strava) */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>History</Text>
            {allPastRuns.map(r => (
              <View key={r.id} style={[styles.pastRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View
                  style={[
                    styles.pastIcon,
                    r.source === 'strava'
                      ? { backgroundColor: 'rgba(252,76,2,0.1)' }
                      : { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Feather
                    name={r.source === 'strava' ? 'activity' : 'flag'}
                    size={16}
                    color={r.source === 'strava' ? '#FC4C02' : colors.primary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <Text style={[styles.pastTitle, { color: colors.foreground }]}>{r.title}</Text>
                    {r.source === 'strava' && (
                      <View style={styles.stravaSourceChip}>
                        <Text style={styles.stravaSourceText}>STRAVA</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.pastMeta, { color: colors.mutedForeground }]}>{r.location} · {r.date}</Text>
                </View>
                <View
                  style={[
                    styles.pastDist,
                    r.source === 'strava'
                      ? { backgroundColor: 'rgba(252,76,2,0.1)' }
                      : { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Text
                    style={[
                      styles.pastDistText,
                      { color: r.source === 'strava' ? '#FC4C02' : colors.primary },
                    ]}
                  >
                    {r.distanceKm}KM
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <QRModal event={qrEvent} visible={!!qrEvent} onClose={() => setQrEvent(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, gap: 14 },
  title: { fontSize: 24, fontWeight: '700' },
  toggle: { flexDirection: 'row', borderRadius: 10, padding: 3, borderWidth: 1 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  toggleText: { fontSize: 12, fontWeight: '600' },
  listContent: { padding: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  upcomingCard: { ...CARD_SHADOW, borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 1 },
  upcomingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  catBadgeText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600', letterSpacing: 0.8 },
  distText: { fontSize: 13, fontWeight: '700' },
  upcomingTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8, lineHeight: 22 },
  upcomingMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16 },
  upcomingMetaText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  countdown: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  countUnit: { alignItems: 'center', minWidth: 52 },
  countNum: { fontSize: 28, fontWeight: '700' },
  countLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 1.2, marginTop: 2 },
  countSep: { fontSize: 24, fontWeight: '300', marginHorizontal: 2, marginBottom: 14 },
  upcomingActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  upcomingBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(194,224,160,0.4)', backgroundColor: 'rgba(194,224,160,0.14)',
  },
  upcomingBtnText: { color: ACCENT_ON_DARK, fontSize: 11, fontWeight: '600' },
  voucherChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(194,224,160,0.4)', backgroundColor: 'rgba(194,224,160,0.14)',
  },
  voucherChipText: { color: ACCENT_ON_DARK, fontSize: 11, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { ...CARD_SHADOW, flex: 1, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  achievement: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center', gap: 8, width: '47%' },
  achievementTitle: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  pastRow: { ...CARD_SHADOW, flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  pastIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pastTitle: { fontSize: 13, fontWeight: '600' },
  pastMeta: { fontSize: 11 },
  pastDist: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  pastDistText: { fontSize: 12, fontWeight: '700' },
  // Strava-specific styles
  stravaSourceChip: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    backgroundColor: 'rgba(252,76,2,0.12)',
  },
  stravaSourceText: { fontSize: 8, fontWeight: '700', color: '#FC4C02', letterSpacing: 0.6 },
});
