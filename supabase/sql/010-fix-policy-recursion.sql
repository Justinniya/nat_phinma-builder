-- 010 — fix "infinite recursion detected in policy for relation rooms"
--
-- Why it happened: two security rules checked each other in a loop.
--   rooms (add/edit)  -> checks the landlords list   (007)
--   landlords (read)  -> checks rooms for boarders   (009)
-- Postgres refuses rules that go rooms -> landlords -> rooms.
--
-- The fix: two small helper functions do those checks directly, without
-- going back through the other table's rules ("security definer" means
-- the function itself is allowed to look). The rules mean exactly the
-- same as before; only the loop is gone.
--
-- Run this in: Supabase -> SQL Editor -> New query -> paste -> Run

-- Is the logged-in user a landlord?
create or replace function public.is_landlord()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from landlords where user_id = auth.uid());
$$;

-- Which landlord(s) rent a room to the logged-in boarder?
create or replace function public.my_landlord_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select landlord_id from rooms where boarder_email = lower(auth.jwt() ->> 'email');
$$;

-- Only logged-in users may call them (they only ever answer about
-- the person asking).
revoke all on function public.is_landlord() from public, anon;
revoke all on function public.my_landlord_ids() from public, anon;
grant execute on function public.is_landlord() to authenticated;
grant execute on function public.my_landlord_ids() to authenticated;

-- rooms: only landlords may add or edit rooms (same rule as 007).
drop policy if exists "landlord can add own rooms" on rooms;
create policy "landlord can add own rooms"
  on rooms for insert
  to authenticated
  with check ((select auth.uid()) = landlord_id and (select public.is_landlord()));

drop policy if exists "landlord can edit own rooms" on rooms;
create policy "landlord can edit own rooms"
  on rooms for update
  to authenticated
  using ((select auth.uid()) = landlord_id)
  with check ((select auth.uid()) = landlord_id and (select public.is_landlord()));

-- landlords: a boarder may read their own landlord's row (same rule as 009).
drop policy if exists "boarder can see own landlord" on landlords;
create policy "boarder can see own landlord"
  on landlords for select
  to authenticated
  using (user_id in (select public.my_landlord_ids()));
