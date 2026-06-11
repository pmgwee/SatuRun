import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QRModal } from '@/components/QRModal';
import { useApp } from '@/context/AppContext';
import { ACHIEVEMENTS, CATEGORY_GRADIENTS, PAST_RUNS, RunningEvent } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

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
            <Text style={[styles.countNum, { color: colors.primary }]}>
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

export default function MyRunsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events, joinedEventIds } = useApp();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [qrEvent, setQrEvent] = useState<RunningEvent | null>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const now = Date.now();
  const joinedEvents = events.filter(e => joinedEventIds.includes(e.id));
  const upcoming = joinedEvents.filter(e => new Date(`${e.date}T${e.time}:00`).getTime() > now);
  const pastJoined = joinedEvents.filter(e => new Date(`${e.date}T${e.time}:00`).getTime() <= now);
  const totalKm = PAST_RUNS.reduce((s, r) => s + r.distanceKm, 0)
    + pastJoined.reduce((s, e) => s + parseInt(e.distance), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Runs</Text>
        <View style={[styles.toggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(['upcoming', 'past'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.toggleBtn, tab === t && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.toggleText, { color: tab === t ? colors.primaryForeground : colors.mutedForeground }]}>
                {t === 'upcoming' ? 'Upcoming' : 'Past'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}>
        {tab === 'upcoming' ? (
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
                  {event.hasVoucher && (
                    <View style={styles.voucherChip}>
                      <Feather name="gift" size={11} color="#CCFF00" />
                      <Text style={styles.voucherChipText}>Voucher</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => setQrEvent(event)}
                    style={styles.qrBtn}
                  >
                    <Feather name="grid" size={13} color="#fff" />
                    <Text style={styles.qrBtnText}>Check-in QR</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            ))}
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{totalKm}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total KM</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{PAST_RUNS.length + pastJoined.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Runs Done</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {ACHIEVEMENTS.map(a => (
                <View
                  key={a.id}
                  style={[
                    styles.achievement,
                    {
                      backgroundColor: a.unlocked ? 'rgba(204,255,0,0.07)' : colors.card,
                      borderColor: a.unlocked ? 'rgba(204,255,0,0.25)' : colors.border,
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

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>History</Text>
            {PAST_RUNS.map(r => (
              <View key={r.id} style={[styles.pastRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.pastIcon, { backgroundColor: 'rgba(204,255,0,0.08)' }]}>
                  <Feather name="activity" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.pastTitle, { color: colors.foreground }]}>{r.title}</Text>
                  <Text style={[styles.pastMeta, { color: colors.mutedForeground }]}>{r.location} · {r.date}</Text>
                </View>
                <View style={[styles.pastDist, { backgroundColor: 'rgba(204,255,0,0.08)' }]}>
                  <Text style={[styles.pastDistText, { color: colors.primary }]}>{r.distanceKm}KM</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
  toggleText: { fontSize: 13, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  upcomingCard: { borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 1 },
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
  upcomingActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  voucherChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(204,255,0,0.3)', backgroundColor: 'rgba(204,255,0,0.08)',
  },
  voucherChipText: { color: '#CCFF00', fontSize: 11, fontWeight: '500' },
  qrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.10)',
  },
  qrBtnText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  achievement: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center', gap: 8, width: '47%' },
  achievementTitle: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  pastRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  pastIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pastTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  pastMeta: { fontSize: 11 },
  pastDist: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  pastDistText: { fontSize: 12, fontWeight: '700' },
});
