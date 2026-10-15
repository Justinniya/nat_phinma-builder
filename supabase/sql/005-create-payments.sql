-- 005 — payments
--
-- One row per payment, boarder report, deposit or advance.
-- Run this in: Supabase -> SQL Editor -> New query -> paste -> Run

-- 1. The table ------------------------------------------------------

create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  room_id       uuid not null references rooms(id) on delete cascade,
  -- The landlord who owns the room. Stored on each payment so the
  -- security rules can check it quickly.
  landlord_id   uuid not null references auth.users(id) on delete cascade,
  type          text not null check (type in ('monthly', 'deposit', 'advance')),
  -- Which month a monthly payment is for, stored as the 1st of that
  -- month (e.g. 2026-10-01 = October 2026). Empty for deposits/advances.
  period        date check (period is null or extract(day from period) = 1),
  amount        numeric(10, 2) not null check (amount > 0),
  paid_on       date not null,
  method        text not null check (method in ('cash', 'gcash')),
  received_by   text,
  reference_no  text,
  status        text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  reject_reason text,
  -- Whoever created the row: the landlord, or (from ticket 05) a boarder.
  reported_by   uuid not null default auth.uid() references auth.users(id) on delete cascade,

  -- A monthly payment must say which month; deposits/advances must not.
  constraint payments_period_only_for_monthly check ((type = 'monthly') = (period is not null))
);

create index if not exists payments_room_id_idx on payments (room_id);

-- A month can only be confirmed as paid once per room. (Pending or
-- rejected reports don't count, so boarders can report again.)
create unique index if not exists payments_one_confirmed_per_month
  on payments (room_id, period)
  where type = 'monthly' and status = 'confirmed';

-- 2. Row Level Security --------------------------------------------

alter table payments enable row level security;

-- The landlord may read, add, edit and delete payments only for her own
-- rooms. Adding or editing also checks the room really is hers, so she
-- can't attach a payment to someone else's room.
create policy "landlord can read own payments"
  on payments for select
  to authenticated
  using ((select auth.uid()) = landlord_id);

create policy "landlord can add payments to own rooms"
  on payments for insert
  to authenticated
  with check (
    (select auth.uid()) = landlord_id
    and exists (select 1 from rooms where rooms.id = room_id and rooms.landlord_id = (select auth.uid()))
  );

create policy "landlord can edit own payments"
  on payments for update
  to authenticated
  using ((select auth.uid()) = landlord_id)
  with check (
    (select auth.uid()) = landlord_id
    and exists (select 1 from rooms where rooms.id = room_id and rooms.landlord_id = (select auth.uid()))
  );

create policy "landlord can delete own payments"
  on payments for delete
  to authenticated
  using ((select auth.uid()) = landlord_id);

-- Boarder policies (read own, report "I paid") come in ticket 05.
-- Until then, boarders can't see or add any payments.
