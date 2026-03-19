create table if not exists public.economy_sim_scores (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(player_name) between 1 and 40),
  score numeric not null,
  gdp numeric not null,
  debt numeric not null,
  inflation numeric not null,
  unemployment numeric not null,
  years_completed integer not null,
  created_at timestamptz not null default now()
);

alter table public.economy_sim_scores enable row level security;

create policy "public can read economy sim scores"
on public.economy_sim_scores
for select
to anon
using (true);

create policy "public can insert economy sim scores"
on public.economy_sim_scores
for insert
to anon
with check (true);
