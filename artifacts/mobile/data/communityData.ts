// ─── Community feed (Xiaohongshu / RED-style) ──────────────────────────
// A run-club community: members post their runs — race-day photos, route
// clips, gear, and Strava results. Browsed as a 2-column masonry feed,
// opened into a swipeable photo/video detail with likes + comments.

export type MediaType = 'image' | 'video';

export interface MediaItem {
  type: MediaType;
  /** Local require() asset (number) or remote URI string. */
  uri: string | number;
  /** width / height — drives masonry card height. Defaults to 1 (square). */
  aspectRatio: number;
  /** Poster frame for videos (local require or remote URI), shown in the feed grid. */
  poster?: string | number;
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

export interface AuthorProfile {
  bio: string;
  followers: number;
  following: number;
}

export const AUTHOR_PROFILES: Record<string, AuthorProfile> = {
  '@eliudkipchoge': {
    bio: 'Marathon world record holder. No human is limited. 🇰🇪',
    followers: 2_400_000,
    following: 12,
  },
  '@usainbolt': {
    bio: '8x Olympic gold medalist. The fastest man who ever lived. 🇯🇲',
    followers: 5_800_000,
    following: 45,
  },
  '@kimkardashian': {
    bio: 'Running is my therapy. Mom, entrepreneur, and morning miles enthusiast. 🏃‍♀️',
    followers: 2_100_000,
    following: 234,
  },
  '@lewishamilton': {
    bio: 'F1 champion & runner. Off-season engine work never stops. 🏎️🏃',
    followers: 1_850_000,
    following: 89,
  },
  '@gomofarah': {
    bio: '4x Olympic gold. Track sessions & long runs. London to KL. 🇬🇧',
    followers: 980_000,
    following: 156,
  },
  '@meilingruns': {
    bio: 'KL sunrise chaser 🌅 Love 10Ks around KLCC Park. Training for my first marathon.',
    followers: 4_200,
    following: 342,
  },
  '@zuscoffeerunclub': {
    bio: 'ZUS Coffee Run Club. Recovery runs + coffee every Saturday. All paces welcome. ☕️',
    followers: 12_500,
    following: 28,
  },
  '@arjunpaces': {
    bio: 'Bangsar hills training for life. PB hunter. Chasing sub-45 for 10K. 🏔️',
    followers: 3_100,
    following: 567,
  },
  '@sarahtanruns': {
    bio: 'Recovery gear evangelist. Easy shakeouts and carbon plates. TTDI loops. 👟',
    followers: 2_800,
    following: 189,
  },
};

export function getAuthorProfile(handle: string): AuthorProfile | undefined {
  return AUTHOR_PROFILES[handle];
}

export function handleForAuthorName(posts: CommunityPost[], name: string): string | undefined {
  const post = posts.find(p => p.authorName === name);
  return post?.authorHandle;
}

export type FeedFilter = 'discover' | 'following' | 'nearby';

// Local post assets — bundled via Metro.
const POST_ASSETS = {
  post1_vid:   require('../assets/posts/post1.mp4'),
  post1_thumb: require('../assets/posts/post1-thumb.png'),
  post2_img:   require('../assets/posts/post2.png'),
  post3_vid:   require('../assets/posts/post3.mp4'),
  post3_thumb: require('../assets/posts/post3-thumb.png'),
  post41_img: require('../assets/posts/post4-1.png'),
  post42_img: require('../assets/posts/post4-2.jpg'),
  post5_img:  require('../assets/posts/post5.jpg'),
  post6_img:  require('../assets/posts/post6.jpg'),
  post7_img:  require('../assets/posts/post7.jpg'),
  post8_img:  require('../assets/posts/post8.jpg'),
  post9_img:  require('../assets/posts/post9.png'),
};

// Real, royalty-free portrait faces (gender-matched). Swap for actual profile
// photos when the feed is backed by real accounts.
const face = (gender: 'men' | 'women', n: number) =>
  `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

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
    media: [{ type: 'video', uri: POST_ASSETS.post1_vid, aspectRatio: 0.57, poster: POST_ASSETS.post1_thumb }],
    tags: ['LongRun', 'Marathon', 'Strava'],
    location: 'KLCC',
    runStats: { distanceKm: 3.24, durationLabel: '17:16', pace: '5:20 /km', source: 'Strava' },
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
    media: [{ type: 'image', uri: POST_ASSETS.post2_img, aspectRatio: 0.57 }],
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
    media: [{ type: 'video', uri: POST_ASSETS.post3_vid, aspectRatio: 0.57, poster: POST_ASSETS.post3_thumb }],
    tags: ['MorningRun', 'PostRun', 'Wellness'],
    location: 'Mont Kiara',
    runStats: { distanceKm: 10.0, durationLabel: '1:02:30', pace: '6:15 /km', source: 'Strava' },
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
    media: [
      { type: 'image', uri: POST_ASSETS.post41_img, aspectRatio: 0.57 },
      { type: 'image', uri: POST_ASSETS.post42_img, aspectRatio: 0.56 },
    ],
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
    media: [{ type: 'image', uri: POST_ASSETS.post5_img, aspectRatio: 0.56 }],
    tags: ['Intervals', 'TrackWork', 'SpeedWork'],
    location: 'TTDI',
    runStats: { distanceKm: 2.01, durationLabel: '13:09', pace: '6:33 /km', source: 'Strava' },
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
    media: [{ type: 'image', uri: POST_ASSETS.post6_img, aspectRatio: 0.56 }],
    tags: ['MorningRun', 'KLCC', '10K'],
    location: 'KLCC',
    runStats: { distanceKm: 6.01, durationLabel: '40:46', pace: '6:47 /km', source: 'Strava' },
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
    media: [{ type: 'image', uri: POST_ASSETS.post7_img, aspectRatio: 0.56 }],
    tags: ['ZUSRunClub', 'MontKiara', 'SocialRun'],
    location: 'Mont Kiara',
    runStats: { distanceKm: 3.24, durationLabel: '17:16', pace: '5:20 /km', source: 'Strava' },
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
    media: [{ type: 'image', uri: POST_ASSETS.post8_img, aspectRatio: 0.56 }],
    tags: ['Bangsar', 'HillRepeats', 'PB'],
    location: 'Bangsar',
    runStats: { distanceKm: 4.30, durationLabel: '29:10', pace: '6:47 /km', source: 'Strava' },
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
    media: [{ type: 'image', uri: POST_ASSETS.post9_img, aspectRatio: 0.69 }],
    tags: ['Gear', 'RunningShoes', 'Easy'],
    location: 'TTDI',
    runStats: { distanceKm: 10.0, durationLabel: '1:02:30', pace: '6:15 /km', source: 'Strava' },
    likeCount: 96,
    commentCount: 0,
    savedCount: 64,
    createdAt: '2026-06-15T13:00:00Z',
  },

  // ── Second posts for each author (seeded for profile grids) ────────────
  {
    id: 'p1b',
    authorName: 'Eliud Kipchoge',
    authorHandle: '@eliudkipchoge',
    authorInitials: 'EK',
    authorColor: '#10B981',
    authorAvatar: face('men', 32),
    isVerified: true,
    title: 'Tempo Tuesday — 5 x 1km repeats ✅',
    caption:
      'Sharp session today. 3:05 / 3:08 / 3:05 / 3:07 / 3:04 with 400m recovery jog. Legs felt springy. The work you put in is the work you get out.',
    media: [{ type: 'image', uri: POST_ASSETS.post5_img, aspectRatio: 0.56 }],
    tags: ['Tempo', 'Interval', 'TrackWork'],
    location: 'Kaptagat',
    runStats: { distanceKm: 12.0, durationLabel: '38:10', pace: '3:11 /km', source: 'Strava' },
    likeCount: 8_432,
    commentCount: 14,
    savedCount: 1_240,
    createdAt: '2026-06-10T06:00:00Z',
  },
  {
    id: 'p2b',
    authorName: 'Usain Bolt',
    authorHandle: '@usainbolt',
    authorInitials: 'UB',
    authorColor: '#F59E0B',
    authorAvatar: face('men', 45),
    isVerified: true,
    title: 'Easy 3K shakeout after the gym',
    caption:
      'Leg day + recovery run combo. Nothing fancy, just keeping the blood flowing. Who else does cross-training with their runs?',
    media: [{ type: 'image', uri: POST_ASSETS.post6_img, aspectRatio: 0.56 }],
    tags: ['Recovery', 'CrossTraining', 'Easy'],
    location: 'Kingston',
    runStats: { distanceKm: 3.0, durationLabel: '18:30', pace: '6:10 /km', source: 'Strava' },
    likeCount: 15_210,
    commentCount: 42,
    savedCount: 2_890,
    createdAt: '2026-06-14T17:30:00Z',
  },
  {
    id: 'p3b',
    authorName: 'Kim Kardashian',
    authorHandle: '@kimkardashian',
    authorInitials: 'KK',
    authorColor: '#8B5CF6',
    authorAvatar: face('women', 44),
    isVerified: true,
    title: 'Evening 5K with my sisters 👯‍♀️',
    caption:
      'Khloé and I bet on who could run the faster mile — I won by 12 seconds! 😜 Sister competition is real. Fun sunset vibes though.',
    media: [
      { type: 'image', uri: POST_ASSETS.post7_img, aspectRatio: 0.56 },
      { type: 'image', uri: POST_ASSETS.post8_img, aspectRatio: 0.56 },
    ],
    tags: ['SocialRun', 'EveningRun', '5K'],
    location: 'Hidden Hills',
    runStats: { distanceKm: 5.2, durationLabel: '32:45', pace: '6:18 /km', source: 'Strava' },
    likeCount: 12_890,
    commentCount: 28,
    savedCount: 1_450,
    createdAt: '2026-06-13T19:45:00Z',
  },
  {
    id: 'p4b',
    authorName: 'Lewis Hamilton',
    authorHandle: '@lewishamilton',
    authorInitials: 'LH',
    authorColor: '#0EA5E9',
    authorAvatar: face('men', 51),
    isVerified: true,
    title: 'Hill repeats in the rain 🌧️',
    caption:
      'Bangsar hills never get easier — but today they were wet and slippery. 8 x 400m with jog down. Still hit sub-70s on every rep. Grateful.',
    media: [{ type: 'image', uri: POST_ASSETS.post2_img, aspectRatio: 0.57 }],
    tags: ['HillRepeats', 'Bangsar', 'RainRun'],
    location: 'Bangsar',
    runStats: { distanceKm: 8.5, durationLabel: '41:30', pace: '4:53 /km', elevationM: 145, source: 'Strava' },
    likeCount: 9_450,
    commentCount: 19,
    savedCount: 890,
    createdAt: '2026-06-11T17:20:00Z',
  },
  {
    id: 'p5b',
    authorName: 'Mo Farah',
    authorHandle: '@gomofarah',
    authorInitials: 'MF',
    authorColor: '#EF4444',
    authorAvatar: face('men', 27),
    isVerified: true,
    title: 'Long Sunday — 28km done 🫠',
    caption:
      'The real work happens when nobody is watching. Felt heavy at 20km but kept the turnover. Coffee taste better after this.',
    media: [{ type: 'image', uri: POST_ASSETS.post9_img, aspectRatio: 0.69 }],
    tags: ['LongRun', 'Sunday', 'Grind'],
    location: 'London',
    runStats: { distanceKm: 28.0, durationLabel: '2:38:00', pace: '5:38 /km', source: 'Strava' },
    likeCount: 5_670,
    commentCount: 11,
    savedCount: 680,
    createdAt: '2026-06-12T07:15:00Z',
  },
  {
    id: 'p6b',
    authorName: 'Mei Ling',
    authorHandle: '@meilingruns',
    authorInitials: 'ML',
    authorColor: '#8B5CF6',
    authorAvatar: face('women', 65),
    isVerified: false,
    title: 'Tried trail running for the first time! 🌿',
    caption:
      'Usually stick to roads around KLCC but decided to explore Bukit Kiara trails today. My calves are DESTROYED but the views were 100% worth it. Who wants to guide me next time?',
    media: [{ type: 'image', uri: POST_ASSETS.post41_img, aspectRatio: 0.57 }],
    tags: ['Trail', 'BukitKiara', 'Adventure'],
    location: 'Bukit Kiara',
    runStats: { distanceKm: 7.5, durationLabel: '52:30', pace: '7:00 /km', elevationM: 180, source: 'Strava' },
    likeCount: 412,
    commentCount: 8,
    savedCount: 67,
    createdAt: '2026-06-10T06:30:00Z',
  },
  {
    id: 'p7b',
    authorName: 'ZUS Coffee Run Club',
    authorHandle: '@zuscoffeerunclub',
    authorInitials: 'ZC',
    authorColor: '#0EA5E9',
    isVerified: true,
    title: 'Weekly Route Recap: Kiara Hills Loop 📍',
    caption:
      '45 runners showed up for our Sunday long run! 12km route with a coffee stop halfway. Thanks to the ZUS team for the fuel — see you next Saturday!',
    media: [
      { type: 'image', uri: POST_ASSETS.post42_img, aspectRatio: 0.56 },
      { type: 'image', uri: POST_ASSETS.post5_img, aspectRatio: 0.56 },
    ],
    tags: ['ZUSRunClub', 'KiaraHill', 'LongRun'],
    location: 'Mont Kiara',
    runStats: { distanceKm: 12.0, durationLabel: '1:08:00', pace: '5:40 /km', source: 'Strava' },
    likeCount: 678,
    commentCount: 5,
    savedCount: 145,
    createdAt: '2026-06-09T10:00:00Z',
  },
  {
    id: 'p8b',
    authorName: 'Arjun R.',
    authorHandle: '@arjunpaces',
    authorInitials: 'AR',
    authorColor: '#10B981',
    authorAvatar: face('men', 12),
    isVerified: false,
    title: 'Failed at negative splits today 😅',
    caption:
      'Went out too fast on the first 5K and paid for it on the way back. 4:45 → 5:12 pace. Lesson learned: patience pays off. Back at it Thursday.',
    media: [{ type: 'image', uri: POST_ASSETS.post6_img, aspectRatio: 0.56 }],
    tags: ['Bangsar', 'Training', 'LessonLearned'],
    location: 'Bangsar',
    runStats: { distanceKm: 10.0, durationLabel: '50:20', pace: '5:02 /km', elevationM: 220, source: 'Strava' },
    likeCount: 156,
    commentCount: 4,
    savedCount: 23,
    createdAt: '2026-06-13T18:45:00Z',
  },
  {
    id: 'p9b',
    authorName: 'Sarah Tan',
    authorHandle: '@sarahtanruns',
    authorInitials: 'ST',
    authorColor: '#EF4444',
    authorAvatar: face('women', 68),
    isVerified: false,
    title: 'Morning shakeout in my new Altras 🎉',
    caption:
      'Finally upgraded to carbon plates! Did an easy 3K around TTDI Park to break them in. First impressions — these feel FAST. Can\'t wait to test them on a tempo run next week.',
    media: [{ type: 'image', uri: POST_ASSETS.post8_img, aspectRatio: 0.56 }],
    tags: ['Gear', 'Altras', 'Easy'],
    location: 'TTDI',
    runStats: { distanceKm: 3.0, durationLabel: '19:30', pace: '6:30 /km', source: 'Strava' },
    likeCount: 72,
    commentCount: 2,
    savedCount: 18,
    createdAt: '2026-06-12T07:20:00Z',
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
