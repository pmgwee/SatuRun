import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import {
  CHECK_IN_REWARDS,
  IMAGES,
  PARTNERS,
  VOUCHER_TEMPLATES,
  computeMissionProgress,
  daysUntil,
  formatPoints,
  getTodayString,
  type Mission,
  type Partner,
  type VoucherTemplate,
} from '@/data/rewardsData';
import { ACCENT_ON_DARK, CARD_SHADOW } from '@/constants/brand';

type RewardTab = 'missions' | 'redeem' | 'my-rewards';
type VoucherFilter = 'active' | 'past';

export default function RewardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    userPoints,
    checkInStreak,
    lastCheckInDate,
    missions,
    userVouchers,
    stravaRuns,
    joinedEventIds,
    checkIn,
    startMission,
    claimMissionReward,
    redeemVoucher,
    useVoucher,
  } = useApp();

  const [activeTab, setActiveTab] = useState<RewardTab>('missions');
  const [voucherFilter, setVoucherFilter] = useState<VoucherFilter>('active');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  // ── Derived data ───────────────────────────────────────────────
  const computedMissions = missions.map(m =>
    computeMissionProgress(m, stravaRuns, joinedEventIds.length),
  );
  const isCheckedInToday = lastCheckInDate === getTodayString();
  const currentCheckInDay = checkInStreak % 7;
  const activeVouchers = userVouchers.filter(v => v.status === 'active');
  const pastVouchers = userVouchers.filter(v => v.status === 'used' || v.status === 'expired');

  const templatesByPartner = VOUCHER_TEMPLATES.reduce<Record<string, VoucherTemplate[]>>(
    (acc, t) => {
      (acc[t.partnerName] ??= []).push(t);
      return acc;
    },
    {},
  );

  const rewardTabs: { key: RewardTab; label: string }[] = [
    { key: 'missions', label: 'Missions' },
    { key: 'redeem', label: 'Redeem' },
    { key: 'my-rewards', label: 'My Rewards' },
  ];

  // ── Render ─────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>SatuRun Points</Text>

        {/* Points Hero */}
        <View style={styles.pointsHero}>
          <View style={[styles.pointsCircle, { backgroundColor: colors.card, borderColor: colors.primaryBorder }]}>
            <View style={styles.pointsRing}>
              <Feather name="zap" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.pointsNumber, { color: colors.primary }]}>
              {formatPoints(userPoints)}
            </Text>
            <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>POINTS</Text>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {rewardTabs.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={styles.tabBtn}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === t.key ? colors.primary : colors.mutedForeground },
                ]}
              >
                {t.label}
              </Text>
              {activeTab === t.key && (
                <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Content ────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={{ padding: 20 }}>
          {activeTab === 'missions' && renderMissions()}
          {activeTab === 'redeem' && renderRedeem()}
          {activeTab === 'my-rewards' && renderMyRewards()}
        </View>
      </ScrollView>
    </View>
  );

  // ── Missions Tab ───────────────────────────────────────────────
  function renderMissions() {
    return (
      <>
        {/* Hero running banner */}
        <View style={[styles.heroBanner, { borderColor: colors.cardBorder }]}>
          <Image
            source={{ uri: IMAGES.runHero }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Feather name="zap" size={20} color={ACCENT_ON_DARK} />
            <Text style={styles.heroTitle}>Run. Earn. Redeem.</Text>
            <Text style={styles.heroSubtitle}>Complete missions & check in daily to earn SatuRun Points</Text>
          </View>
        </View>

        {/* Daily Check-in Card */}
        <View style={[styles.checkInCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.checkInHeader}>
            <Text style={[styles.checkInTitle, { color: colors.foreground }]}>Daily Check-in</Text>
            <TouchableOpacity>
              <Feather name="info" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* 7-day circles */}
          <View style={styles.checkInDays}>
            {CHECK_IN_REWARDS.map((pts, i) => {
              const isCompleted = i < currentCheckInDay;
              const isTodayDone = i === currentCheckInDay && isCheckedInToday;
              const isCurrent = i === currentCheckInDay && !isCheckedInToday;
              const isFuture = i > currentCheckInDay;

              return (
                <View key={i} style={styles.dayItem}>
                  <View
                    style={[
                      styles.dayCircle,
                      {
                        backgroundColor: isCompleted || isTodayDone
                          ? colors.primary
                          : isCurrent
                          ? colors.primarySoft
                          : colors.muted,
                        borderWidth: isCurrent ? 2 : 0,
                        borderColor: isCurrent ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayPoints,
                        {
                          color: isCompleted || isTodayDone
                            ? colors.primaryForeground
                            : isCurrent
                            ? colors.primary
                            : colors.mutedForeground,
                          fontSize: isCompleted || isTodayDone ? 13 : 11,
                        },
                      ]}
                    >
                      {isCompleted || isTodayDone ? '✓' : `+${pts}`}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      { color: isCurrent || isTodayDone ? colors.primary : colors.mutedForeground },
                    ]}
                  >
                    Day {i + 1}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Check-in button */}
          <TouchableOpacity
            onPress={checkIn}
            disabled={isCheckedInToday}
            activeOpacity={0.8}
            style={[
              styles.checkInBtn,
              { backgroundColor: isCheckedInToday ? colors.muted : colors.primary },
            ]}
          >
            <Text
              style={[
                styles.checkInBtnText,
                { color: isCheckedInToday ? colors.mutedForeground : colors.primaryForeground },
              ]}
            >
              {isCheckedInToday
                ? '✓ Checked in today!'
                : `Check In — Earn ${CHECK_IN_REWARDS[currentCheckInDay]} pts`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section title */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>
          Complete missions &amp; earn SatuRun Points
        </Text>

        {/* Mission grid (2-column) */}
        <View style={styles.missionsGrid}>
          {computedMissions.map(mission => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onStart={() => startMission(mission.id)}
              onClaim={() => claimMissionReward(mission.id)}
            />
          ))}
        </View>

        {/* How It Works */}
        <View style={[styles.howItWorks, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 16 }]}>
            How It Works
          </Text>
          {[
            { icon: 'play-circle', text: 'Start Running Missions' },
            { icon: 'target', text: 'Complete Running Challenges' },
            { icon: 'check-circle', text: 'Earn Points & Redeem Rewards' },
          ].map((step, i) => (
            <View key={i} style={styles.howStep}>
              <View style={[styles.howIcon, { backgroundColor: colors.primarySoft }]}>
                <Feather name={step.icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={{ color: colors.mutedForeground, fontSize: 13, flex: 1 }}>
                {step.text}
              </Text>
              <View style={[styles.howNum, { backgroundColor: colors.muted }]}>
                <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '700' }}>
                  {i + 1}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </>
    );
  }

  // ── Redeem Tab ─────────────────────────────────────────────────
  function renderRedeem() {
    return (
      <>
        {/* Balance reminder */}
        <View style={[styles.balanceBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Your Balance</Text>
          <Text style={[styles.balancePoints, { color: colors.primary }]}>
            {formatPoints(userPoints)} Points
          </Text>
        </View>

        {/* Partner sections */}
        {Object.entries(templatesByPartner).map(([partner, templates]) => {
          const partnerInfo: Partner | undefined = PARTNERS.find(p => p.name === partner);
          const hasElite = templates.some(t => t.isElite);
          return (
            <View key={partner} style={{ marginBottom: 8 }}>
              {/* Partner header */}
              <View style={styles.partnerHeader}>
                <View
                  style={[
                    styles.partnerDot,
                    { backgroundColor: `${partnerInfo?.color ?? '#888'}20` },
                  ]}
                >
                  {partnerInfo?.logoUri ? (
                    <Image
                      source={typeof partnerInfo.logoUri === 'number' ? partnerInfo.logoUri : { uri: partnerInfo.logoUri }}
                      style={styles.partnerLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={{ color: `${partnerInfo?.color ?? '#888'}`, fontSize: 11, fontWeight: '700' }}>
                      {partnerInfo?.initials ?? '?'}
                    </Text>
                  )}
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.partnerName, { color: colors.foreground }]}>{partner}</Text>
                  {hasElite && (
                    <Text style={{ color: '#F59E0B', fontSize: 10, fontWeight: '600', marginTop: 1 }}>
                      ⭐ Elite Exclusive
                    </Text>
                  )}
                </View>
              </View>

              {/* Reward cards */}
              {templates.map(template => (
                <View
                  key={template.id}
                  style={[styles.redeemCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  {/* Product image or colored band */}
                  {template.imageUri ? (
                    <View style={styles.redeemImageWrap}>
                      <Image
                        source={{ uri: template.imageUri }}
                        style={styles.redeemImage}
                        resizeMode="cover"
                      />
                      <View style={styles.redeemImageOverlay} />
                      <View style={styles.redeemImageText}>
                        <Text style={styles.redeemTopTitle}>{template.title}</Text>
                        <Text style={styles.redeemTopDesc}>{template.description}</Text>
                      </View>
                      {template.isElite && (
                        <View style={[styles.eliteChip, { position: 'absolute', top: 10, right: 10 }]}>
                          <Text style={styles.eliteChipText}>⭐ ELITE</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                  <View
                    style={[styles.redeemTop, { backgroundColor: partnerInfo?.color ?? '#333' }]}
                  >
                    <View style={styles.redeemTopContent}>
                      <View>
                        <Text style={styles.redeemTopTitle}>{template.title}</Text>
                        <Text style={styles.redeemTopDesc}>{template.description}</Text>
                      </View>
                      {template.isElite && (
                        <View style={styles.eliteChip}>
                          <Text style={styles.eliteChipText}>⭐ ELITE</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  )}

                  {/* Bottom: points + redeem */}
                  <View style={styles.redeemBottom}>
                    <View style={styles.redeemInfoCol}>
                      <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>Redeem With</Text>
                      <View style={styles.redeemPointsRow}>
                        <View style={[styles.miniIcon, { backgroundColor: colors.primarySoft }]}>
                          <Feather name="zap" size={9} color={colors.primary} />
                        </View>
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>
                          {template.pointsCost} pts
                        </Text>
                      </View>
                    </View>
                    <View style={styles.redeemInfoCol}>
                      <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>Reward</Text>
                      <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 14 }}>
                        {template.rewardValue}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => redeemVoucher(template.id)}
                      disabled={userPoints < template.pointsCost}
                      activeOpacity={0.8}
                      style={[
                        styles.redeemBtn,
                        {
                          backgroundColor: userPoints >= template.pointsCost
                            ? colors.primary
                            : colors.muted,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.redeemBtnText,
                          {
                            color: userPoints >= template.pointsCost
                              ? colors.primaryForeground
                              : colors.mutedForeground,
                          },
                        ]}
                      >
                        {userPoints >= template.pointsCost ? 'Redeem' : 'Not Enough'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </>
    );
  }

  // ── My Rewards (Voucher Wallet) ────────────────────────────────
  function renderMyRewards() {
    const filtered = voucherFilter === 'active' ? activeVouchers : pastVouchers;

    return (
      <>
        {/* Active / Past toggle */}
        <View style={[styles.voucherToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(['active', 'past'] as const).map(vf => (
            <TouchableOpacity
              key={vf}
              onPress={() => setVoucherFilter(vf)}
              style={[styles.voucherToggleBtn, voucherFilter === vf && { backgroundColor: colors.primary }]}
            >
              <Text
                style={{
                  color: voucherFilter === vf ? colors.primaryForeground : colors.mutedForeground,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {vf === 'active' ? `Active (${activeVouchers.length})` : `Past (${pastVouchers.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Voucher list */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Feather name="tag" size={28} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No {voucherFilter === 'active' ? 'active' : 'past'} vouchers
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {voucherFilter === 'active'
                ? 'Redeem rewards with your SatuRun Points'
                : 'Your used and expired vouchers will appear here'}
            </Text>
          </View>
        ) : (
          filtered.map(v => {
            // Find matching template for the product image
            const tpl = VOUCHER_TEMPLATES.find(t => t.id === v.templateId);
            return (
            <View
              key={v.id}
              style={[
                styles.voucherCard,
                {
                  backgroundColor: colors.card,
                  borderColor: v.status === 'active' ? `${v.partnerColor}40` : colors.cardBorder,
                  opacity: v.status === 'active' ? 1 : 0.75,
                },
              ]}
            >
              {/* Top: image + partner + title */}
              <View style={styles.voucherTop}>
                {tpl?.imageUri ? (
                  <Image
                    source={{ uri: tpl.imageUri }}
                    style={styles.vImage}
                    resizeMode="cover"
                  />
                ) : (() => {
                  const partnerInfo = PARTNERS.find(p => p.name === v.partnerName);
                  return partnerInfo?.logoUri ? (
                    <Image
                      source={typeof partnerInfo.logoUri === 'number' ? partnerInfo.logoUri : { uri: partnerInfo.logoUri }}
                      style={styles.vImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.vPartnerBadge, { backgroundColor: `${v.partnerColor}18` }]}>
                      <Text style={{ color: v.partnerColor, fontSize: 11, fontWeight: '700' }}>
                        {v.partnerInitials}
                      </Text>
                    </View>
                  );
                })()
                }
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: v.partnerColor, fontSize: 11, fontWeight: '600' }}>
                    {v.partnerName}
                  </Text>
                  <Text style={[styles.vTitle, { color: colors.foreground }]}>{v.title}</Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{v.description}</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={[styles.vDivider, { backgroundColor: colors.border }]} />

              {/* Bottom: validity + status */}
              <View style={styles.voucherBottom}>
                <View style={styles.vInfoRow}>
                  <Feather name="clock" size={12} color={colors.mutedForeground} />
                  <Text style={{ color: colors.mutedForeground, fontSize: 11, marginLeft: 4 }}>
                    {v.status === 'active'
                      ? `${daysUntil(v.expiresAt)} days left`
                      : v.status === 'used'
                      ? 'Used'
                      : 'Expired'}
                  </Text>
                </View>
                {v.minSpend && (
                  <View style={styles.vInfoRow}>
                    <Feather name="tag" size={12} color={colors.mutedForeground} />
                    <Text style={{ color: colors.mutedForeground, fontSize: 11, marginLeft: 4 }}>
                      Min. {v.minSpend}
                    </Text>
                  </View>
                )}
                {v.status === 'active' ? (
                  <TouchableOpacity
                    style={[styles.useBtn, { backgroundColor: v.partnerColor }]}
                    activeOpacity={0.8}
                    onPress={() =>
                      Alert.alert(
                        'Use voucher?',
                        `Redeem "${v.title}" at ${v.partnerName} now? This marks it as used.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Use Now', onPress: () => useVoucher(v.id) },
                        ],
                      )
                    }
                  >
                    <Text style={styles.useBtnText}>Use Now</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          v.status === 'used' ? colors.successSoft : colors.dangerSoft,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: v.status === 'used' ? colors.success : colors.danger,
                        fontSize: 11,
                        fontWeight: '600',
                      }}
                    >
                      {v.status === 'used' ? '✓ Used' : 'Expired'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
          })
        )}
      </>
    );
  }
}

// ── Mission Card sub-component ─────────────────────────────────

function MissionCard({
  mission,
  onStart,
  onClaim,
}: {
  mission: Mission;
  onStart: () => void;
  onClaim: () => void;
}) {
  const colors = useColors();
  const isActive = mission.status !== 'not_started';
  const pct = Math.min(100, (mission.progress / mission.target) * 100);

  return (
    <View style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Icon + subtitle banner */}
      <View style={styles.missionBanner}>
        <View
          style={[
            styles.missionIcon,
            { backgroundColor: isActive ? colors.primarySoft : colors.muted },
          ]}
        >
          <Feather
            name={mission.icon as any}
            size={18}
            color={isActive ? colors.primary : colors.mutedForeground}
          />
        </View>
        <Text
          style={{
            color: isActive ? colors.primary : colors.mutedForeground,
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 0.6,
            marginLeft: 6,
          }}
          numberOfLines={1}
        >
          {mission.subtitle}
        </Text>
      </View>

      {/* Title */}
      <Text style={[styles.missionTitle, { color: colors.foreground }]} numberOfLines={1}>
        {mission.title}
      </Text>
      <Text style={[styles.missionDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
        {mission.description}
      </Text>

      {/* Points + Time */}
      <View style={styles.missionMeta}>
        <View style={styles.missionPointsRow}>
          <View style={[styles.miniIcon, { backgroundColor: colors.primarySoft }]}>
            <Feather name="zap" size={9} color={colors.primary} />
          </View>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
            {mission.pointsReward} pts
          </Text>
        </View>
        <View style={styles.missionTimeRow}>
          <Feather name="clock" size={10} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontSize: 11, marginLeft: 3 }}>
            {mission.daysLeft}d left
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      {(mission.status === 'in_progress' || mission.status === 'completed') && (
        <View style={{ marginTop: 8 }}>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor:
                    mission.status === 'completed' ? colors.primary : colors.primaryBorder,
                  width: `${pct}%`,
                },
              ]}
            />
          </View>
          <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 4 }}>
            {mission.progress}/{mission.target} {mission.unit}
          </Text>
        </View>
      )}

      {/* Action button */}
      <View style={{ marginTop: 10 }}>
        {mission.status === 'completed' ? (
          <TouchableOpacity
            onPress={onClaim}
            activeOpacity={0.8}
            style={[styles.missionBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.missionBtnText, { color: colors.primaryForeground }]}>
              Claim {mission.pointsReward} pts
            </Text>
          </TouchableOpacity>
        ) : mission.status === 'in_progress' ? (
          <View style={[styles.missionBtnOutline, { borderColor: colors.primaryBorder }]}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
              In Progress
            </Text>
          </View>
        ) : mission.status === 'claimed' ? (
          <View style={[styles.missionBtnOutline, { borderColor: colors.border }]}>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '700' }}>
              ✓ Claimed
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onStart}
            activeOpacity={0.8}
            style={[styles.missionBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.missionBtnText, { color: colors.primaryForeground }]}>
              Start Now
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {mission.isUnlimited && (
        <Text style={{ color: colors.mutedForeground, fontSize: 9, marginTop: 6, textAlign: 'center' }}>
          Unlimited
        </Text>
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ─ Hero banner (above check-in)
  heroBanner: {
    height: 180, borderRadius: 18, overflow: 'hidden', marginBottom: 16, borderWidth: 1,
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,5,0.55)',
  },
  heroContent: {
    position: 'absolute', bottom: 16, left: 18, right: 18, gap: 4,
  },
  heroTitle: { color: ACCENT_ON_DARK, fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  // ─ Header
  header: { paddingHorizontal: 20, paddingBottom: 0, gap: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700' },

  // ─ Points Hero
  pointsHero: { alignItems: 'center', paddingVertical: 4 },
  pointsCircle: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  pointsRing: { marginBottom: 4 },
  pointsNumber: { fontSize: 32, fontWeight: '800' },
  pointsLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginTop: 2 },

  // ─ Tab bar
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, gap: 0 },
  tabBtn: { flex: 1, alignItems: 'center', paddingBottom: 10, position: 'relative' },
  tabText: { fontSize: 13, fontWeight: '600', paddingBottom: 8 },
  tabIndicator: { position: 'absolute', bottom: -1, left: '15%', right: '15%', height: 2.5, borderRadius: 2 },

  // ─ Check-in
  checkInCard: {
    ...CARD_SHADOW,
    borderRadius: 16, padding: 18, borderWidth: 1, gap: 14,
  },
  checkInHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkInTitle: { fontSize: 15, fontWeight: '700' },
  checkInDays: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 5 },
  dayCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  dayPoints: { fontWeight: '700' },
  dayLabel: { fontSize: 9, fontWeight: '500' },
  checkInBtn: {
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  checkInBtnText: { fontSize: 13, fontWeight: '700' },

  // ─ Section
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },

  // ─ Missions grid
  missionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  missionCard: {
    ...CARD_SHADOW,
    width: '47%', borderRadius: 16, padding: 14, borderWidth: 1, gap: 6,
  },
  missionBanner: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  missionIcon: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  missionTitle: { fontSize: 14, fontWeight: '700' },
  missionDesc: { fontSize: 11, lineHeight: 15 },
  missionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  missionPointsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  missionTimeRow: { flexDirection: 'row', alignItems: 'center' },
  miniIcon: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  missionBtn: {
    borderRadius: 10, paddingVertical: 9, alignItems: 'center',
  },
  missionBtnOutline: {
    borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1,
  },
  missionBtnText: { fontSize: 11, fontWeight: '700' },

  // ─ How it works
  howItWorks: { borderRadius: 16, padding: 18, borderWidth: 1, marginTop: 20, gap: 12 },
  howStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  howIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  howNum: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },

  // ─ Redeem
  balanceBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20,
  },
  balancePoints: { fontSize: 18, fontWeight: '700' },

  partnerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 8 },
  partnerDot: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  partnerLogo: {
    width: 34, height: 34, borderRadius: 10,
  },
  partnerName: { fontSize: 15, fontWeight: '700' },

  redeemCard: {
    borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden',
  },
  redeemImageWrap: {
    height: 160, position: 'relative',
  },
  redeemImage: {
    width: '100%', height: '100%',
  },
  redeemImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,5,0.4)',
  },
  redeemImageText: {
    position: 'absolute', bottom: 14, left: 16, right: 16,
  },
  redeemTop: { paddingHorizontal: 16, paddingVertical: 16 },
  redeemTopContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  redeemTopTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  redeemTopDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  eliteChip: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.2)',
  },
  eliteChipText: { color: '#F59E0B', fontSize: 9, fontWeight: '700' },
  redeemBottom: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  redeemInfoCol: { flex: 1, gap: 3 },
  redeemPointsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  redeemBtn: {
    borderRadius: 10, paddingVertical: 9, paddingHorizontal: 16,
    alignItems: 'center',
  },
  redeemBtnText: { fontSize: 12, fontWeight: '700' },

  // ─ Voucher wallet
  voucherToggle: {
    flexDirection: 'row', borderRadius: 10, padding: 3, borderWidth: 1, marginBottom: 16,
  },
  voucherToggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },

  voucherCard: {
    ...CARD_SHADOW,
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 12,
  },
  voucherTop: { flexDirection: 'row', alignItems: 'flex-start' },
  vImage: {
    width: 52, height: 52, borderRadius: 10,
  },
  vPartnerBadge: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  vTitle: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  vDivider: { height: 1, marginHorizontal: -16 },
  voucherBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  vInfoRow: { flexDirection: 'row', alignItems: 'center' },
  useBtn: {
    borderRadius: 10, paddingVertical: 7, paddingHorizontal: 16,
  },
  useBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statusBadge: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
});
