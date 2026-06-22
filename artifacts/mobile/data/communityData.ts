// ─── Community feed (Xiaohongshu / RED-style) ──────────────────────────
// A run-club community: members post their runs — race-day photos, route
// clips, gear, and Strava results. Browsed as a 2-column masonry feed,
// opened into a swipeable photo/video detail with likes + comments.

export type MediaType = 'image' | 'video';

export interface MediaItem {
  type: MediaType;
  uri: string;
  /** width / height — drives masonry card height. Defaults to 1 (square). */
  aspectRatio: number;
  /** Poster frame for videos, shown in the feed grid. */
  poster?: string;
}

/** A synced activity attached to a post (Strava-style result card). */
export interface RunStats {
  distanceKm: number;
  /** Elapsed time, e.g. "52:40" or "1:42:30". */
  durationLabel: string;
  /** Average pace, e.g. "5:16 /km". */
  pace: string;
  elevationM?: number;
  source: 'Strava' | 'Garmin' | 'Manual';
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorInitials: string;
  authorColor: string;
  /** Real face photo; falls back to colored initials when absent (e.g. clubs / your own posts). */
  authorAvatar?: string;
  isVerified: boolean;
  title: string;
  caption: string;
  media: MediaItem[];
  tags: string[];
  location?: string;
  runStats?: RunStats;
  likeCount: number;
  commentCount: number;
  savedCount: number;
  createdAt: string; // ISO
  isUserCreated?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  authorAvatar?: string;
  body: string;
  createdAt: string; // ISO
}

export type FeedFilter = 'discover' | 'following' | 'nearby';

// Running-themed cover photos — curated, verified Unsplash photo IDs served at
// exact crop dimensions, so aspectRatio (= w/h) always matches the file.
const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=70`;

// Real, royalty-free portrait faces (gender-matched). Swap for actual profile
// photos when the feed is backed by real accounts.
const face = (gender: 'men' | 'women', n: number) =>
  `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

// Google's public test bucket — stable sample videos for the demo.
const SAMPLE_VIDEO_1 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SAMPLE_VIDEO_2 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

export const INITIAL_POSTS: CommunityPost[] = [
  // ── Celebrity runners (faces are royalty-free stand-ins) ──────────────
  {
    id: 'p1',
    authorName: 'Eliud Kipchoge',
    authorHandle: '@eliudkipchoge',
    authorInitials: 'EK',
    authorColor: '#10B981',
    authorAvatar: face('men', 32),
    isVerified: true,
    title: '30K long run done — no human is limited 🏃‍♂️',
    caption:
      'Easy effort, controlled breathing, smooth all the way. The long run is where the marathon is won. Building quietly for the next one. Asante to everyone who joined the last 10K!',
    media: [{ type: 'image', uri: photo('1571008887538-b36bb32f4571', 800, 1000), aspectRatio: 0.8 }],
    tags: ['LongRun', 'Marathon', 'Strava'],
    location: 'KLCC',
    runStats: { distanceKm: 30.0, durationLabel: '1:42:30', pace: '3:25 /km', elevationM: 180, source: 'Strava' },
    likeCount: 4821,
    commentCount: 2,
    savedCount: 612,
    createdAt: '2026-06-20T06:30:00Z',
  },
  {
    id: 'p2',
    authorName: 'Usain Bolt',
    authorHandle: '@usainbolt',
    authorInitials: 'UB',
    authorColor: '#F59E0B',
    authorAvatar: face('men', 45),
    isVerified: true,
    title: 'Slowest 5K of my life 😂 and the most fun',
    caption:
      'Pulled up to the run club for an easy social run and coffee after. Distance running is NOT my event but the vibes? Unmatched. Respect to all you marathon people.',
    media: [{ type: 'video', uri: SAMPLE_VIDEO_1, aspectRatio: 0.75, poster: photo('1552674605-db6ffd4facb5', 600, 800) }],
    tags: ['SocialRun', 'Recovery', 'KLCC'],
    location: 'KLCC',
    runStats: { distanceKm: 5.0, durationLabel: '24:10', pace: '4:50 /km', source: 'Strava' },
    likeCount: 9214,
    commentCount: 2,
    savedCount: 1043,
    createdAt: '2026-06-19T18:10:00Z',
  },
  {
    id: 'p3',
    authorName: 'Kim Kardashian',
    authorHandle: '@kimkardashian',
    authorInitials: 'KK',
    authorColor: '#8B5CF6',
    authorAvatar: face('women', 44),
    isVerified: true,
    title: 'Morning miles + matcha 🍵',
    caption:
      'Got my shakeout in before the chaos of the day. Running is my therapy honestly — clears my head every single time. Smoothie recipe in the comments if you want it 💚',
    media: [
      { type: 'image', uri: photo('1495555687398-3f50d6e79e1e', 800, 1000), aspectRatio: 0.8 },
      { type: 'image', uri: photo('1455165814004-1126a7199f9b', 800, 800), aspectRatio: 1 },
    ],
    tags: ['MorningRun', 'PostRun', 'Wellness'],
    location: 'Mont Kiara',
    runStats: { distanceKm: 6.4, durationLabel: '39:20', pace: '6:08 /km', source: 'Strava' },
    likeCount: 7658,
    commentCount: 0,
    savedCount: 489,
    createdAt: '2026-06-19T07:05:00Z',
  },
  {
    id: 'p4',
    authorName: 'Lewis Hamilton',
    authorHandle: '@lewishamilton',
    authorInitials: 'LH',
    authorColor: '#0EA5E9',
    authorAvatar: face('men', 51),
    isVerified: true,
    title: 'Off-season engine work 🏎️ ➡️ 🏃',
    caption:
      'F1 fitness never stops. Tempo run to keep the cardio sharp between races — the neck and core work is brutal but the running keeps me honest. Negative split, happy with that.',
    media: [{ type: 'video', uri: SAMPLE_VIDEO_2, aspectRatio: 1.33, poster: photo('1502904550040-7534597429ae', 800, 600) }],
    tags: ['Tempo', 'Training', 'Strava'],
    location: 'Bangsar',
    runStats: { distanceKm: 10.0, durationLabel: '42:15', pace: '4:13 /km', elevationM: 95, source: 'Strava' },
    likeCount: 6127,
    commentCount: 0,
    savedCount: 377,
    createdAt: '2026-06-18T17:40:00Z',
  },
  {
    id: 'p5',
    authorName: 'Mo Farah',
    authorHandle: '@gomofarah',
    authorInitials: 'MF',
    authorColor: '#EF4444',
    authorAvatar: face('men', 27),
    isVerified: true,
    title: 'Track session 🔥 12 x 400m',
    caption:
      'Speed work with the crew this morning. The track never lies. Legs are absolutely cooked but this is how you sharpen up. Who else is putting in the interval work?',
    media: [{ type: 'image', uri: photo('1486218119243-13883505764c', 800, 800), aspectRatio: 1 }],
    tags: ['Intervals', 'TrackWork', 'SpeedWork'],
    location: 'TTDI',
    runStats: { distanceKm: 8.0, durationLabel: '32:00', pace: '4:00 /km', source: 'Strava' },
    likeCount: 3382,
    commentCount: 0,
    savedCount: 254,
    createdAt: '2026-06-18T07:20:00Z',
  },

  // ── Local KL run-club members ─────────────────────────────────────────
  {
    id: 'p6',
    authorName: 'Mei Ling',
    authorHandle: '@meilingruns',
    authorInitials: 'ML',
    authorColor: '#8B5CF6',
    authorAvatar: face('women', 65),
    isVerified: false,
    title: 'Sunrise 10K around KLCC Park 🌅',
    caption:
      'Woke up at 5am and it was so worth it. The light hitting the Twin Towers is unreal at this hour. Negative split the whole way and felt amazing. Who else loves early runs?',
    media: [
      { type: 'image', uri: photo('1476480862126-209bfaa8edc8', 800, 1000), aspectRatio: 0.8 },
      { type: 'image', uri: photo('1461896836934-ffe607ba8211', 800, 600), aspectRatio: 1.33 },
    ],
    tags: ['MorningRun', 'KLCC', '10K'],
    location: 'KLCC',
    runStats: { distanceKm: 10.0, durationLabel: '52:40', pace: '5:16 /km', elevationM: 42, source: 'Strava' },
    likeCount: 248,
    commentCount: 3,
    savedCount: 41,
    createdAt: '2026-06-17T06:40:00Z',
  },
  {
    id: 'p7',
    authorName: 'ZUS Coffee Run Club',
    authorHandle: '@zuscoffeerunclub',
    authorInitials: 'ZC',
    authorColor: '#0EA5E9',
    isVerified: true,
    title: 'Recap: Mont Kiara Social Run ☕️',
    caption:
      'Another packed Saturday! 78 runners showed up for the recovery run + coffee. Tap save if you want the 1-for-1 Iced Spanish Latte voucher next week. See you all Saturday!',
    media: [{ type: 'video', uri: SAMPLE_VIDEO_1, aspectRatio: 0.75, poster: photo('1517649763962-0c623066013b', 600, 800) }],
    tags: ['ZUSRunClub', 'MontKiara', 'SocialRun'],
    location: 'Mont Kiara',
    likeCount: 512,
    commentCount: 2,
    savedCount: 130,
    createdAt: '2026-06-16T10:15:00Z',
  },
  {
    id: 'p8',
    authorName: 'Arjun R.',
    authorHandle: '@arjunpaces',
    authorInitials: 'AR',
    authorColor: '#10B981',
    authorAvatar: face('men', 12),
    isVerified: false,
    title: 'New PB at the Bangsar hills 💪',
    caption:
      'Those climbs nearly broke me but the view from the top made up for it. 10K in 48:32, knocked 40 seconds off my best. Hill repeats really do work. Strava attached, no cap.',
    media: [{ type: 'image', uri: photo('1487956382158-bb926046304a', 800, 1100), aspectRatio: 0.72 }],
    tags: ['Bangsar', 'HillRepeats', 'PB'],
    location: 'Bangsar',
    runStats: { distanceKm: 10.0, durationLabel: '48:32', pace: '4:51 /km', elevationM: 240, source: 'Strava' },
    likeCount: 187,
    commentCount: 1,
    savedCount: 22,
    createdAt: '2026-06-16T18:30:00Z',
  },
  {
    id: 'p9',
    authorName: 'Sarah Tan',
    authorHandle: '@sarahtanruns',
    authorInitials: 'ST',
    authorColor: '#EF4444',
    authorAvatar: face('women', 68),
    isVerified: false,
    title: 'Gear check + easy 5K shakeout 👟',
    caption:
      'New carbon plates, easy shakeout to break them in. Swipe for the rotation — tempo pair vs recovery pair. Honestly the recovery pair changed my life, knees thank me daily.',
    media: [
      { type: 'image', uri: photo('1517836357463-d25dfeac3438', 800, 800), aspectRatio: 1 },
      { type: 'image', uri: photo('1540497077202-7c8a3999166f', 800, 800), aspectRatio: 1 },
      { type: 'image', uri: photo('1508215885820-4585e56135c8', 800, 600), aspectRatio: 1.33 },
    ],
    tags: ['Gear', 'RunningShoes', 'Easy'],
    location: 'TTDI',
    runStats: { distanceKm: 5.0, durationLabel: '30:10', pace: '6:02 /km', source: 'Strava' },
    likeCount: 96,
    commentCount: 0,
    savedCount: 64,
    createdAt: '2026-06-15T13:00:00Z',
  },
  {
    id: 'p10',
    authorName: 'Daniel Lim',
    authorHandle: '@danlimruns',
    authorInitials: 'DL',
    authorColor: '#5AA0A0',
    authorAvatar: face('men', 76),
    isVerified: false,
    title: 'Marathon block week 6 done ✅ 64km',
    caption:
      'Biggest week of the block — longest run 28km this morning and the legs are cooked, but the fitness bank is building. KL Marathon, I am coming for you.',
    media: [{ type: 'image', uri: photo('1538805060514-97d9cc17730c', 800, 900), aspectRatio: 0.89 }],
    tags: ['Marathon', 'Training', 'KLMarathon'],
    location: 'KLCC',
    runStats: { distanceKm: 28.0, durationLabel: '2:31:00', pace: '5:24 /km', elevationM: 130, source: 'Strava' },
    likeCount: 209,
    commentCount: 0,
    savedCount: 47,
    createdAt: '2026-06-15T07:10:00Z',
  },
];

export const INITIAL_COMMENTS: PostComment[] = [
  // p1 — Kipchoge
  {
    id: 'c1',
    postId: 'p1',
    authorName: 'Daniel Lim',
    authorInitials: 'DL',
    authorColor: '#5AA0A0',
    authorAvatar: face('men', 76),
    body: 'GOAT 🐐 3:25 pace on an EASY run is just unfair',
    createdAt: '2026-06-20T07:00:00Z',
  },
  {
    id: 'c2',
    postId: 'p1',
    authorName: 'Nadia H.',
    authorInitials: 'NH',
    authorColor: '#F59E0B',
    authorAvatar: face('women', 52),
    body: 'Saving this for motivation on my next long run 🙌',
    createdAt: '2026-06-20T07:35:00Z',
  },
  // p2 — Usain Bolt
  {
    id: 'c3',
    postId: 'p2',
    authorName: 'Mei Ling',
    authorInitials: 'ML',
    authorColor: '#8B5CF6',
    authorAvatar: face('women', 65),
    body: 'Fastest “slow” run I’ve ever seen 😂😂',
    createdAt: '2026-06-19T18:40:00Z',
  },
  {
    id: 'c4',
    postId: 'p2',
    authorName: 'Arjun R.',
    authorInitials: 'AR',
    authorColor: '#10B981',
    authorAvatar: face('men', 12),
    body: 'Wait the LEGEND pulled up to OUR run club?? 🐐⚡',
    createdAt: '2026-06-19T19:05:00Z',
  },
  // p6 — Mei Ling sunrise 10K
  {
    id: 'c5',
    postId: 'p6',
    authorName: 'Daniel Lim',
    authorInitials: 'DL',
    authorColor: '#5AA0A0',
    authorAvatar: face('men', 76),
    body: 'That light is insane 🔥 need to start waking up earlier',
    createdAt: '2026-06-17T07:05:00Z',
  },
  {
    id: 'c6',
    postId: 'p6',
    authorName: 'Sarah Tan',
    authorInitials: 'ST',
    authorColor: '#EF4444',
    authorAvatar: face('women', 68),
    body: 'Negative split queen 👑 what was your avg HR?',
    createdAt: '2026-06-17T07:22:00Z',
  },
  {
    id: 'c7',
    postId: 'p6',
    authorName: 'Mei Ling',
    authorInitials: 'ML',
    authorColor: '#8B5CF6',
    authorAvatar: face('women', 65),
    body: '@sarahtanruns held low 150s the whole way, felt super smooth!',
    createdAt: '2026-06-17T07:40:00Z',
  },
  // p7 — ZUS Coffee Run Club
  {
    id: 'c8',
    postId: 'p7',
    authorName: 'Arjun R.',
    authorInitials: 'AR',
    authorColor: '#10B981',
    authorAvatar: face('men', 12),
    body: 'Saved! See you Saturday ☕️',
    createdAt: '2026-06-16T11:00:00Z',
  },
  {
    id: 'c9',
    postId: 'p7',
    authorName: 'Nadia H.',
    authorInitials: 'NH',
    authorColor: '#F59E0B',
    authorAvatar: face('women', 52),
    body: 'Best run club in KL, no debate 💚',
    createdAt: '2026-06-16T12:30:00Z',
  },
  // p8 — Arjun PB
  {
    id: 'c10',
    postId: 'p8',
    authorName: 'Perry Kuan',
    authorInitials: 'PK',
    authorColor: '#8B5CF6',
    authorAvatar: face('men', 83),
    body: 'Big PB! Those hills pay off 💪 see you Thursday for tempo',
    createdAt: '2026-06-16T19:15:00Z',
  },
];

// Tag suggestions surfaced in the create flow.
export const SUGGESTED_TAGS = [
  'MorningRun',
  'NightRun',
  'Trail',
  'Tempo',
  'LongRun',
  'Intervals',
  'PB',
  'Gear',
  'PostRun',
  'SocialRun',
  'Marathon',
  'Strava',
  'KLCC',
  'Bangsar',
  'MontKiara',
  'TTDI',
  'DesaParkCity',
  'KiaraHill',
];

/**
 * Split posts into two columns for the masonry feed, always placing the next
 * post in the currently-shorter column. Heights are estimated from the cover
 * media's aspect ratio plus a fixed text block.
 */
export function splitIntoColumns(
  posts: CommunityPost[],
  columnWidth: number,
): [CommunityPost[], CommunityPost[]] {
  const left: CommunityPost[] = [];
  const right: CommunityPost[] = [];
  let leftH = 0;
  let rightH = 0;
  const TEXT_BLOCK = 96; // title + author row + paddings

  for (const post of posts) {
    const cover = post.media[0];
    const ar = cover?.aspectRatio && cover.aspectRatio > 0 ? cover.aspectRatio : 1;
    const estHeight = columnWidth / ar + TEXT_BLOCK;
    if (leftH <= rightH) {
      left.push(post);
      leftH += estHeight;
    } else {
      right.push(post);
      rightH += estHeight;
    }
  }
  return [left, right];
}
