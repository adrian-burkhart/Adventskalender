-- E-mails to players: one reminder per season for those who stopped
-- opening doors, and the winner announcement on January 1st. The log makes
-- sure each goes out at most once per player and year.

create table private.email_log (
  player_id uuid not null references public.players (id) on delete cascade,
  year int not null,
  kind text not null check (kind in ('reminder', 'winner')),
  sent_at timestamptz not null default now(),
  primary key (player_id, year, kind)
);

revoke all on private.email_log from public, anon, authenticated;

-- Players who opened at least one door this year, but none for three days,
-- still have doors left and haven't had the reminder yet.
create function public.reminder_candidates(p_year int, p_open_doors int)
  returns table (player_id uuid, name text, email text, opened int)
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select p.id, p.name, u.email::text, count(*)::int
    from public.answers a
    join public.players p on p.id = a.player_id
    join auth.users u on u.id = p.id
   where a.year = p_year
     and u.email is not null
     and not exists (
       select 1 from private.email_log l
        where l.player_id = p.id and l.year = p_year and l.kind = 'reminder')
   group by p.id, p.name, u.email
  having max(a.opened_at) < now() - interval '3 days'
     and count(*) < p_open_doors;
$$;

-- Everyone who took part in a year, with their points and place.
create function public.season_players(p_year int)
  returns table (player_id uuid, name text, email text, score int, place int)
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select p.id, p.name, u.email::text, s.score,
         (rank() over (order by s.score desc))::int
    from private.year_scores s
    join public.players p on p.id = s.player_id
    join auth.users u on u.id = p.id
   where s.year = p_year
     and s.doors > 0
     and u.email is not null;
$$;

-- Claims an e-mail before it is sent: true only for the first caller.
create function public.claim_email(p_player uuid, p_year int, p_kind text)
  returns boolean
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  claimed int;
begin
  insert into private.email_log (player_id, year, kind)
  values (p_player, p_year, p_kind)
  on conflict do nothing;
  get diagnostics claimed = row_count;
  return claimed = 1;
end;
$$;

-- Gives a claim back when sending failed, so the next run tries again.
create function public.release_email(p_player uuid, p_year int, p_kind text)
  returns void
  language sql
  security definer
  set search_path to ''
as $$
  delete from private.email_log
   where player_id = p_player and year = p_year and kind = p_kind;
$$;

revoke execute on function public.reminder_candidates(int, int) from public, anon, authenticated;
revoke execute on function public.season_players(int) from public, anon, authenticated;
revoke execute on function public.claim_email(uuid, int, text) from public, anon, authenticated;
revoke execute on function public.release_email(uuid, int, text) from public, anon, authenticated;
grant execute on function public.reminder_candidates(int, int) to service_role;
grant execute on function public.season_players(int) to service_role;
grant execute on function public.claim_email(uuid, int, text) to service_role;
grant execute on function public.release_email(uuid, int, text) to service_role;
