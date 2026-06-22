import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { CATEGORY_GRADIENTS, RunningEvent, getOrganizerLogo } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';
import { ACCENT_ON_DARK } from '@/constants/brand';

const CATEGORY_COLORS: Record<string, string> = {
  Tempo: '#6E9B7A',
  Easy: '#7FA862',
  Trail: '#B08D57',
  Interval: '#C97B5A',
  Night: '#5C8A86',
  Community: '#5AA0A0',
};

interface EventBottomSheetProps {
  events: RunningEvent[];
  neighborhood: string;
  onClose: () => void;
}

function EventDetailView({
  event,
  onBack,
  onClose,
}: {
  event: RunningEvent;
  onBack: () => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { savedEventIds, joinedEventIds, toggleSaveEvent, toggleJoinEvent } = useApp();
  const isSaved = savedEventIds.includes(event.id);
  const isJoined = joinedEventIds.includes(event.id);

  const handleChat = () => {
    Haptics.selectionAsync();
    router.push({ pathname: '/chat/[runId]', params: { runId: event.id } });
    onClose();
  };
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
    <View style={{ flex: 1 }}>
      <View style={[styles.detailNav, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="chevron-left" size={20} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>All Runs</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="heart" size={20} color={isSaved ? colors.accentInk : colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <LinearGradient colors={gradientColors} style={styles.detailHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{event.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.detailTitle}>{event.title}</Text>
          <View style={styles.orgRow}>
            <View style={[styles.orgAvatar, { backgroundColor: event.organizerColor }]}>
              {getOrganizerLogo(event.organizerHandle) ? (
                <Image source={getOrganizerLogo(event.organizerHandle)!} style={styles.orgAvatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.orgAvatarText}>{event.organizerInitials}</Text>
              )}
            </View>
            <Text style={styles.orgName}>{event.organizer}</Text>
            {event.isVerified && <Feather name="check-circle" size={13} color={ACCENT_ON_DARK} style={{ marginLeft: 4 }} />}
          </View>
        </LinearGradient>

        <View style={[styles.detailBody, { paddingBottom: insets.bottom + 20 }]}>
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
            <View style={[styles.voucherBanner, { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder }]}>
              <Feather name="gift" size={14} color={colors.accentInk} />
              <Text style={[styles.voucherText, { color: colors.accentInk }]}>{event.voucherDescription}</Text>
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

          {isJoined && (
            <TouchableOpacity
              onPress={handleChat}
              activeOpacity={0.85}
              style={[styles.chatBtn, { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder }]}
            >
              <Feather name="message-circle" size={16} color={colors.accentInk} />
              <Text style={[styles.chatBtnText, { color: colors.accentInk }]}>Open Group Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export function EventBottomSheet({ events, neighborhood, onClose }: EventBottomSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedEvent, setSelectedEvent] = useState<RunningEvent | null>(null);
  const translateY = useSharedValue(600);

  useEffect(() => {
    translateY.value = 600;
    translateY.value = withSpring(0, { damping: 24, stiffness: 240 });
  }, [neighborhood]);

  const close = useCallback(() => {
    translateY.value = withTiming(600, { duration: 260 });
    setTimeout(onClose, 240);
  }, [onClose]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetY(-5)
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 110 || e.velocityY > 900) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, { damping: 24, stiffness: 240 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <>
      <Pressable style={styles.backdrop} onPress={close} />
      <Animated.View
        style={[
          styles.sheet,
          sheetStyle,
          {
            backgroundColor: colors.card,
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 20,
          },
        ]}
      >
        {selectedEvent ? (
          <EventDetailView
            event={selectedEvent}
            onBack={() => setSelectedEvent(null)}
            onClose={close}
          />
        ) : (
          <>
            {/* Drag handle — pan gesture only on this area */}
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleArea}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
                <View style={styles.areaHeader}>
                  <View>
                    <Text style={[styles.areaTitle, { color: colors.foreground }]}>
                      {neighborhood}
                    </Text>
                    <Text style={[styles.areaSubtitle, { color: colors.mutedForeground }]}>
                      {events.length} run{events.length !== 1 ? 's' : ''} in this area
                    </Text>
                  </View>
                  <TouchableOpacity onPress={close} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
                    <Feather name="x" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>
            </GestureDetector>

            {/* Scrollable events list */}
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              bounces={true}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            >
              {events.map((event, index) => {
                const catColor = CATEGORY_COLORS[event.category] ?? colors.primary;
                const fillPct = Math.round((event.participantsCount / event.maxParticipants) * 100);
                return (
                  <TouchableOpacity
                    key={event.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedEvent(event);
                    }}
                    activeOpacity={0.75}
                    style={[
                      styles.eventRow,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        marginTop: index === 0 ? 4 : 10,
                      },
                    ]}
                  >
                    <View style={[styles.catBar, { backgroundColor: catColor }]} />
                    <View style={{ flex: 1, paddingLeft: 12 }}>
                      <View style={styles.eventRowTop}>
                        <View style={[styles.eventCatChip, { backgroundColor: `${catColor}18`, borderColor: `${catColor}40` }]}>
                          <Text style={[styles.eventCatText, { color: catColor }]}>{event.category}</Text>
                        </View>
                        {event.hasVoucher && (
                          <View style={[styles.voucherChip, { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder }]}>
                            <Feather name="gift" size={10} color={colors.accentInk} />
                            <Text style={[styles.voucherChipText, { color: colors.accentInk }]}>Voucher</Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }} />
                        <Text style={[styles.eventDist, { color: colors.primary }]}>{event.distance}</Text>
                      </View>

                      <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={2}>
                        {event.title}
                      </Text>

                      <View style={styles.eventMeta}>
                        <View style={[styles.miniAvatar, { backgroundColor: event.organizerColor }]}>
                          {getOrganizerLogo(event.organizerHandle) ? (
                            <Image source={getOrganizerLogo(event.organizerHandle)!} style={styles.miniAvatarImg} contentFit="cover" />
                          ) : (
                            <Text style={styles.miniAvatarText}>{event.organizerInitials}</Text>
                          )}
                        </View>
                        <Text style={[styles.eventOrg, { color: colors.mutedForeground }]} numberOfLines={1}>
                          {event.organizer}
                        </Text>
                        {event.isVerified && <Feather name="check-circle" size={11} color={colors.primary} />}
                        <Text style={[styles.eventTime, { color: colors.mutedForeground }]}>· {event.displayTime}</Text>
                      </View>

                      <View style={styles.eventRowBottom}>
                        <View style={[styles.miniBar, { backgroundColor: colors.muted }]}>
                          <View style={[styles.miniBarFill, { width: `${fillPct}%`, backgroundColor: catColor }]} />
                        </View>
                        <Text style={[styles.spotsText, { color: colors.mutedForeground }]}>
                          {event.maxParticipants - event.participantsCount} spots left
                        </Text>
                      </View>
                    </View>

                    <View style={styles.chevronWrap}>
                      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 11,
    overflow: 'hidden',
  },
  handleArea: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginTop: 12, marginBottom: 14,
  },
  areaHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 2,
  },
  areaTitle: { fontSize: 20, fontWeight: '700' },
  areaSubtitle: { fontSize: 12, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  eventRow: {
    flexDirection: 'row', alignItems: 'stretch',
    borderRadius: 14, borderWidth: 1, overflow: 'hidden',
    paddingVertical: 12, paddingRight: 10,
  },
  catBar: { width: 3, borderRadius: 2, marginLeft: 0 },
  eventRowTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  eventCatChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  eventCatText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  voucherChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  voucherChipText: { fontSize: 9, fontWeight: '600' },
  eventDist: { fontSize: 12, fontWeight: '700' },
  eventTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 6 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  miniAvatar: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  miniAvatarText: { color: '#fff', fontSize: 6, fontWeight: '700' },
  miniAvatarImg: { width: '100%', height: '100%' },
  eventOrg: { fontSize: 11, flex: 1 },
  eventTime: { fontSize: 11 },
  eventRowBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniBar: { flex: 1, height: 3, borderRadius: 2 },
  miniBarFill: { height: 3, borderRadius: 2 },
  spotsText: { fontSize: 10 },
  chevronWrap: { alignItems: 'center', justifyContent: 'center', paddingLeft: 6 },

  detailNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 15, fontWeight: '500' },
  detailHeader: { padding: 20 },
  categoryPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignSelf: 'flex-start', marginBottom: 12 },
  categoryPillText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600', letterSpacing: 0.8 },
  detailTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10, lineHeight: 24 },
  orgRow: { flexDirection: 'row', alignItems: 'center' },
  orgAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8, overflow: 'hidden' },
  orgAvatarText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  orgAvatarImg: { width: '100%', height: '100%' },
  orgName: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  detailBody: { padding: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statLabel: { fontSize: 10, marginTop: 2 },
  statValue: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  statDivider: { width: 1, height: 40, marginHorizontal: 2 },
  progressRow: { marginBottom: 14 },
  progBg: { height: 4, borderRadius: 2, marginBottom: 5 },
  progFill: { height: 4, borderRadius: 2 },
  progText: { fontSize: 11 },
  voucherBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  voucherText: { fontSize: 12, fontWeight: '500', flex: 1 },
  joinBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  joinBtnText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, marginTop: 10, borderWidth: 1.5 },
  chatBtnText: { fontSize: 14, fontWeight: '700' },
});
