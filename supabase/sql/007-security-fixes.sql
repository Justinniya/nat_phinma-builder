-- 007 — security fixes from /code-review
--
-- Fix 1: only real landlords can create rooms.
--   Before: anyone who signed up could create a room and type someone
--   else's email as the boarder — even Mama Lita's — and hijack what
--   that person sees after logging in.
--   After: only accounts on the `landlords` list can add or edit rooms.
--   The list can only be changed here in the SQL Editor, never from the app.
--
-- Fix 2: a new boarder can't see the previous boarder's payments.
--   Before: boarders saw every payment for "their" room, including ones
--   made by whoever lived there before.
--   After: each payment remembers the boarder email of the room at the
--   moment it was saved, and boarders only see payments with their email.
--
-- Fix 3 (small): a landlord's payments must be recorded as made by herself.
--
-- Run this in: Supabase -> SQL Editor -> New query -> paste -> Run

-- Fix 1 --------------------------------------------------------------

create table if not exists landlords (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table landlords enable row level security;

-- A user may check whether THEY are a landlord. Nobody can add, change
-- or remove landlords through the app (no insert/update/delete policy).
create policy "user can see own landlord row"
  on landlords for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Everyone who already owns rooms becomes a landlord.
-- ⚠️ Check this list in Table Editor -> landlords afterwards: anyone who
-- created a room while testing is on it. Delete rows you don't trust.
insert into landlords (user_id)
select distinct landlord_id from rooms
on conflict do nothing;

-- To add a new landlord later (after they've signed up in the app):
--   insert into landlords (user_id)
--   select id from auth.users where email = 'their.email@example.com';

drop policy if exists "landlord can add own rooms" on rooms;
create policy "landlord can add own rooms"
  on rooms for insert
  to authenticated
  with check (
    (select auth.uid()) = landlord_id
    and exists (select 1 from landlords where landlords.user_id = (select auth.uid()))
  );

drop policy if exists "landlord can edit own rooms" on rooms;
create policy "landlord can edit own rooms"
  on rooms for update
  to authenticated
  using ((select auth.uid()) = landlord_id)
  with check (
    (select auth.uid()) = landlord_id
    and exists (select 1 from landlords where landlords.user_id = (select auth.uid()))
  );

-- Fix 2 --------------------------------------------------------------

alter table payments add column if not exists boarder_email text;

-- Fill it in for payments that already exist.
update payments
   set boarder_email = rooms.boarder_email
  from rooms
 where rooms.id = payments.room_id
   and payments.boarder_email is null;

-- From now on, the database fills it in by itself on every new payment,
-- so neither the landlord nor a boarder can set it to something else.
create or replace function set_payment_boarder_email()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.boarder_email := (select boarder_email from rooms where rooms.id = new.room_id);
  return new;
end;
$$;

drop trigger if exists payments_set_boarder_email on payments;
create trigger payments_set_boarder_email
  before insert on payments
  for each row execute function set_payment_boarder_email();

-- A boarder sees a payment only if it's for their room AND it was made
-- while they were the boarder.
drop policy if exists "boarder can read own room payments" on payments;
create policy "boarder can read own room payments"
  on payments for select
  to authenticated
  using (
    payments.boarder_email = lower((select auth.jwt() ->> 'email'))
    and exists (
      select 1 from rooms
      where rooms.id = payments.room_id
        and rooms.boarder_email = lower((select auth.jwt() ->> 'email'))
    )
  );

-- Fix 3 --------------------------------------------------------------

drop policy if exists "landlord can add payments to own rooms" on payments;
create policy "landlord can add payments to own rooms"
  on payments for insert
  to authenticated
  with check (
    (select auth.uid()) = landlord_id
    and reported_by = (select auth.uid())
    and exists (select 1 from rooms where rooms.id = room_id and rooms.landlord_id = (select auth.uid()))
  );
