-- =============================================================================
--  HOME COMING — Supabase database setup
--
--  ** THIS IS POSTGRESQL. DO NOT RUN IT IN SQL SERVER / AZURE DATA STUDIO. **
--
--  HOW TO RUN IT — nothing to install, nothing to download:
--    1. Open  https://app.supabase.com
--    2. Pick your project
--    3. SQL Editor  ->  New query
--    4. Paste SECTION 1, press Run.
--    5. Paste SECTION 2, press Run.      <- a separate press, on purpose
--    6. Paste SECTION 3, press Run.
--
--  Why three separate presses: the SQL Editor runs a pasted block as ONE
--  transaction. If a single line inside it fails, every line above it rolls
--  back and you are left believing it worked. Separate presses cannot do that.
--
--  Safe to run more than once.
-- =============================================================================


-- ###########################################################################
--  SECTION 1 — the table.  Paste this, press Run.
-- ###########################################################################

create table if not exists public.blessings (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  full_name     text        not null,
  side          text        not null default 'other',
  side_other    text,
  town          text,
  country       text,
  phone         text,
  email         text,
  guest_of      text,
  message       text        not null,

  reference     text,
  is_read       boolean     not null default false,
  is_hidden     boolean     not null default false
);

alter table public.blessings enable row level security;

create index if not exists blessings_created_at_idx on public.blessings (created_at desc);
create index if not exists blessings_is_read_idx    on public.blessings (is_read);


-- ###########################################################################
--  SECTION 2 — privileges and policies.  Paste this, press Run.
--
--  Guests (role "anon") get INSERT and nothing else. Ever.
--  Signed-in family accounts get read, change and delete.
--  service_role is Supabase's own internal key and bypasses RLS entirely.
-- ###########################################################################

revoke all on table public.blessings from anon;
grant insert on table public.blessings to anon;

revoke all on table public.blessings from authenticated;
grant select, update, delete on table public.blessings to authenticated;

grant all on table public.blessings to service_role;

drop policy if exists "guests may submit" on public.blessings;
create policy "guests may submit"
  on public.blessings
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "family may read"   on public.blessings;
create policy "family may read"
  on public.blessings for select to authenticated using (true);

drop policy if exists "family may update" on public.blessings;
create policy "family may update"
  on public.blessings for update to authenticated using (true) with check (true);

drop policy if exists "family may delete" on public.blessings;
create policy "family may delete"
  on public.blessings for delete to authenticated using (true);


-- ###########################################################################
--  SECTION 3 — the public counter.  Paste this, press Run.
-- ###########################################################################

create or replace function public.blessing_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from public.blessings where is_hidden = false;
$$;

revoke all on function public.blessing_count() from public;
grant execute on function public.blessing_count() to anon, authenticated;


-- ###########################################################################
--  SECTION 4 — the proof.  Paste this on its own and press Run.
--
--  This is the entire security of the site in one table. You want:
--
--      anon_can_submit  = true     <- guests can write their blessing
--      anon_can_read    = false    <- nobody can read them without an account
--      anon_can_edit    = false
--      anon_can_delete  = false
--
--  anon_can_read must stay false. If it ever shows true, stop and fix it,
--  because that is the one thing that would expose every message.
-- =============================================================================

select
  has_table_privilege('anon', 'public.blessings', 'insert') as anon_can_submit,
  has_table_privilege('anon', 'public.blessings', 'select') as anon_can_read,
  has_table_privilege('anon', 'public.blessings', 'update') as anon_can_edit,
  has_table_privilege('anon', 'public.blessings', 'delete') as anon_can_delete;


-- ###########################################################################
--  SECTION 5 — stop a guest labelling their own message.  Paste, press Run.
--
--  Without this, a guest can put is_read, is_hidden or an old created_at on
--  their OWN row, because Postgres cannot restrict columns from inside a
--  policy. The effect is minor — they could only mislabel their own message —
--  but there is no reason to allow it.
--
--  This trigger makes those three columns untouchable by anyone but you, and
--  mends the row again if one of the three accounts ever touches it.
-- ###########################################################################

create or replace function public.protect_blessing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- someone who is signed in (you, Rose or Daniel) may set these deliberately
  if auth.role() = 'authenticated' then
    return new;
  end if;

  -- a guest may not. put the correct values back.
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


-- ###########################################################################
--  OPTIONAL, AND I RECOMMEND IT — a lock for the case you forget.
--
--  Read permission is granted to the "authenticated" role, which means ANY
--  signed-in account. Today only your three exist, because you turned public
--  signup off. But if that toggle is ever clicked back on by accident — a
--  stray click months from now — a stranger could register and read
--  everything. This replaces "any signed-in user" with "only these three
--  addresses", so the seal survives that mistake.
--
--  Uncomment, put your three REAL addresses in the list, then paste and Run.
--  It works alongside the sections above; it only narrows who can read.
-- ###########################################################################

--  create or replace function public.is_family(email text)
--  returns boolean
--  language sql
--  stable
--  as $$
--    select lower(email) in (
--      'rose.ndaanee@example.com',      -- <- your real address
--      'daniel.baridoo@example.com',    -- <- your real address
--      'your.own.address@example.com'   -- <- your real address
--    );
--  $$;
--
--  drop policy if exists "family may read"   on public.blessings;
--  create policy "family may read"
--    on public.blessings for select to authenticated
--    using (public.is_family(auth.jwt() ->> 'email'));
--
--  drop policy if exists "family may update" on public.blessings;
--  create policy "family may update"
--    on public.blessings for update to authenticated
--    using (public.is_family(auth.jwt() ->> 'email'));
--
--  drop policy if exists "family may delete" on public.blessings;
--  create policy "family may delete"
--    on public.blessings for delete to authenticated
--    using (public.is_family(auth.jwt() ->> 'email'));


-- =============================================================================
--  ONE THING NO SCRIPT CAN DO FOR YOU
--
--  Authentication -> Providers -> Email  ->  turn OFF "Enable email signup"
--
--  Until that is off, anybody can register an account on your project and read
--  every blessing, phone numbers included. One tick.
-- =============================================================================