import type { StravaRun } from '@/types/strava';

// ── Types ────────────────────────────────────────────────────────

export type MissionStatus = 'not_started' | 'in_progress' | 'completed' | 'claimed';
export type VoucherStatus = 'active' | 'used' | 'expired';

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  pointsReward: number;
  type: 'pace' | 'distance' | 'night' | 'frequency' | 'streak';
  target: number;
  unit: string;
  progress: number;
  status: MissionStatus;
  daysLeft: number;
  isUnlimited: boolean;
  icon: string;
}

export interface VoucherTemplate {
  id: string;
  title: string;
  description: string;
  partnerName: string;
  partnerInitials: string;
  partnerColor: string;
  pointsCost: number;
  rewardValue: string;
  validityDays: number;
  minSpend?: string;
  isElite?: boolean;
  imageUri?: string;
}

export interface UserVoucher {
  id: string;
  templateId: string;
  title: string;
  description: string;
  partnerName: string;
  partnerInitials: string;
  partnerColor: string;
  rewardValue: string;
  status: VoucherStatus;
  redeemedAt: string;
  expiresAt: string;
  minSpend?: string;
}

export interface RewardState {
  userPoints: number;
  checkInStreak: number;
  lastCheckInDate: string | null;
  missions: Mission[];
  userVouchers: UserVoucher[];
}

// ── Check-in (7-day cycle) ───────────────────────────────────────

export const CHECK_IN_REWARDS = [5, 5, 5, 10, 5, 5, 25];

// ── Image Assets (free stock — Unsplash / Pexels) ────────────────

export const IMAGES = {
  // Hero / check-in banner
  runHero:
    'https://images.unsplash.com/photo-1516398810565-0cb4310bb8ea?w=800&h=500&fit=crop&q=80',
  // ZUS Coffee drinks
  zusDrink:
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&q=80',
  zusLatte:
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop&q=80',
  // Pastry
  pastry:
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop&q=80',
  // Running gear
  neonShoe:
    'https://images.unsplash.com/photo-1719759674376-a001dc166cb6?w=600&h=400&fit=crop&q=80',
  runningCap:
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop&q=80',
  // Bubble tea
  bubbleTea:
    'https://images.unsplash.com/photo-1747016804753-866c3ed6b3b7?w=600&h=400&fit=crop&q=80',
  bubbleTeaCup:
    'https://images.pexels.com/photos/11160122/pexels-photo-11160122.jpeg?auto=compress&cs=tinysrgb&w=600',
  // Mango smoothie
  mangoSmoothie:
    'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&h=400&fit=crop&q=80',
  // Training / coaching
  coaching:
    'https://images.unsplash.com/photo-1532288744908-b37abee2ed71?w=600&h=400&fit=crop&q=80',
  // Pharmacy
  pharmacyStore:
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=400&fit=crop&q=80',
  pharmacySupplements:
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop&q=80',
  pharmacyVitamins:
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&h=400&fit=crop&q=80',
  pharmacyFirstAid:
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=400&fit=crop&q=80',
} as const;

// ── Partners ─────────────────────────────────────────────────────

export type Partner = { id: string; name: string; handle: string; initials: string; color: string; logoUri?: string | number };

export const PARTNERS: Partner[] = [
  { id: 'zus-coffee', name: 'ZUS Coffee', handle: 'zuscoffeerunclub', initials: 'ZC', color: '#0EA5E9', logoUri: 'https://zuscoffee.com/wp-content/uploads/2025/07/app-logo-resize-256x256-1.png' },
  { id: 'ceo-sport-club', name: 'ceoSportClub', handle: 'ceosportsclub', initials: 'PK', color: '#8B5CF6', logoUri: 'https://scontent.cdninstagram.com/v/t51.82787-19/572711352_17916887241206215_3284586319281328837_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=101&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy41MDAuQzMifQ%3D%3D&_nc_ohc=xw7luCps82oQ7kNvwHAcPZZ&_nc_oc=Adru2wLxZOhZt5TsB4KNNfXIaB0_KMG5Std27P6tJBU7B6z80E3vS7lSPz1qIjNSoEA&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=u1igmderzZc2bv7CAarFfA&_nc_ss=70a8c&oh=00_Af_Y0XIakgXM7I2LeOD0rhxS7Rw_pXdLw8SX_T7723ysXQ&oe=6A31E8C4' },
  { id: 'mixue', name: 'Mixue', handle: 'mixue', initials: 'MX', color: '#EF4444', logoUri: 'https://logowik.com/content/uploads/images/mixue-ice-cream4751.logowik.com.webp' },
  { id: 'big-pharmacy', name: 'BigPharmacy', handle: 'bigpharmacy', initials: 'BP', color: '#10B981', logoUri: require('../assets/bigpharmacy.png') },
];

// ── Missions ─────────────────────────────────────────────────────

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    subtitle: 'RUN FAST. EARN BIG.',
    description: 'Run 5km with pace under 6:30/km',
    pointsReward: 100,
    type: 'pace',
    target: 5,
    unit: 'km',
    progress: 0,
    status: 'not_started',
    daysLeft: 18,
    isUnlimited: true,
    icon: 'zap',
  },
  {
    id: 'distance-warrior',
    title: 'Distance Warrior',
    subtitle: 'DISTANCE IS GLORY.',
    description: 'Accumulate 30km total distance',
    pointsReward: 150,
    type: 'distance',
    target: 30,
    unit: 'km',
    progress: 0,
    status: 'not_started',
    daysLeft: 18,
    isUnlimited: true,
    icon: 'target',
  },
  {
    id: 'night-runner',
    title: 'Night Runner',
    subtitle: 'OWN THE NIGHT.',
    description: 'Complete 3 night runs after 7PM',
    pointsReward: 120,
    type: 'night',
    target: 3,
    unit: 'runs',
    progress: 0,
    status: 'not_started',
    daysLeft: 18,
    isUnlimited: true,
    icon: 'moon',
  },
  {
    id: 'pace-setter',
    title: 'Pace Setter',
    subtitle: 'SET THE STANDARD.',
    description: 'Run 10km with pace under 7:00/km',
    pointsReward: 200,
    type: 'pace',
    target: 10,
    unit: 'km',
    progress: 0,
    status: 'not_started',
    daysLeft: 18,
    isUnlimited: true,
    icon: 'award',
  },
  {
    id: 'social-runner',
    title: 'Social Runner',
    subtitle: 'RUN TOGETHER.',
    description: 'Join 3 community run events',
    pointsReward: 80,
    type: 'frequency',
    target: 3,
    unit: 'runs',
    progress: 0,
    status: 'not_started',
    daysLeft: 18,
    isUnlimited: true,
    icon: 'users',
  },
  {
    id: 'consistency-king',
    title: 'Consistency King',
    subtitle: 'NEVER MISS A DAY.',
    description: 'Run on 5 different days this week',
    pointsReward: 150,
    type: 'streak',
    target: 5,
    unit: 'days',
    progress: 0,
    status: 'not_started',
    daysLeft: 7,
    isUnlimited: true,
    icon: 'calendar',
  },
];

// ── Voucher Templates (redeemable rewards) ───────────────────────

export const VOUCHER_TEMPLATES: VoucherTemplate[] = [
  // ZUS Coffee
  {
    id: 'zus-bo1f1',
    title: 'Buy 1 Free 1',
    description: 'Any Handcrafted Drink',
    partnerName: 'ZUS Coffee',
    partnerInitials: 'ZC',
    partnerColor: '#0EA5E9',
    pointsCost: 200,
    rewardValue: 'RM 15',
    validityDays: 14,
    minSpend: '2 Drinks',
    imageUri: IMAGES.zusDrink,
  },
  {
    id: 'zus-rm5',
    title: 'RM 5 Off',
    description: 'Minimum spend RM 20',
    partnerName: 'ZUS Coffee',
    partnerInitials: 'ZC',
    partnerColor: '#0EA5E9',
    pointsCost: 350,
    rewardValue: 'RM 5',
    validityDays: 14,
    minSpend: 'RM 20',
    imageUri: IMAGES.zusLatte,
  },
  {
    id: 'zus-pastry',
    title: 'Free Pastry',
    description: 'With any handcrafted drink',
    partnerName: 'ZUS Coffee',
    partnerInitials: 'ZC',
    partnerColor: '#0EA5E9',
    pointsCost: 150,
    rewardValue: 'RM 8',
    validityDays: 7,
    minSpend: '1 Drink',
    imageUri: IMAGES.pastry,
  },
  // ceoSportClub (Perry Kuan)
  {
    id: 'ceo-gear',
    title: '10% Off Running Gear',
    description: 'Valid on all running equipment',
    partnerName: 'ceoSportClub',
    partnerInitials: 'PK',
    partnerColor: '#8B5CF6',
    pointsCost: 300,
    rewardValue: '10% OFF',
    validityDays: 30,
    isElite: true,
    imageUri: IMAGES.neonShoe,
  },
  {
    id: 'ceo-training',
    title: 'Free Training Session',
    description: '1-on-1 coaching session',
    partnerName: 'ceoSportClub',
    partnerInitials: 'PK',
    partnerColor: '#8B5CF6',
    pointsCost: 500,
    rewardValue: 'RM 120',
    validityDays: 30,
    isElite: true,
    imageUri: IMAGES.coaching,
  },
  {
    id: 'ceo-cap',
    title: 'Running Cap',
    description: 'Limited edition ceoSportClub cap',
    partnerName: 'ceoSportClub',
    partnerInitials: 'PK',
    partnerColor: '#8B5CF6',
    pointsCost: 250,
    rewardValue: 'RM 45',
    validityDays: 14,
    imageUri: IMAGES.neonShoe,
  },
  // Mixue
  {
    id: 'mixue-bbt',
    title: 'Free Bubble Tea',
    description: 'Any classic bubble tea flavor',
    partnerName: 'Mixue',
    partnerInitials: 'MX',
    partnerColor: '#EF4444',
    pointsCost: 150,
    rewardValue: 'RM 8',
    validityDays: 7,
    imageUri: IMAGES.bubbleTea,
  },
  {
    id: 'mixue-bo1f1',
    title: 'Buy 1 Free 1',
    description: 'Mango Smoothie or Sundae',
    partnerName: 'Mixue',
    partnerInitials: 'MX',
    partnerColor: '#EF4444',
    pointsCost: 250,
    rewardValue: 'RM 12',
    validityDays: 14,
    minSpend: '2 Items',
    imageUri: IMAGES.mangoSmoothie,
  },
  {
    id: 'mixue-rm3',
    title: 'RM 3 Off',
    description: 'Any order above RM 10',
    partnerName: 'Mixue',
    partnerInitials: 'MX',
    partnerColor: '#EF4444',
    pointsCost: 100,
    rewardValue: 'RM 3',
    validityDays: 7,
    minSpend: 'RM 10',
    imageUri: IMAGES.bubbleTeaCup,
  },
  // BigPharmacy
  {
    id: 'bp-vitamins',
    title: '20% Off Vitamins',
    description: 'All vitamin & supplement brands',
    partnerName: 'BigPharmacy',
    partnerInitials: 'BP',
    partnerColor: '#10B981',
    pointsCost: 180,
    rewardValue: 'RM 20',
    validityDays: 14,
    minSpend: 'RM 50',
    imageUri: IMAGES.pharmacyVitamins,
  },
  {
    id: 'bp-firstaid',
    title: 'Free First Aid Kit',
    description: 'Portable sports first aid kit',
    partnerName: 'BigPharmacy',
    partnerInitials: 'BP',
    partnerColor: '#10B981',
    pointsCost: 300,
    rewardValue: 'RM 35',
    validityDays: 30,
    imageUri: IMAGES.pharmacyFirstAid,
  },
  {
    id: 'bp-recovery',
    title: '15% Off Recovery Gear',
    description: 'Muscle rubs, compression sleeves & more',
    partnerName: 'BigPharmacy',
    partnerInitials: 'BP',
    partnerColor: '#10B981',
    pointsCost: 200,
    rewardValue: '15% OFF',
    validityDays: 14,
    minSpend: 'RM 30',
    imageUri: IMAGES.pharmacySupplements,
  },
];

// ── Demo Vouchers (pre-loaded) ───────────────────────────────────

export const DEMO_VOUCHERS: UserVoucher[] = [
  {
    id: 'voucher_demo_1',
    templateId: 'zus-bo1f1',
    title: 'Buy 1 Free 1',
    description: 'Any Handcrafted Drink',
    partnerName: 'ZUS Coffee',
    partnerInitials: 'ZC',
    partnerColor: '#0EA5E9',
    rewardValue: 'RM 15',
    status: 'active',
    redeemedAt: '2026-06-10T10:00:00Z',
    expiresAt: '2026-06-24T10:00:00Z',
    minSpend: '2 Drinks',
  },
  {
    id: 'voucher_demo_2',
    templateId: 'mixue-bbt',
    title: 'Free Bubble Tea',
    description: 'Any classic bubble tea flavor',
    partnerName: 'Mixue',
    partnerInitials: 'MX',
    partnerColor: '#EF4444',
    rewardValue: 'RM 8',
    status: 'active',
    redeemedAt: '2026-06-11T14:00:00Z',
    expiresAt: '2026-06-18T14:00:00Z',
  },
  {
    id: 'voucher_demo_3',
    templateId: 'ceo-gear',
    title: '10% Off Running Gear',
    description: 'Valid on all running equipment',
    partnerName: 'ceoSportClub',
    partnerInitials: 'PK',
    partnerColor: '#8B5CF6',
    rewardValue: '10% OFF',
    status: 'used',
    redeemedAt: '2026-06-01T10:00:00Z',
    expiresAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'voucher_demo_4',
    templateId: 'zus-pastry',
    title: 'Free Pastry',
    description: 'With any handcrafted drink',
    partnerName: 'ZUS Coffee',
    partnerInitials: 'ZC',
    partnerColor: '#0EA5E9',
    rewardValue: 'RM 8',
    status: 'expired',
    redeemedAt: '2026-05-28T10:00:00Z',
    expiresAt: '2026-06-04T10:00:00Z',
    minSpend: '1 Drink',
  },
  {
    id: 'voucher_demo_5',
    templateId: 'bp-vitamins',
    title: '20% Off Vitamins',
    description: 'All vitamin & supplement brands',
    partnerName: 'BigPharmacy',
    partnerInitials: 'BP',
    partnerColor: '#10B981',
    rewardValue: 'RM 20',
    status: 'active',
    redeemedAt: '2026-06-09T09:00:00Z',
    expiresAt: '2026-06-23T09:00:00Z',
    minSpend: 'RM 50',
  },
];

// ── Default State ────────────────────────────────────────────────

export const DEFAULT_REWARDS: RewardState = {
  userPoints: 350,
  checkInStreak: 0,
  lastCheckInDate: null,
  missions: INITIAL_MISSIONS,
  userVouchers: DEMO_VOUCHERS,
};

// ── Helpers ──────────────────────────────────────────────────────

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatPoints(points: number): string {
  return points.toLocaleString();
}

export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

/** Dynamically compute mission progress from Strava runs + joined events. */
export function computeMissionProgress(
  mission: Mission,
  stravaRuns: StravaRun[],
  joinedCount: number,
): Mission {
  let progress = mission.progress;
  let status = mission.status;

  switch (mission.type) {
    case 'pace': {
      const paceTarget = mission.target >= 10 ? 7.0 : 6.5;
      const hasQualifying = stravaRuns.some(r => {
        const m = r.pacePerKm.match(/(\d+):(\d+)/);
        if (!m) return false;
        const paceMin = parseInt(m[1]) + parseInt(m[2]) / 60;
        return r.distanceKm >= mission.target && paceMin <= paceTarget;
      });
      progress = hasQualifying ? mission.target : 0;
      if (hasQualifying && status !== 'claimed') status = 'completed';
      break;
    }
    case 'distance': {
      const totalDist = stravaRuns.reduce((s, r) => s + r.distanceKm, 0);
      progress = Math.round(Math.min(totalDist, mission.target) * 10) / 10;
      if (progress >= mission.target && status !== 'claimed') status = 'completed';
      else if (progress > 0 && status === 'not_started') status = 'in_progress';
      break;
    }
    case 'night': {
      const nightRuns = stravaRuns.filter(r => {
        const h = new Date(r.startDate).getHours();
        return h >= 19 || h < 5;
      }).length;
      progress = nightRuns;
      if (progress >= mission.target && status !== 'claimed') status = 'completed';
      else if (progress > 0 && status === 'not_started') status = 'in_progress';
      break;
    }
    case 'frequency': {
      progress = joinedCount;
      if (progress >= mission.target && status !== 'claimed') status = 'completed';
      else if (progress > 0 && status === 'not_started') status = 'in_progress';
      break;
    }
    case 'streak': {
      const uniqueDays = new Set(stravaRuns.map(r => r.startDate.split('T')[0])).size;
      progress = uniqueDays;
      if (progress >= mission.target && status !== 'claimed') status = 'completed';
      else if (progress > 0 && status === 'not_started') status = 'in_progress';
      break;
    }
  }

  return { ...mission, progress, status };
}
