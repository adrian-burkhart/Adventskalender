-- Comments on the "Austausch" page: one shared column for everyone. Only
-- the server reads and writes them, and only for players who have answered
-- every door of the current year that is open so far, so nothing gets
-- spoiled.
create table public.comments (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  player_id uuid not null references public.players (id) on delete cascade,
  body text not null,
  constraint comments_body check (char_length(body) between 1 and 1000)
);

create index comments_created on public.comments (created_at);
create index comments_player on public.comments (player_id);

-- No policies: browsers can't read or write directly, only the server
-- with the service role.
alter table public.comments enable row level security;
