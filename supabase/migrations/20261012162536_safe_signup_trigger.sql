-- Sign-up never fails over the display name, and no longer copies the
-- e-mail address into it.
--
-- The name comes from the sign-up form (raw_user_meta_data.name). Without
-- one, or when it is taken, the player gets a neutral "Wichtel 1234" that
-- they can change on their profile page.

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
  wanted := left(btrim(coalesce(new.raw_user_meta_data ->> 'name', '')), 30);
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

-- Only the auth trigger calls this; nobody needs to call it over the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
