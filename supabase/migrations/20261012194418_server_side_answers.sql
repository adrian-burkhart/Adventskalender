-- Answers are checked and stored by the server only.
--
-- The browser may read its own answers, nothing else. All writes go through
-- the functions below, which only the server's service role may call.

create table public.answers (
  player_id uuid not null references public.players (id) on delete cascade,
  year int not null check (year between 2023 and 2100),
  door int not null check (door between 1 and 24),
  opened_at timestamptz not null default now(),
  started_at timestamptz,
  answered_at timestamptz,
  selected_option text,
  is_correct boolean,
  points int not null default 0 check (points >= 0),
  left_page boolean not null default false,
  primary key (player_id, year, door),
  check (answered_at is null or started_at is not null)
);

alter table public.answers enable row level security;

create policy "Players can read their own answers."
  on public.answers for select
  to authenticated
  using ((select auth.uid()) = player_id);

revoke all on public.answers from anon, authenticated;
grant select on public.answers to authenticated;

create function public.open_door(p_player uuid, p_year int, p_door int)
  returns void
  language sql
  security definer
  set search_path to ''
as $$
  insert into public.answers (player_id, year, door)
  values (p_player, p_year, p_door)
  on conflict (player_id, year, door) do nothing;
$$;

-- Starts the timer once. Reloading or a second device gets the same start.
create function public.start_question(p_player uuid, p_year int, p_door int)
  returns table (started_at timestamptz, answered_at timestamptz)
  language sql
  security definer
  set search_path to ''
as $$
  insert into public.answers as a (player_id, year, door, started_at)
  values (p_player, p_year, p_door, now())
  on conflict (player_id, year, door)
    do update set started_at = coalesce(a.started_at, excluded.started_at)
  returning a.started_at, a.answered_at;
$$;

-- Records the answer once and keeps the old score columns in step, which
-- the leaderboard and profile still read. Returns whether this call
-- recorded it and the player's score for that year.
create function public.record_answer(
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
  current_scores jsonb;
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

  if changed = 1 then
    select coalesce(p.scores, '[]'::jsonb) into current_scores
      from public.players p where p.id = p_player for update;

    if exists (
      select 1 from jsonb_array_elements(current_scores) e
       where (e ->> 'year')::int = p_year
    ) then
      current_scores := (
        select jsonb_agg(
          case when (e ->> 'year')::int = p_year
            then jsonb_set(e, '{score}',
                   to_jsonb(coalesce((e ->> 'score')::int, 0) + p_points))
            else e end
          order by ord)
        from jsonb_array_elements(current_scores) with ordinality as t(e, ord)
      );
    else
      current_scores := current_scores
        || jsonb_build_array(jsonb_build_object('year', p_year, 'score', p_points));
    end if;

    update public.players
       set scores = current_scores,
           doors_opened = array_append(
             coalesce(doors_opened, '{}'::jsonb[]),
             jsonb_build_object(
               'year', p_year::text, 'door_number', p_door, 'isAnswered', true))
     where id = p_player;
  end if;

  return query
    select changed = 1,
           coalesce((
             select (e ->> 'score')::int
               from public.players p, jsonb_array_elements(p.scores) e
              where p.id = p_player and (e ->> 'year')::int = p_year
              limit 1), 0);
end;
$$;

revoke execute on function public.open_door(uuid, int, int) from public, anon, authenticated;
revoke execute on function public.start_question(uuid, int, int) from public, anon, authenticated;
revoke execute on function public.record_answer(uuid, int, int, text, boolean, int, boolean) from public, anon, authenticated;
grant execute on function public.open_door(uuid, int, int) to service_role;
grant execute on function public.start_question(uuid, int, int) to service_role;
grant execute on function public.record_answer(uuid, int, int, text, boolean, int, boolean) to service_role;
