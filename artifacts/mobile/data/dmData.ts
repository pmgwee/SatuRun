// ─── Direct messages (1:1) ─────────────────────────────────────────────
// Seeded conversations keyed by author handle. `me` is the current user
// (Alex Chen), `them` is the profile owner. Used by the dm/[handle] screen.

export interface DmMessage {
  id: string;
  /** 'me' = the current user, 'them' = the profile owner being messaged. */
  from: 'me' | 'them';
  body: string;
  createdAt: string; // ISO
}

export const INITIAL_DMS: Record<string, DmMessage[]> = {
  // A friendly exchange with Eliud covering: a run-together date, shoe
  // recommendations, and the run clubs he's joined while in KL.
  '@eliudkipchoge': [
    {
      id: 'd1',
      from: 'me',
      body: "Hey Eliud! Massive fan 🙌 Would love to run together while you're in KL. Are you free any morning next week around KLCC?",
      createdAt: '2026-06-22T20:14:00Z',
    },
    {
      id: 'd2',
      from: 'them',
      body: "Asante! Always happy to share miles. I'm in KL until the 28th — free Saturday the 27th for a 6am easy 10K. Does that work for you?",
      createdAt: '2026-06-22T20:31:00Z',
    },
    {
      id: 'd3',
      from: 'me',
      body: '6am on the 27th works perfectly. I’ll bring water and map the loop 🙏',
      createdAt: '2026-06-22T20:35:00Z',
    },
    {
      id: 'd4',
      from: 'me',
      body: 'Also — what shoes do you actually train in day to day? Mine are shot and I need to replace them.',
      createdAt: '2026-06-22T20:36:00Z',
    },
    {
      id: 'd5',
      from: 'them',
      body: "For easy days I rotate the Alphafly for long efforts and a cushioned daily trainer for everything else. One rule: don't race in your trainers — save the super shoes for hard days.",
      createdAt: '2026-06-22T20:44:00Z',
    },
    {
      id: 'd6',
      from: 'me',
      body: 'Makes sense. Any daily trainer you’d recommend for someone chasing a 10K PB?',
      createdAt: '2026-06-22T20:47:00Z',
    },
    {
      id: 'd7',
      from: 'them',
      body: 'The Pegasus or the Saucony Ride — durable and not too soft. Go a half size up for long runs. The foam should still feel lively, not mushy.',
      createdAt: '2026-06-22T20:52:00Z',
    },
    {
      id: 'd8',
      from: 'me',
      body: 'Perfect, thanks 🙏 Last one — what run clubs are you running with while you’re here?',
      createdAt: '2026-06-23T07:02:00Z',
    },
    {
      id: 'd9',
      from: 'them',
      body: 'Joined the ZUS Coffee Run Club last Saturday — lovely recovery vibe and great coffee after. Also heard good things about the TTDI night runs on Thursdays.',
      createdAt: '2026-06-23T07:15:00Z',
    },
    {
      id: 'd10',
      from: 'me',
      body: "I'll come to ZUS this Saturday then! See you there and on the 27th 🏃",
      createdAt: '2026-06-23T07:18:00Z',
    },
  ],
};
