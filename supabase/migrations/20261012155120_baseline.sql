-- Baseline: the production schema as of 12 Oct 2026, unchanged.
-- Later migrations change it; this file only reproduces what exists.

create table public.players (
  id uuid not null primary key
    references auth.users (id) on update cascade,
  created_at timestamptz not null default now(),
  scores jsonb default '[{"year": 2023, "score": 0}]'::jsonb,
  doors_opened jsonb[],
  name text unique
);

alter table public.players enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.players for select
  using (true);

create policy "Users can insert their own profile."
  on public.players for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on public.players for update
  using (auth.uid() = id);

create function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $function$
declare
  default_name text;
begin
  default_name := split_part(new.email, '@', 1);

  insert into public.players (id, name) values (new.id, default_name);

  return new;
end;
$function$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
