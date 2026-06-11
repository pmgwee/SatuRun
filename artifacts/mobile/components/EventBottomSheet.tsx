import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { CATEGORY_GRADIENTS, RunningEvent } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

const { height: SCREEN_H } = Dimensions.get('window');
const CLOSED_Y = 480;

interface EventBottomSheetProps {
  event: RunningEvent | null;
  onClose: () => void;
}

export function EventBottomSheet({ event, onClose }: EventBottomSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { savedEventIds, joinedEventIds, toggleSaveEvent, toggleJoinEvent } = useApp();
  const translateY = useSharedValue(CLOSED_Y);

  const isSaved = event ? savedEventIds.includes(event.id) : false;
  const isJoined = event ? joinedEventIds.includes(event.id) : false;

  useEffect(() => {
    if (event) {
      translateY.value = CLOSED_Y;
      translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
    }
  }, [event?.id]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!event) return null;

  const fillPercent = Math.round((event.participantsCount / event.maxParticipants) * 100);
  const gradientColors = CATEGORY_GRADIENTS[event.category];

  const handleJoin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleJoinEvent(event.id);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSaveEvent(event.id);
  };

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, sheetStyle, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <LinearGradient colors={gradientColors} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerTop}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{event.category.toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={handleSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="heart" size={20} color={isSaved ? '#CCFF00' : 'rgba(255,255,255,0.55)'} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>{event.title}</Text>
          <View style={styles.orgRow}>
            <View style={[styles.orgAvatar, { backgroundColor: event.organizerColor }]}>
              <Text style={styles.orgAvatarText}>{event.organizerInitials}</Text>
            </View>
            <Text style={styles.orgName}>{event.organizer}</Text>
            {event.isVerified && (
              <Feather name="check-circle" size={13} color="#CCFF00" style={{ marginLeft: 4 }} />
            )}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.statsRow}>
            {[
              { icon: 'map-pin', label: 'Area', value: event.neighborhood },
              { icon: 'clock', label: 'Time', value: event.displayTime },
              { icon: 'zap', label: 'Pace', value: event.pace },
              { icon: 'navigation', label: 'Dist', value: event.distance },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                <View style={styles.stat}>
                  <Feather name={s.icon as any} size={14} color={colors.mutedForeground} />
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                </View>
                {i < 3 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.progBg, { backgroundColor: colors.muted }]}>
              <View style={[styles.progFill, { width: `${fillPercent}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progText, { color: colors.mutedForeground }]}>
              {event.participantsCount}/{event.maxParticipants} joined
            </Text>
          </View>

          {event.hasVoucher && (
            <View style={[styles.voucherBanner, { backgroundColor: 'rgba(204,255,0,0.07)', borderColor: 'rgba(204,255,0,0.2)' }]}>
              <Feather name="gift" size={14} color="#CCFF00" />
              <Text style={styles.voucherText}>{event.voucherDescription}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleJoin}
            style={[
              styles.joinBtn,
              {
                backgroundColor: isJoined ? 'transparent' : colors.primary,
                borderWidth: isJoined ? 1.5 : 0,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.joinBtnText, { color: isJoined ? colors.primary : colors.primaryForeground }]}>
              {isJoined ? 'Leave Run' : 'Join Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 11,
    overflow: 'hidden',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginTop: 12, marginBottom: 0,
  },
  header: { padding: 20 },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  categoryPillText: {
    color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600', letterSpacing: 0.8,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10, lineHeight: 24 },
  orgRow: { flexDirection: 'row', alignItems: 'center' },
  orgAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  orgAvatarText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  orgName: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  body: { padding: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statLabel: { fontSize: 10, marginTop: 2 },
  statValue: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  statDivider: { width: 1, height: 40, marginHorizontal: 2 },
  progressRow: { marginBottom: 14 },
  progBg: { height: 4, borderRadius: 2, marginBottom: 5 },
  progFill: { height: 4, borderRadius: 2 },
  progText: { fontSize: 11 },
  voucherBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14,
  },
  voucherText: { color: '#CCFF00', fontSize: 12, fontWeight: '500', flex: 1 },
  joinBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  joinBtnText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
});
