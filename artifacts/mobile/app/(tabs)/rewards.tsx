import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { ACCENT_ON_DARK, ACCENT_ON_DARK_INK, CARD_SHADOW } from '@/constants/brand';

type RewardTab = 'missions' | 'redeem' | 'my-rewards';
type VoucherFilter = 'active' | 'past';

// ── Luxe accents ─────────────────────────────────────────────────
// Metallic gold for premium / milestone cues — used sparingly as hairlines,
// tier labels and the "claim" action so the screen reads expensive, not loud.
const GOLD = '#D4AF37';
const GOLD_GRADIENT = ['#F3D98B', '#D4AF37', '#A8842A'] as const;
const GOLD_INK = '#2A1E00';
// Always-dark "metal" surface for the points hero — premium in both themes.
const HERO_CARD_GRADIENT = ['#2A382A', '#161E16', '#0C110C'] as const;

type Tier = { label: string; color: string };
function getTier(points: number): Tier {
  if (points >= 3000) return { label: 'PLATINUM', color: '#E7E7E4' };
  if (points >= 1500) return { label: 'GOLD', color: GOLD };
  if (points >= 500) return { label: 'SILVER', color: '#CFD3D6' };
  return { label: 'BRONZE', color: '#D69A6A' };
}
function pointsToNextTier(points: number): string {
  const steps: [number, string][] = [[500, 'Silver'], [1500, 'Gold'], [3000, 'Platinum']];
  for (const [threshold, name] of steps) {
    if (points < threshold) return `${formatPoints(threshold - points)} pts to ${name}`;
  }
  return 'Top tier reached';
}

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
  const tier = getTier(userPoints);

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Rewards</Text>

        {/* Premium membership / points card */}
        <LinearGradient
          colors={HERO_CARD_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroCardHairline} pointerEvents="none" />
          <LinearGradient
            colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 0.8 }}
            style={styles.heroSheen}
            pointerEvents="none"
          />

          <View style={styles.heroCardTop}>
            <Text style={styles.heroCardLabel}>SATURUN POINTS</Text>
            <View style={[styles.tierPill, { borderColor: `${tier.color}66` }]}>
              <Feather name="award" size={11} color={tier.color} />
              <Text style={[styles.tierPillText, { color: tier.color }]}>{tier.label}</Text>
            </View>
          </View>

          <View style={styles.heroCardNumRow}>
            <View style={styles.heroZap}>
              <Feather name="zap" size={18} color={ACCENT_ON_DARK_INK} />
            </View>
            <Text style={styles.heroCardNumber}>{formatPoints(userPoints)}</Text>
            <Text style={styles.heroCardUnit}>pts</Text>
          </View>

          <View style={styles.heroCardBottom}>
            <View style={styles.heroStreak}>
              <Text style={styles.heroStreakEmoji}>🔥</Text>
              <Text style={styles.heroStreakText}>{checkInStreak}-day streak</Text>
            </View>
            <Text style={styles.heroNextTier}>{pointsToNextTier(userPoints)}</Text>
          </View>
        </LinearGradient>

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
        <View style={[styles.heroBanner, { borderColor: 'rgba(212,175,55,0.30)' }]}>
          <Image source={{ uri: IMAGES.runHero }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(8,11,8,0.15)', 'rgba(8,11,8,0.55)', 'rgba(8,11,8,0.90)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Feather name="zap" size={11} color={ACCENT_ON_DARK_INK} />
              <Text style={styles.heroBadgeText}>REWARDS PROGRAM</Text>
            </View>
            <Text style={styles.heroTitle}>Run. Earn. Redeem.</Text>
            <Text style={styles.heroSubtitle}>Complete missions & check in daily to earn SatuRun Points</Text>
          </View>
        </View>

        {/* Daily Check-in Card */}
        <View style={[styles.checkInCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.checkInHeader}>
            <View>
              <Text style={[styles.checkInTitle, { color: colors.foreground }]}>Daily Check-in</Text>
              <Text style={[styles.checkInSub, { color: colors.mutedForeground }]}>
                Keep your streak alive for bonus points
              </Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder }]}>
              <Text style={{ fontSize: 13 }}>🔥</Text>
              <Text style={[styles.streakBadgeText, { color: colors.primary }]}>{checkInStreak}</Text>
            </View>
          </View>

          {/* 7-day circles */}
          <View style={styles.checkInDays}>
            {CHECK_IN_REWARDS.map((pts, i) => {
              const isCompleted = i < currentCheckInDay;
              const isTodayDone = i === currentCheckInDay && isCheckedInToday;
              const isCurrent = i === currentCheckInDay && !isCheckedInToday;
              const filled = isCompleted || isTodayDone;
              const isMilestone = i === 6;

              return (
                <View key={i} style={styles.dayItem}>
                  {filled ? (
                    <LinearGradient
                      colors={[colors.primary, colors.accentInk]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.dayCircle}
                    >
                      <Feather name="check" size={15} color={colors.primaryForeground} />
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.dayCircle,
                        {
                          backgroundColor: isCurrent ? colors.primarySoft : colors.muted,
                          borderWidth: isCurrent ? 2 : isMilestone ? 1.5 : 0,
                          borderColor: isCurrent ? colors.primary : isMilestone ? GOLD : 'transparent',
                        },
                      ]}
                    >
                      {isMilestone ? (
                        <Feather name="gift" size={14} color={isCurrent ? colors.primary : GOLD} />
                      ) : (
                        <Text
                          style={[
                            styles.dayPoints,
                            { color: isCurrent ? colors.primary : colors.mutedForeground },
                          ]}
                        >
                          +{pts}
                        </Text>
                      )}
                    </View>
                  )}
                  <Text
                    style={[
                      styles.dayLabel,
                      { color: isCurrent || isTodayDone ? colors.primary : colors.mutedForeground },
                    ]}
                  >
                    {isMilestone ? `+${pts}` : `Day ${i + 1}`}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Check-in button */}
          {isCheckedInToday ? (
            <View style={[styles.checkInBtn, { backgroundColor: colors.muted }]}>
              <Feather name="check" size={14} color={colors.mutedForeground} />
              <Text style={[styles.checkInBtnText, { color: colors.mutedForeground }]}>
                Checked in today
              </Text>
            </View>
          ) : (
            <TouchableOpacity onPress={checkIn} activeOpacity={0.85}>
              <LinearGradient
                colors={[colors.primary, colors.accentInk]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkInBtn}
              >
                <Feather name="zap" size={14} color={colors.primaryForeground} />
                <Text style={[styles.checkInBtnText, { color: colors.primaryForeground }]}>
                  Check In · Earn {CHECK_IN_REWARDS[currentCheckInDay]} pts
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Section header */}
        <View style={[styles.sectionHead, { marginTop: 26 }]}>
          <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0, flex: 1 }]}>
            Missions
          </Text>
          <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
            Earn SatuRun Points
          </Text>
        </View>

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
              <LinearGradient
                colors={[colors.primary, colors.accentInk]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.howNum}
              >
                <Text style={{ color: colors.primaryForeground, fontSize: 11, fontWeight: '800' }}>
                  {i + 1}
                </Text>
              </LinearGradient>
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

  const chip =
    mission.status === 'completed'
      ? { text: 'READY', color: GOLD }
      : mission.status === 'in_progress'
      ? { text: 'ACTIVE', color: colors.primary }
      : mission.status === 'claimed'
      ? { text: 'DONE', color: colors.mutedForeground }
      : null;

  return (
    <View style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Icon tile + status chip */}
      <View style={styles.missionTop}>
        {isActive ? (
          <LinearGradient
            colors={[colors.primary, colors.accentInk]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.missionIcon}
          >
            <Feather name={mission.icon as any} size={17} color={colors.primaryForeground} />
          </LinearGradient>
        ) : (
          <View style={[styles.missionIcon, { backgroundColor: colors.muted }]}>
            <Feather name={mission.icon as any} size={17} color={colors.mutedForeground} />
          </View>
        )}
        {chip && (
          <View style={[styles.statusChip, { borderColor: `${chip.color}55` }]}>
            <View style={[styles.statusDotMini, { backgroundColor: chip.color }]} />
            <Text style={[styles.statusChipText, { color: chip.color }]}>{chip.text}</Text>
          </View>
        )}
      </View>

      {/* Overline */}
      <Text
        style={[styles.missionOverline, { color: isActive ? colors.primary : colors.mutedForeground }]}
        numberOfLines={1}
      >
        {mission.subtitle}
      </Text>

      {/* Title + desc */}
      <Text style={[styles.missionTitle, { color: colors.foreground }]} numberOfLines={1}>
        {mission.title}
      </Text>
      <Text style={[styles.missionDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
        {mission.description}
      </Text>

      {/* Points + Time */}
      <View style={styles.missionMeta}>
        <View style={[styles.pointsPill, { backgroundColor: colors.primarySoft }]}>
          <Feather name="zap" size={10} color={colors.primary} />
          <Text style={[styles.pointsPillText, { color: colors.primary }]}>{mission.pointsReward} pts</Text>
        </View>
        <View style={styles.missionTimeRow}>
          <Feather name="clock" size={10} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontSize: 11, marginLeft: 3 }}>
            {mission.daysLeft}d
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      {(mission.status === 'in_progress' || mission.status === 'completed') && (
        <View style={{ marginTop: 10 }}>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <LinearGradient
              colors={mission.status === 'completed' ? GOLD_GRADIENT : [colors.primary, colors.accentInk]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${pct}%` }]}
            />
          </View>
          <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 5 }}>
            {mission.progress}/{mission.target} {mission.unit}
          </Text>
        </View>
      )}

      {/* Action button */}
      <View style={{ marginTop: 12 }}>
        {mission.status === 'completed' ? (
          <TouchableOpacity onPress={onClaim} activeOpacity={0.85}>
            <LinearGradient
              colors={GOLD_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.missionBtn}
            >
              <Text style={[styles.missionBtnText, { color: GOLD_INK }]}>
                Claim {mission.pointsReward} pts
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : mission.status === 'in_progress' ? (
          <View style={[styles.missionBtnOutline, { borderColor: colors.primaryBorder }]}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>In Progress</Text>
          </View>
        ) : mission.status === 'claimed' ? (
          <View style={[styles.missionBtnOutline, { borderColor: colors.border }]}>
            <Feather name="check" size={12} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '700', marginLeft: 4 }}>
              Claimed
            </Text>
          </View>
        ) : (
          <TouchableOpacity onPress={onStart} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.primary, colors.accentInk]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.missionBtn}
            >
              <Text style={[styles.missionBtnText, { color: colors.primaryForeground }]}>Start Now</Text>
            </LinearGradient>
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
  heroContent: {
    position: 'absolute', bottom: 16, left: 18, right: 18, gap: 5,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    backgroundColor: ACCENT_ON_DARK, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20,
  },
  heroBadgeText: { color: ACCENT_ON_DARK_INK, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  heroSubtitle: { color: 'rgba(255,255,255,0.72)', fontSize: 12, lineHeight: 16 },

  // ─ Header
  header: { paddingHorizontal: 20, paddingBottom: 0, gap: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700' },

  // ─ Points hero / membership card
  heroCard: {
    ...CARD_SHADOW,
    shadowOpacity: 0.20, shadowRadius: 18, shadowOffset: { width: 0, height: 10 },
    borderRadius: 20, padding: 18, overflow: 'hidden', gap: 14,
  },
  heroCardHairline: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.40)',
  },
  heroSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '65%' },
  heroCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroCardLabel: { color: 'rgba(255,255,255,0.58)', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  tierPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  tierPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  heroCardNumRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  heroZap: {
    width: 34, height: 34, borderRadius: 12, backgroundColor: ACCENT_ON_DARK,
    alignItems: 'center', justifyContent: 'center', marginBottom: 5,
  },
  heroCardNumber: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', letterSpacing: -1, lineHeight: 44 },
  heroCardUnit: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  heroCardBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.09)', paddingTop: 12,
  },
  heroStreak: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroStreakEmoji: { fontSize: 13 },
  heroStreakText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  heroNextTier: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600' },

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
  checkInHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  checkInTitle: { fontSize: 15, fontWeight: '700' },
  checkInSub: { fontSize: 11, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1,
  },
  streakBadgeText: { fontSize: 13, fontWeight: '800' },
  checkInDays: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 6 },
  dayCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  dayPoints: { fontWeight: '700', fontSize: 11 },
  dayLabel: { fontSize: 9, fontWeight: '600' },
  checkInBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderRadius: 12, paddingVertical: 13,
  },
  checkInBtnText: { fontSize: 13, fontWeight: '700' },

  // ─ Section
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionAccent: { width: 3, height: 18, borderRadius: 2 },
  sectionCount: { fontSize: 11, fontWeight: '600' },

  // ─ Missions grid
  missionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  missionCard: {
    ...CARD_SHADOW,
    width: '47%', borderRadius: 18, padding: 14, borderWidth: 1, gap: 5,
  },
  missionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  missionIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, borderWidth: 1,
  },
  statusDotMini: { width: 5, height: 5, borderRadius: 3 },
  statusChipText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  missionOverline: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  missionTitle: { fontSize: 14, fontWeight: '700' },
  missionDesc: { fontSize: 11, lineHeight: 15 },
  missionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  pointsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  pointsPillText: { fontSize: 12, fontWeight: '800' },
  missionTimeRow: { flexDirection: 'row', alignItems: 'center' },
  miniIcon: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  missionBtn: {
    flexDirection: 'row', borderRadius: 11, paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
  },
  missionBtnOutline: {
    flexDirection: 'row', borderRadius: 11, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  missionBtnText: { fontSize: 11, fontWeight: '800' },

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
