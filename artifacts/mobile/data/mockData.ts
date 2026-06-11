export type EventCategory = 'Tempo' | 'Easy' | 'Trail' | 'Interval' | 'Night' | 'Community';

export interface RunningEvent {
  id: string;
  title: string;
  organizer: string;
  organizerHandle: string;
  organizerInitials: string;
  organizerColor: string;
  isVerified: boolean;
  location: string;
  neighborhood: string;
  coordinates: { x: number; y: number };
  distance: string;
  pace: string;
  category: EventCategory;
  date: string;
  time: string;
  displayTime: string;
  participantsCount: number;
  maxParticipants: number;
  hasVoucher?: boolean;
  voucherDescription?: string;
  tags: string[];
  isUserCreated?: boolean;
}

export interface Organizer {
  id: string;
  name: string;
  handle: string;
  isVerified: boolean;
  badge: string;
  activeRunners: number;
  weeklyGrowth: number;
  totalEvents: number;
  avgParticipants: number;
  initials: string;
  color: string;
}

export const ORGANIZERS: Organizer[] = [
  {
    id: 'perry-kuan',
    name: 'Perry Kuan',
    handle: '@ceosportsclub',
    isVerified: true,
    badge: 'Influencer',
    activeRunners: 1240,
    weeklyGrowth: 24,
    totalEvents: 48,
    avgParticipants: 42,
    initials: 'PK',
    color: '#8B5CF6',
  },
  {
    id: 'zus-coffee',
    name: 'ZUS Coffee Run Club',
    handle: '@zuscoffeerunclub',
    isVerified: true,
    badge: 'Brand Partner',
    activeRunners: 892,
    weeklyGrowth: 18,
    totalEvents: 32,
    avgParticipants: 78,
    initials: 'ZC',
    color: '#0EA5E9',
  },
  {
    id: 'bangsar-athletic',
    name: 'Bangsar Athletic Group',
    handle: '@bangsarathleticgroup',
    isVerified: true,
    badge: 'Community',
    activeRunners: 567,
    weeklyGrowth: 12,
    totalEvents: 56,
    avgParticipants: 34,
    initials: 'BA',
    color: '#10B981',
  },
  {
    id: 'dpc-striders',
    name: 'DPC Striders',
    handle: '@dpcstriders',
    isVerified: false,
    badge: 'Community',
    activeRunners: 234,
    weeklyGrowth: 8,
    totalEvents: 23,
    avgParticipants: 28,
    initials: 'DS',
    color: '#F59E0B',
  },
  {
    id: 'klcc-runners',
    name: 'KLCC Runners',
    handle: '@klccrunners',
    isVerified: false,
    badge: 'Community',
    activeRunners: 189,
    weeklyGrowth: 5,
    totalEvents: 15,
    avgParticipants: 22,
    initials: 'KR',
    color: '#EF4444',
  },
];

export const INITIAL_EVENTS: RunningEvent[] = [
  {
    id: '1',
    title: 'Thursday Night Elite Tempo Run',
    organizer: 'Perry Kuan',
    organizerHandle: '@ceosportsclub',
    organizerInitials: 'PK',
    organizerColor: '#8B5CF6',
    isVerified: true,
    location: 'TTDI Park',
    neighborhood: 'TTDI',
    coordinates: { x: 42, y: 193 },
    distance: '7KM',
    pace: '5:30 /km',
    category: 'Tempo',
    date: '2026-06-19',
    time: '20:00',
    displayTime: '8:00 PM',
    participantsCount: 42,
    maxParticipants: 50,
    hasVoucher: false,
    tags: ['Night Run', 'Elite'],
  },
  {
    id: '2',
    title: 'Mont Kiara Social Recovery Run',
    organizer: 'ZUS Coffee Run Club',
    organizerHandle: '@zuscoffeerunclub',
    organizerInitials: 'ZC',
    organizerColor: '#0EA5E9',
    isVerified: true,
    location: 'Mont Kiara Striders Zone',
    neighborhood: 'Mont Kiara',
    coordinates: { x: 115, y: 103 },
    distance: '5KM',
    pace: '6:30 /km',
    category: 'Easy',
    date: '2026-06-14',
    time: '07:00',
    displayTime: '7:00 AM',
    participantsCount: 78,
    maxParticipants: 100,
    hasVoucher: true,
    voucherDescription: '1-for-1 ZUS Iced Spanish Latte',
    tags: ['Morning Pace', 'Beginner Friendly'],
  },
  {
    id: '3',
    title: 'Desa ParkCity Sunset Loop',
    organizer: 'DPC Striders',
    organizerHandle: '@dpcstriders',
    organizerInitials: 'DS',
    organizerColor: '#F59E0B',
    isVerified: false,
    location: 'Desa ParkCity Waterfront',
    neighborhood: 'Desa ParkCity',
    coordinates: { x: 68, y: 112 },
    distance: '10KM',
    pace: '5:00 /km',
    category: 'Community',
    date: '2026-06-21',
    time: '18:30',
    displayTime: '6:30 PM',
    participantsCount: 34,
    maxParticipants: 60,
    hasVoucher: false,
    tags: ['Sunset', 'Scenic'],
  },
  {
    id: '4',
    title: 'Bangsar Heights Escalation',
    organizer: 'Bangsar Athletic Group',
    organizerHandle: '@bangsarathleticgroup',
    organizerInitials: 'BA',
    organizerColor: '#10B981',
    isVerified: true,
    location: 'Bangsar Heights',
    neighborhood: 'Bangsar',
    coordinates: { x: 155, y: 188 },
    distance: '10KM',
    pace: '5:15 /km',
    category: 'Trail',
    date: '2026-06-17',
    time: '06:30',
    displayTime: '6:30 AM',
    participantsCount: 28,
    maxParticipants: 40,
    hasVoucher: false,
    tags: ['Hilly', 'Road Route'],
  },
  {
    id: '5',
    title: 'KLCC Sunrise Chase',
    organizer: 'KLCC Runners',
    organizerHandle: '@klccrunners',
    organizerInitials: 'KR',
    organizerColor: '#EF4444',
    isVerified: false,
    location: 'KLCC Park Loop',
    neighborhood: 'KLCC',
    coordinates: { x: 244, y: 133 },
    distance: '5KM',
    pace: '6:00 /km',
    category: 'Easy',
    date: '2026-06-24',
    time: '06:00',
    displayTime: '6:00 AM',
    participantsCount: 56,
    maxParticipants: 80,
    hasVoucher: false,
    tags: ['Beginner Friendly', 'Flat Terrain'],
  },
  {
    id: '6',
    title: 'Kiara Hill Trail Blast',
    organizer: 'Perry Kuan',
    organizerHandle: '@ceosportsclub',
    organizerInitials: 'PK',
    organizerColor: '#8B5CF6',
    isVerified: true,
    location: 'Kiara Hill Trail',
    neighborhood: 'Kiara Hill',
    coordinates: { x: 94, y: 90 },
    distance: '8KM',
    pace: '5:45 /km',
    category: 'Trail',
    date: '2026-06-26',
    time: '07:00',
    displayTime: '7:00 AM',
    participantsCount: 38,
    maxParticipants: 45,
    hasVoucher: false,
    tags: ['Technical', 'Dirt Paths'],
  },
  {
    id: '7',
    title: 'ZUS Coffee Night Stride',
    organizer: 'ZUS Coffee Run Club',
    organizerHandle: '@zuscoffeerunclub',
    organizerInitials: 'ZC',
    organizerColor: '#0EA5E9',
    isVerified: true,
    location: 'Mont Kiara Boulevard',
    neighborhood: 'Mont Kiara',
    coordinates: { x: 120, y: 110 },
    distance: '5KM',
    pace: '6:15 /km',
    category: 'Night',
    date: '2026-07-03',
    time: '20:30',
    displayTime: '8:30 PM',
    participantsCount: 64,
    maxParticipants: 80,
    hasVoucher: true,
    voucherDescription: 'Complimentary ZUS Lychee Americano',
    tags: ['Night Run', 'Social'],
  },
  {
    id: '8',
    title: 'TTDI Interval Training Session',
    organizer: 'Bangsar Athletic Group',
    organizerHandle: '@bangsarathleticgroup',
    organizerInitials: 'BA',
    organizerColor: '#10B981',
    isVerified: true,
    location: 'TTDI Park Running Track',
    neighborhood: 'TTDI',
    coordinates: { x: 35, y: 205 },
    distance: '6KM',
    pace: '4:45 /km',
    category: 'Interval',
    date: '2026-07-07',
    time: '07:00',
    displayTime: '7:00 AM',
    participantsCount: 22,
    maxParticipants: 30,
    hasVoucher: false,
    tags: ['Speed Work', 'Track'],
  },
];

export const PAST_RUNS = [
  {
    id: 'past1',
    title: 'Bangsar Hills Morning Cruise',
    organizer: 'Bangsar Athletic Group',
    location: 'Bangsar',
    distanceKm: 5,
    date: '2026-06-07',
    category: 'Easy' as EventCategory,
  },
  {
    id: 'past2',
    title: 'KLCC Weekend Social Run',
    organizer: 'KLCC Runners',
    location: 'KLCC Park',
    distanceKm: 5,
    date: '2026-06-03',
    category: 'Community' as EventCategory,
  },
  {
    id: 'past3',
    title: 'DPC Sunset Loop',
    organizer: 'DPC Striders',
    location: 'Desa ParkCity',
    distanceKm: 7,
    date: '2026-05-28',
    category: 'Trail' as EventCategory,
  },
];

export const ACHIEVEMENTS = [
  { id: 'first-run', title: 'First Step', description: 'Completed first run on PACE', iconName: 'flag', unlocked: true },
  { id: '5km', title: '5K Club', description: 'Completed a 5KM run', iconName: 'activity', unlocked: true },
  { id: '10km', title: '10K Legend', description: 'Completed a 10KM run', iconName: 'award', unlocked: false },
  { id: 'social', title: 'Social Runner', description: 'Joined 5+ community events', iconName: 'users', unlocked: false },
  { id: 'night-owl', title: 'Night Owl', description: 'Completed a night run', iconName: 'moon', unlocked: false },
];

export const LOCATION_OPTIONS = [
  'Mont Kiara Striders Zone',
  'TTDI Park Base',
  'Desa ParkCity Loop',
  'Bangsar Heights',
  'KLCC Park Loop',
  'Kiara Hill Trail',
  'Petaling Jaya SS2',
  'Ampang Hilir',
];

export const DISTANCE_OPTIONS = ['3KM', '5KM', '6KM', '7KM', '8KM', '10KM', '15KM', '21KM'];

export const CATEGORY_GRADIENTS: Record<EventCategory, [string, string]> = {
  Tempo: ['#0D0B1E', '#1A0A2E'],
  Easy: ['#071A0F', '#0A2818'],
  Trail: ['#1A1208', '#2A1808'],
  Interval: ['#1A0808', '#2A1010'],
  Night: ['#080814', '#10102A'],
  Community: ['#081018', '#0A1A28'],
};
