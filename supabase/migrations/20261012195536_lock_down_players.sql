-- players: readable by logged-in players only; the browser may change
-- nothing but its own display name. Scores are written by the server.

alter policy "Public profiles are viewable by everyone." on public.players
  rename to "Players can see the leaderboard.";
alter policy "Players can see the leaderboard." on public.players
  to authenticated
  using (true);

-- Rows are created by the sign-up trigger, never by the browser.
alter policy "Users can insert their own profile." on public.players
  rename to "Players are created by the sign-up trigger.";
alter policy "Players are created by the sign-up trigger." on public.players
  to authenticated
  with check (false);

alter policy "Users can update own profile." on public.players
  rename to "Players can rename themselves.";
alter policy "Players can rename themselves." on public.players
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on public.players from anon, authenticated;
grant select on public.players to authenticated;
grant update (name) on public.players to authenticated;

alter table public.players
  alter column name set not null,
  add constraint players_name_length
    check (char_length(btrim(name)) between 1 and 30);

-- Deleting a user in the dashboard also removes their player and answers.
alter table public.players
  drop constraint players_id_fkey,
  add constraint players_id_fkey
    foreign key (id) references auth.users (id)
    on update cascade on delete cascade;
