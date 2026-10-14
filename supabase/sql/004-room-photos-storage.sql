-- 004 — room photos (Supabase Storage)
--
-- Photos are files, not table rows, so they live in Supabase Storage in
-- a "bucket" (a folder for files). Each photo is saved at:
--
--   room-photos / <landlord's account id> / <room id> / <file name>
--
-- The security rules below read that path to decide who may do what.
--
-- Run this in: Supabase -> SQL Editor -> New query -> paste -> Run

-- 1. The bucket -----------------------------------------------------
--
-- public = false: there is no open link to any photo. The app asks for
-- a short-lived link (valid for one hour) each time it shows a photo, and
-- only gets one if the rules below allow it.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('room-photos', 'room-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- 2. Row Level Security on the files --------------------------------
--
-- storage.objects already has RLS switched on by Supabase. Without the
-- policies below, nobody could upload or view anything in this bucket.
-- (storage.foldername(name))[1] is the first folder in the path (the
-- landlord's id) and [2] is the second (the room id).

-- The landlord may view, add and delete photos only inside her own
-- folder, and only for rooms she actually owns.
create policy "landlord can view own room photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'room-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "landlord can add photos to own rooms"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'room-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.rooms
      where rooms.id::text = (storage.foldername(name))[2]
        and rooms.landlord_id = (select auth.uid())
    )
  );

create policy "landlord can delete own room photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'room-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- A boarder may only VIEW photos of the room saved with their login
-- email. (Same "Confirm email" warning as in 002 applies.)
create policy "boarder can view own room photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'room-photos'
    and exists (
      select 1 from public.rooms
      where rooms.id::text = (storage.foldername(name))[2]
        and rooms.boarder_email = lower((select auth.jwt() ->> 'email'))
    )
  );

-- No update policy: photos can't be overwritten, only deleted and re-added.
