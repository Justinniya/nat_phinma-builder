-- 002 — rooms
--
-- One row per room in Mama Lita's boarding house.
-- Run this in: Supabase -> SQL Editor -> New query -> paste -> Run

-- 1. The table ------------------------------------------------------

create table if not exists rooms (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  -- The landlord who owns this room. Filled in automatically with the
  -- logged-in user's id when a room is added.
  landlord_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  label              text not null,
  boarder_first_name text not null,
  -- The email the boarder logs in with. This is what links a boarder to
  -- their room, so it is stored in lowercase to make matching reliable.
  boarder_email      text not null check (boarder_email = lower(boarder_email)),
  -- Day of the month rent is due (from the move-in date).
  due_day            int  not null check (due_day between 1 and 31),
  -- Current amount due each period, in pesos.
  monthly_amount     numeric(10, 2) not null check (monthly_amount >= 0),
  note               text
);

-- 2. Row Level Security --------------------------------------------
--
-- With RLS on, nobody can do anything unless a policy below allows it.
-- Logged-out visitors (the "anon" role) get no policy at all, so they
-- see nothing.

alter table rooms enable row level security;

-- The landlord may read, add, edit and delete only her own rooms.
create policy "landlord can read own rooms"
  on rooms for select
  to authenticated
  using ((select auth.uid()) = landlord_id);

create policy "landlord can add own rooms"
  on rooms for insert
  to authenticated
  with check ((select auth.uid()) = landlord_id);

create policy "landlord can edit own rooms"
  on rooms for update
  to authenticated
  using ((select auth.uid()) = landlord_id)
  with check ((select auth.uid()) = landlord_id);

create policy "landlord can delete own rooms"
  on rooms for delete
  to authenticated
  using ((select auth.uid()) = landlord_id);

-- A boarder may only READ the room saved with their login email.
-- This is only safe with "Confirm email" ON in Supabase
-- (Authentication -> Sign In / Providers -> Email). With it on, nobody
-- can log in until they prove they own the email address, so nobody
-- can pretend to be another boarder. The team keeps it OFF while
-- testing with made-up data; it MUST be ON before real boarder data.
-- No insert/update/delete policy for boarders: they can never change rooms.
create policy "boarder can read own room"
  on rooms for select
  to authenticated
  using (boarder_email = lower((select auth.jwt() ->> 'email')));
