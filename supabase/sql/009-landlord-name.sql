-- 009 — the landlord's display name
--
-- Shown in the sidebar ("Lita Santos · Landlady") and used as the
-- default "Received by" when she records a payment. She can change it
-- herself on the Profile page.
--
-- Run this in: Supabase -> SQL Editor -> New query -> paste -> Run

alter table landlords add column if not exists display_name text
  check (display_name is null or char_length(display_name) between 1 and 60);

-- A landlord may update her OWN row (to change her name). She still
-- can't add herself or anyone else to the list: there is no insert policy.
drop policy if exists "landlord can update own row" on landlords;
create policy "landlord can update own row"
  on landlords for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- To set a name from here instead:
--   update landlords set display_name = 'Mama Lita'
--   where user_id = (select id from auth.users where email = 'HER EMAIL');

-- A boarder may read their OWN landlord's row (so "Received by" can
-- default to her name). Nothing else about other landlords is visible.
drop policy if exists "boarder can see own landlord" on landlords;
create policy "boarder can see own landlord"
  on landlords for select
  to authenticated
  using (
    exists (
      select 1 from rooms
      where rooms.landlord_id = landlords.user_id
        and rooms.boarder_email = lower((select auth.jwt() ->> 'email'))
    )
  );
