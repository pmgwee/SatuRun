import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreateRunModal } from '@/components/CreateRunModal';
import { useApp } from '@/context/AppContext';
import { PAST_RUNS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile, joinedEventIds, hostedCount, events } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const totalKm = PAST_RUNS.reduce((s, r) => s + r.distanceKm, 0);
  const totalRuns = joinedEventIds.length + PAST_RUNS.length;
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

          {/* Hosted events */}
          {hostedEvents.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Events</Text>
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
  settingLabel: { flex: 1, fontSize: 14 },
});
