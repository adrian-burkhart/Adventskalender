-- A name cut to 30 characters no longer keeps a trailing space.

create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $function$
declare
  wanted text;
  candidate text;
  attempt int := 0;
begin
  wanted := btrim(left(btrim(coalesce(new.raw_user_meta_data ->> 'name', '')), 30));
  if wanted = '' then
    wanted := null;
  end if;

  candidate := coalesce(
    wanted,
    'Wichtel ' || lpad((floor(random() * 10000))::int::text, 4, '0')
  );

  loop
    begin
      insert into public.players (id, name) values (new.id, candidate);
      return new;
    exception when unique_violation then
      attempt := attempt + 1;
      if attempt >= 20 then
        -- Give up on a nice name rather than block the sign-up.
        insert into public.players (id, name)
          values (new.id, 'Wichtel ' || left(new.id::text, 8));
        return new;
      end if;
      candidate := coalesce(wanted, 'Wichtel') || ' '
        || lpad((floor(random() * 10000))::int::text, 4, '0');
    end;
  end loop;
end;
$function$;
