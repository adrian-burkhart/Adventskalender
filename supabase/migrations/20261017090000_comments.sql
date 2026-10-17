-- Comments on the "Austausch" page: one shared column for everyone. Only
-- the server reads and writes them, and only for players who have answered
-- every door of the current year that is open so far, so nothing gets
-- spoiled.
create table public.comments (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  -- Set when the author changes the text.
  edited_at timestamptz,
  player_id uuid not null references public.players (id) on delete cascade,
  body text not null,
  constraint comments_body check (char_length(body) between 1 and 1000)
);

create index comments_created on public.comments (created_at);
create index comments_player on public.comments (player_id);

-- One row per player and emoji on a comment; tapping again removes it.
create table public.comment_reactions (
  comment_id bigint not null references public.comments (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, player_id, emoji),
  constraint comment_reactions_emoji check (char_length(emoji) between 1 and 8)
);

create index comment_reactions_player on public.comment_reactions (player_id);

-- No policies: browsers can't read or write directly, only the server
-- with the service role.
alter table public.comments enable row level security;
alter table public.comment_reactions enable row level security;
