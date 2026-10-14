-- 003 — rooms can be vacant
--
-- A room with no boarder is vacant. To allow that, the boarder's first
-- name and email become optional. They must be filled in together or
-- left empty together, so a room is never "half occupied".
--
-- Run this in: Supabase -> SQL Editor -> New query -> paste -> Run
-- No security change: the RLS policies from 002 still apply as they are.

alter table rooms alter column boarder_first_name drop not null;
alter table rooms alter column boarder_email      drop not null;

alter table rooms add constraint rooms_boarder_name_and_email_together
  check ((boarder_first_name is null) = (boarder_email is null));
