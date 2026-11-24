-- Reaction Snake public stats schema. Run in Supabase SQL Editor.
create table if not exists public.game_events (
 id bigint generated always as identity primary key,
 visitor_id text not null check (char_length(visitor_id) between 16 and 80),
 event_type text not null check (event_type in ('page_view','game_finished','mode_selected')),
 mode text not null default 'classic' check (mode in ('classic','reflex','survival','precision','daily')),
 score integer not null default 0 check (score between 0 and 1000000),
 visit_day date not null default (now() at time zone 'utc')::date,
 created_at timestamptz not null default now()
);
create unique index if not exists game_events_one_visit_per_day on public.game_events(visitor_id,visit_day) where event_type='page_view';
alter table public.game_events enable row level security;
revoke all on public.game_events from anon, authenticated;
grant insert on public.game_events to anon;
drop policy if exists "public can add game stats" on public.game_events;
create policy "public can add game stats" on public.game_events for insert to anon
 with check (char_length(visitor_id) between 16 and 80 and event_type in ('page_view','game_finished','mode_selected') and mode in ('classic','reflex','survival','precision','daily') and score between 0 and 1000000);
create or replace function public.reaction_snake_stats() returns json language sql security definer set search_path = '' as $$
 select json_build_object(
 'visits',(select count(*) from public.game_events where event_type='page_view'),
 'games',(select count(*) from public.game_events where event_type='game_finished'),
 'best',coalesce((select max(score) from public.game_events where event_type='game_finished'),0),
 'popular_mode',coalesce((select mode from public.game_events where event_type in ('game_finished','mode_selected') group by mode order by count(*) desc,mode asc limit 1),'—')
 );
$$;
revoke all on function public.reaction_snake_stats() from public;
grant execute on function public.reaction_snake_stats() to anon;
