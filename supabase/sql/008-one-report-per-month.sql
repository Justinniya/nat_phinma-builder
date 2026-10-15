-- 008 — one "I paid" report per room per month (stops spam)
--
-- Rule: for each room and month, there can be at most ONE monthly
-- payment that is pending OR confirmed.
--   - A boarder can't send a second report while the first is waiting.
--   - Nobody can report a month that's already confirmed as paid.
--   - If Mama Lita REJECTS a report, the boarder may send a new one
--     (rejected reports don't count).
-- The database enforces this, so it can't be worked around from the app.
--
-- Run this in: Supabase -> SQL Editor -> New query -> paste -> Run

-- 1. Tidy up duplicates from testing, or step 2 would fail.
--    Any extra pending report for a month that is already confirmed, or
--    that isn't the oldest pending one, is marked rejected.
update payments p
   set status = 'rejected',
       reject_reason = 'Duplicate report (cleaned up automatically)'
 where p.type = 'monthly'
   and p.status = 'pending'
   and exists (
     select 1 from payments other
      where other.room_id = p.room_id
        and other.period = p.period
        and other.type = 'monthly'
        and other.id <> p.id
        and (
          other.status = 'confirmed'
          or (other.status = 'pending' and (other.created_at, other.id) < (p.created_at, p.id))
        )
   );

-- 2. The rule itself. It replaces the old "one confirmed per month" rule
--    from 005, which it includes.
drop index if exists payments_one_confirmed_per_month;
create unique index if not exists payments_one_open_per_month
  on payments (room_id, period)
  where type = 'monthly' and status in ('pending', 'confirmed');
