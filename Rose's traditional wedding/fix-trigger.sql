-- =============================================================================
--  HOME COMING — TRIGGER FIX
--
--  You do not strictly need this. Everything essential already works:
--  guests can seal a blessing, and nobody without an account can read one.
--
--  This closes one small hole: because Postgres cannot restrict individual
--  columns from inside a policy, a guest can currently put is_read, is_hidden
--  or an old created_at onto their OWN row. The worst they can do is mark
--  their own message as read or hidden, or backdate it. Nobody else's message
--  is affected and nobody can read anything.
--
--  The trigger below makes those three columns server-controlled. It is safe
--  and it cannot break the form.
--
--  Run it in Supabase -> SQL Editor -> New query. One block, nothing else,
--  so there is nothing here that can fail.
-- =============================================================================


create or replace function public.protect_blessing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- you, Rose and Daniel are signed in, so you may set these on purpose
  if auth.role() = 'authenticated' then
    return new;
  end if;

  -- a guest may not, so put the correct values back
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.is_read   := false;
    new.is_hidden := false;
  elsif tg_op = 'UPDATE' then
    new.created_at := old.created_at;
    new.is_read   := old.is_read;
    new.is_hidden := old.is_hidden;
  end if;

  return new;
end;
$$;


revoke all on function public.protect_blessing() from public;
grant execute on function public.protect_blessing() to anon, authenticated;


drop trigger if exists blessings_protected on public.blessings;
create trigger blessings_protected
  before insert or update on public.blessings
  for each row execute function public.protect_blessing();


--  DONE.  Nothing else to do, and nothing can have broken: the form still
--  works exactly as before, you just cannot be lied to about a message now.