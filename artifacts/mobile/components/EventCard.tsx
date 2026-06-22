import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import { CATEGORY_GRADIENTS, RunningEvent } from '@/data/mockData';
import { PARTNERS } from '@/data/rewardsData';
import { useColors } from '@/hooks/useColors';
import { ACCENT_ON_DARK, ACCENT_ON_DARK_INK } from '@/constants/brand';

interface EventCardProps {
  event: RunningEvent;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const colors = useColors();
  const { savedEventIds, joinedEventIds, toggleSaveEvent, toggleJoinEvent } = useApp();
  const isSaved = savedEventIds.includes(event.id);
  const isJoined = joinedEventIds.includes(event.id);
  const gradientColors = CATEGORY_GRADIENTS[event.category];
  const fillPercent = Math.round((event.participantsCount / event.maxParticipants) * 100);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSaveEvent(event.id);
  };

  const handleJoin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleJoinEvent(event.id);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.container, { borderColor: colors.cardBorder }]}>
      <LinearGradient colors={gradientColors} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category.toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={handleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="heart" size={18} color={isSaved ? ACCENT_ON_DARK : 'rgba(255,255,255,0.45)'} />
          </TouchableOpacity>
        </View>
        <View style={styles.orgRow}>
          {(() => {
            const handle = event.organizerHandle.replace('@', '');
            const partnerLogo = PARTNERS.find(p =>
              handle === p.handle ||
              event.organizer === p.name,
            )?.logoUri;
            return partnerLogo ? (
              <Image source={typeof partnerLogo === 'number' ? partnerLogo : { uri: partnerLogo }} style={styles.orgLogo} resizeMode="cover" />
            ) : (
              <View style={[styles.orgAvatar, { backgroundColor: event.organizerColor }]}>
                <Text style={styles.orgInitials}>{event.organizerInitials}</Text>
              </View>
            );
          })()}
          <View style={{ flex: 1, marginLeft: 8 }}>
            <View style={styles.orgNameRow}>
              <Text style={styles.orgName} numberOfLines={1}>{event.organizer}</Text>
              {event.isVerified && <Feather name="check-circle" size={12} color={ACCENT_ON_DARK} style={{ marginLeft: 4 }} />}
            </View>
            <Text style={styles.orgHandle}>{event.organizerHandle}</Text>
          </View>
          <View style={[styles.distBadge, { backgroundColor: ACCENT_ON_DARK }]}>
            <Text style={styles.distText}>{event.distance}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.details, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.neighborhood}</Text>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <Feather name="calendar" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.displayTime}</Text>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <Feather name="zap" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.pace}</Text>
        </View>

        {event.hasVoucher && (
          <View style={[styles.voucherRow, { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder }]}>
            <Feather name="gift" size={11} color={colors.accentInk} />
            <Text style={[styles.voucherText, { color: colors.accentInk }]} numberOfLines={1}>{event.voucherDescription}</Text>
          </View>
        )}

        <View style={styles.bottomRow}>
          <View style={{ flex: 1 }}>
            <View style={[styles.progBg, { backgroundColor: colors.muted }]}>
              <View style={[styles.progFill, { width: `${fillPercent}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.participantsText, { color: colors.mutedForeground }]}>
              {event.participantsCount}/{event.maxParticipants} joined
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleJoin}
            style={[
              styles.joinBtn,
              {
                backgroundColor: isJoined ? 'transparent' : colors.primary,
                borderWidth: isJoined ? 1 : 0,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.joinBtnText, { color: isJoined ? colors.primary : colors.primaryForeground }]}>
              {isJoined ? 'Joined' : 'Join Run'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1 },
  gradient: { padding: 16, paddingBottom: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  categoryText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  orgRow: { flexDirection: 'row', alignItems: 'center' },
  orgAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  orgLogo: { width: 32, height: 32, borderRadius: 16 },
  orgInitials: { color: '#fff', fontSize: 12, fontWeight: '700' },
  orgNameRow: { flexDirection: 'row', alignItems: 'center' },
  orgName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  orgHandle: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  distBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  distText: { fontSize: 12, fontWeight: '700', color: ACCENT_ON_DARK_INK },
  details: { padding: 14 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 8, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', rowGap: 4, columnGap: 4, marginBottom: 8 },
  metaText: { fontSize: 11 },
  dot: { width: 3, height: 3, borderRadius: 1.5 },
  voucherRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  voucherText: { fontSize: 11, fontWeight: '500', flex: 1 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progBg: { height: 3, borderRadius: 2, marginBottom: 4 },
  progFill: { height: 3, borderRadius: 2 },
  participantsText: { fontSize: 10 },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20 },
  joinBtnText: { fontSize: 13, fontWeight: '600' },
});
