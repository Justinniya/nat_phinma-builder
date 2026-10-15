-- 006 — boarders can see their payments and report "I paid"
--
-- Adds two rules to the payments table (from 005). The landlord rules
-- stay as they are. A boarder is someone whose login email matches a
-- room's boarder_email (same idea as the rooms rule in 002).
--
-- ⚠️ This is only safe with "Confirm email" ON in Supabase
-- (Authentication -> Sign In / Providers -> Email). With it off, anyone
-- could sign up with a boarder's email and see their payments. Turn it
-- ON before any real boarder's data goes in.
--
-- Run this in: Supabase -> SQL Editor -> New query -> paste -> Run

-- A boarder may READ payments for their own room only.
create policy "boarder can read own room payments"
  on payments for select
  to authenticated
  using (
    exists (
      select 1 from rooms
      where rooms.id = payments.room_id
        and rooms.boarder_email = lower((select auth.jwt() ->> 'email'))
    )
  );

-- A boarder may ADD a payment only if:
--   - it's for their own room, with that room's real landlord,
--   - it's a monthly payment,
--   - it's pending (only the landlord can confirm), with no reject reason,
--   - it's recorded as reported by themselves.
create policy "boarder can report own payment"
  on payments for insert
  to authenticated
  with check (
    type = 'monthly'
    and status = 'pending'
    and reject_reason is null
    and reported_by = (select auth.uid())
    and exists (
      select 1 from rooms
      where rooms.id = payments.room_id
        and rooms.landlord_id = payments.landlord_id
        and rooms.boarder_email = lower((select auth.jwt() ->> 'email'))
    )
  );

-- Deliberately NO update or delete rule for boarders: once sent, a
-- report can't be changed. If it was a mistake, the landlord rejects it.
