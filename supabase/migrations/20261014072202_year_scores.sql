-- Points per player and year, in one place.
--
-- Answers from the server flow count where they exist. Otherwise the old
-- columns players.scores and players.doors_opened (2025 and earlier) do;
-- they are only read from now on. Old years without points or answered
-- doors (the "2023: 0" every player got by default) are left out.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create view private.year_scores as
with legacy_scores as (
  select p.id as player_id,
         (e ->> 'year')::int as year,
         sum(coalesce((e ->> 'score')::int, 0))::int as score
    from public.players p,
         jsonb_array_elements(coalesce(p.scores, '[]'::jsonb)) e
   where jsonb_typeof(p.scores) = 'array'
   group by 1, 2
), legacy_doors as (
  select p.id as player_id,
         (d ->> 'year')::int as year,
         count(distinct (d ->> 'door_number')::int)
           filter (where (d ->> 'isAnswered')::boolean)::int as doors
    from public.players p,
         unnest(coalesce(p.doors_opened, '{}'::jsonb[])) d
   group by 1, 2
), legacy as (
  select coalesce(s.player_id, d.player_id) as player_id,
         coalesce(s.year, d.year) as year,
         coalesce(s.score, 0) as score,
         coalesce(d.doors, 0) as doors
    from legacy_scores s
    full join legacy_doors d
      on d.player_id = s.player_id and d.year = s.year
), current as (
  select player_id, year,
         sum(points)::int as score,
         count(*)::int as doors
    from public.answers
   where answered_at is not null
   group by 1, 2
)
select player_id, year, score, doors from current
union all
select l.player_id, l.year, l.score, l.doors
  from legacy l
 where (l.score > 0 or l.doors > 0)
   and not exists (
     select 1 from current c
      where c.player_id = l.player_id and c.year = l.year);

-- Leaderboard of one year: every player, best first.
create function public.leaderboard(p_year int)
  returns table (player_id uuid, name text, score int, doors int)
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select p.id, p.name, coalesce(s.score, 0), coalesce(s.doors, 0)
    from public.players p
    left join private.year_scores s
      on s.player_id = p.id and s.year = p_year
   order by coalesce(s.score, 0) desc,
            coalesce(s.doors, 0) desc,
            lower(p.name);
$$;

-- The logged-in player's points per year.
create function public.my_scores()
  returns table (year int, score int, doors int)
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select s.year, s.score, s.doors
    from private.year_scores s
   where s.player_id = (select auth.uid())
   order by s.year;
$$;

revoke execute on function public.leaderboard(int) from public, anon;
revoke execute on function public.my_scores() from public, anon;
grant execute on function public.leaderboard(int) to authenticated;
grant execute on function public.my_scores() to authenticated;

-- Answers no longer write the old columns; the score comes from answers.
create or replace function public.record_answer(
  p_player uuid,
  p_year int,
  p_door int,
  p_selected text,
  p_correct boolean,
  p_points int,
  p_left_page boolean
)
  returns table (recorded boolean, year_score int)
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  changed int;
begin
  update public.answers
     set answered_at = now(),
         selected_option = p_selected,
         is_correct = p_correct,
         points = p_points,
         left_page = p_left_page
   where player_id = p_player
     and year = p_year
     and door = p_door
     and started_at is not null
     and answered_at is null;
  get diagnostics changed = row_count;

  return query
    select changed = 1,
           coalesce((
             select s.score from private.year_scores s
              where s.player_id = p_player and s.year = p_year), 0);
end;
$$;

-- New players start without the old placeholder entry.
alter table public.players alter column scores set default '[]'::jsonb;
