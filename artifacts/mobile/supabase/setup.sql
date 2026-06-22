-- SatuRun (PACE) — real-time run chat schema.
-- Paste this into your Supabase project: SQL Editor → New query → Run.

create table if not exists public.run_messages (
  id          uuid primary key default gen_random_uuid(),
  run_id      text not null,
  user_id     text not null,
  display_name text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists run_messages_run_id_created_idx
  on public.run_messages (run_id, created_at);

-- Enable Realtime so new messages stream to every device.
alter publication supabase_realtime add table public.run_messages;

-- Row Level Security.
-- MVP policy: anyone (incl. anonymous) can read and post. Tighten later with auth.
alter table public.run_messages enable row level security;

create policy "run_messages_select" on public.run_messages
  for select using (true);

create policy "run_messages_insert" on public.run_messages
  for insert with check (true);
