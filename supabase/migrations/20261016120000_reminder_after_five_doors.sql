-- The reminder waits for five missed doors instead of three days: the last
-- door was opened at least five days (Berlin time) before today, so five
-- new doors have opened since without being opened.
create or replace function public.reminder_candidates(p_year int, p_open_doors int)
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
  having max((a.opened_at at time zone 'Europe/Berlin')::date)
           <= (now() at time zone 'Europe/Berlin')::date - 5
     and count(*) < p_open_doors;
$$;
