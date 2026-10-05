-- =============================================================================
--  HOME COMING — GRANT FIX, take two
--
--  READ THIS FIRST
--  I checked your project from outside and it is unchanged: a guest submission
--  still comes back "permission denied for table blessings", and public signup
--  is still on. So either fix-grants.sql was never run, or it was pasted into
--  the editor as one big block and ONE of the statements failed — because the
--  Supabase SQL Editor runs the whole thing as a single transaction. If any one
--  line errors, every line above it is rolled back and nothing happens.
--
--  That is why this version is short and starts with the question.
--
--  HOW TO USE IT
--  In Supabase -> SQL Editor -> New query, paste SECTION A and press Run.
--  Read the answer. Then paste SECTION B and press Run.
--  Then paste SECTION C and press Run.
--  Three separate Run presses. Nothing can roll back across them.
-- =============================================================================


-- ###########################################################################
--  SECTION A — the current state. Run this on its own, first.
--  You want to see:  anon_can_insert = false      (the bug, confirmed)
--                     anon_can_read   = false      (the sealing, working)
-- ###########################################################################

select
  has_table_privilege('anon', 'public.blessings', 'insert') as anon_can_insert,
  has_table_privilege('anon', 'public.blessings', 'select') as anon_can_read,
  has_table_privilege('anon', 'public.blessings', 'update') as anon_can_edit,
  has_table_privilege('anon', 'public.blessings', 'delete') as anon_can_delete;


-- ###########################################################################
--  SECTION B — the actual fix. Four statements, nothing else.
--  Run this on its own. It cannot fail.
--  Guests get to write. Nobody without a login gets to read.
-- ###########################################################################

grant insert                on table public.blessings to anon;
grant select, update, delete on table public.blessings to authenticated;


-- ###########################################################################
--  SECTION C — prove it. Run this on its own, last.
--  You now want:  anon_can_insert = TRUE
--                  anon_can_read   = false     <-- must stay false
--  If can_read ever shows TRUE, stop and tell me, because that breaks the seal.
-- ###########################################################################

select
  has_table_privilege('anon', 'public.blessings', 'insert') as anon_can_insert,
  has_table_privilege('anon', 'public.blessings', 'select') as anon_can_read;


-- =============================================================================
--  STILL TO DO WITH YOUR OWN HANDS — SQL cannot do this one.
--
--  Authentication -> Providers -> Email
--  turn OFF  "Enable email signup"
--
--  I can check this from outside at any time and will tell you either way.
-- =============================================================================