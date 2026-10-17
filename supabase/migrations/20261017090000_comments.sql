-- Comments on the "Austausch" page. A comment belongs to one door (year and
-- door), or to the general corner outside the Advent days (both null).
-- Only the server reads and writes them, so it can hide the comments of a
-- door from everyone who hasn't answered that door yet.
create table public.comments (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  player_id uuid not null references public.players (id) on delete cascade,
  year int,
  door int,
  body text not null,
  constraint comments_door check (
    (year is null and door is null)
    or (year between 2023 and 2100 and door between 1 and 24)
  ),
  constraint comments_body check (char_length(body) between 1 and 1000)
);

create index comments_thread on public.comments (year, door, created_at);
create index comments_player on public.comments (player_id);

-- No policies: browsers can't read or write directly, only the server
-- with the service role.
alter table public.comments enable row level security;
