-- Points from seasons whose accounts no longer exist (the 2023 project).
--
-- Rows are loaded by hand from a backup, never from the app. They belong to
-- a current player when the hashed e-mail address matches one; otherwise
-- they show up in the leaderboard under the old name only. No accounts are
-- created or restored.

create table private.imported_scores (
  year int not null,
  email_sha256 text not null,
  name text not null,
  score int not null check (score >= 0),
  doors int not null check (doors >= 0),
  primary key (year, email_sha256)
);

create view private.imported_with_player as
select i.year, i.name, i.score, i.doors, p.id as player_id
  from private.imported_scores i
  left join auth.users u
    on encode(extensions.digest(lower(btrim(u.email)), 'sha256'), 'hex')
       = i.email_sha256
  left join public.players p on p.id = u.id;

create or replace view private.year_scores as
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
), app as (
  select player_id, year, score, doors from current
  union all
  select l.player_id, l.year, l.score, l.doors
    from legacy l
   where (l.score > 0 or l.doors > 0)
     and not exists (
       select 1 from current c
        where c.player_id = l.player_id and c.year = l.year)
)
select player_id, year, score, doors from app
union all
select i.player_id, i.year, i.score, i.doors
  from private.imported_with_player i
 where i.player_id is not null
   and not exists (
     select 1 from app a
      where a.player_id = i.player_id and a.year = i.year);

-- Leaderboard of one year: every current player, plus imported players
-- without an account (player_id is null for those).
create or replace function public.leaderboard(p_year int)
  returns table (player_id uuid, name text, score int, doors int)
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select * from (
    select p.id, p.name, coalesce(s.score, 0), coalesce(s.doors, 0)
      from public.players p
      left join private.year_scores s
        on s.player_id = p.id and s.year = p_year
    union all
    select null::uuid, i.name, i.score, i.doors
      from private.imported_with_player i
     where i.year = p_year and i.player_id is null
  ) board (player_id, name, score, doors)
  order by score desc, doors desc, lower(name);
$$;

-- Years that have any points, for the leaderboard's year switch.
create function public.score_years()
  returns setof int
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select year from private.year_scores where score > 0 or doors > 0
  union
  select year from private.imported_scores
  order by 1;
$$;

revoke execute on function public.score_years() from public, anon;
grant execute on function public.score_years() to authenticated;
