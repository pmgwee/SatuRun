import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreateRunModal } from '@/components/CreateRunModal';
import { useApp } from '@/context/AppContext';
import { PAST_RUNS } from '@/data/mockData';
import { useStrava } from '@/hooks/useStrava';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile, joinedEventIds, hostedCount, events, stravaRuns } = useApp();
  const { connection: stravaConnection, isLoading: stravaLoading, connect, disconnect } = useStrava();
  const [showCreate, setShowCreate] = useState(false);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const totalKm = PAST_RUNS.reduce((s, r) => s + r.distanceKm, 0)
    + stravaRuns.reduce((s, r) => s + r.distanceKm, 0);
  const totalRuns = joinedEventIds.length + PAST_RUNS.length + stravaRuns.length;
  const hostedEvents = events.filter(e => e.isUserCreated);

  const stats = [
    { label: 'Runs Joined', value: totalRuns },
    { label: 'KM Logged', value: totalKm },
    { label: 'Hosted', value: hostedCount },
  ];

  const settingsItems = [
    { icon: 'bell', label: 'Notifications' },
    { icon: 'shield', label: 'Privacy & Safety' },
    { icon: 'help-circle', label: 'Help & Support' },
    { icon: 'info', label: 'About PACE' },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}>
        {/* Banner */}
        <View style={[styles.banner, { paddingTop: topPad + 20, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.bannerTop}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>AC</Text>
            </View>
            <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]}>
              <Feather name="edit-2" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.foreground }]}>{userProfile.name}</Text>
          <View style={styles.roleRow}>
            <Text style={[styles.userRole, { color: colors.mutedForeground }]}>{userProfile.role}</Text>
            {userProfile.isVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(204,255,0,0.1)', borderColor: 'rgba(204,255,0,0.3)' }]}>
                <Feather name="check-circle" size={11} color={colors.primary} />
                <Text style={[styles.verifiedText, { color: colors.primary }]}>Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <React.Fragment key={s.label}>
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: colors.primary }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
                {i < 2 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={{ padding: 20 }}>
          {/* Organizer CTA */}
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={[styles.organizeCta, { borderColor: 'rgba(204,255,0,0.35)', backgroundColor: 'rgba(204,255,0,0.05)' }]}
            activeOpacity={0.8}
          >
            <View style={[styles.organizeIcon, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={20} color={colors.primaryForeground} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.organizeTitle, { color: colors.foreground }]}>Organize a Run</Text>
              <Text style={[styles.organizeSub, { color: colors.mutedForeground }]}>
                Create and publish your own event on the map
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          {/* ── Connected Apps Section ────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Connected Apps</Text>

          {/* Strava */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => {
              if (stravaConnection.isConnected) {
                Alert.alert(
                  'Strava',
                  `Connected as ${stravaConnection.athleteName ?? 'athlete'}.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Disconnect',
                      style: 'destructive',
                      onPress: () => disconnect(),
                    },
                  ],
                );
              } else {
                connect();
              }
            }}
            disabled={stravaLoading}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: 'rgba(252,76,2,0.12)' }]}>
              <Feather name="activity" size={16} color="#FC4C02" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Strava</Text>
              <Text style={[styles.settingSublabel, { color: colors.mutedForeground }]}>
                {stravaConnection.isConnected
                  ? `${stravaRuns.length} runs imported`
                  : 'Connect to import your runs'}
              </Text>
            </View>
            {stravaLoading ? (
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading…</Text>
            ) : stravaConnection.isConnected ? (
              <View style={styles.connectedBadge}>
                <Feather name="check-circle" size={11} color="#CCFF00" />
                <Text style={styles.connectedBadgeText}>Connected</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.connectText, { color: colors.primary }]}>Connect</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>
            )}
          </TouchableOpacity>

          {/* Apple Health */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: 'transparent' }]}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert('Coming Soon', 'Apple Health integration will be available in a future update.')
            }
          >
            <View style={[styles.settingIconWrap, { backgroundColor: 'rgba(255,45,85,0.12)' }]}>
              <Feather name="heart" size={16} color="#FF2D55" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.foreground, opacity: 0.5 }]}>Apple Health</Text>
              <Text style={[styles.settingSublabel, { color: colors.mutedForeground, opacity: 0.5 }]}>
                Sync health & workout data
              </Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>SOON</Text>
            </View>
          </TouchableOpacity>

          {/* Hosted events */}
          {hostedEvents.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>Your Events</Text>
              {hostedEvents.map(event => (
                <View key={event.id} style={[styles.hostedRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.hostedIcon, { backgroundColor: 'rgba(204,255,0,0.08)' }]}>
                    <Feather name="flag" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.hostedTitle, { color: colors.foreground }]}>{event.title}</Text>
                    <Text style={[styles.hostedMeta, { color: colors.mutedForeground }]}>
                      {event.neighborhood} · {event.distance}
                    </Text>
                  </View>
                  <View style={[styles.participantBadge, { backgroundColor: 'rgba(204,255,0,0.08)' }]}>
                    <Text style={[styles.participantBadgeText, { color: colors.primary }]}>
                      {event.participantsCount}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Settings */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account</Text>
          {settingsItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.settingRow, { borderBottomColor: i < settingsItems.length - 1 ? colors.border : 'transparent' }]}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: colors.card }]}>
                <Feather name={item.icon} size={16} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CreateRunModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: { paddingHorizontal: 20, paddingBottom: 24, borderBottomWidth: 1 },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700' },
  editBtn: { padding: 10, borderRadius: 20, borderWidth: 1 },
  userName: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  userRole: { fontSize: 13 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  verifiedText: { fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, height: 36 },
  organizeCta: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 24 },
  organizeIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  organizeTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  organizeSub: { fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  hostedRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  hostedIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  hostedTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  hostedMeta: { fontSize: 11 },
  participantBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  participantBadgeText: { fontSize: 13, fontWeight: '700' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, borderBottomWidth: 1 },
  settingIconWrap: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 0, fontSize: 14 },
  settingSublabel: { fontSize: 11, marginTop: 2 },
  connectedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
    backgroundColor: 'rgba(204,255,0,0.1)',
  },
  connectedBadgeText: { fontSize: 11, fontWeight: '600', color: '#CCFF00' },
  connectText: { fontSize: 13, fontWeight: '600' },
  loadingText: { fontSize: 12 },
  comingSoonBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  comingSoonText: { fontSize: 10, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.8 },
});
