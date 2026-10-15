-- SEED — demo accounts, rooms and renters (made-up data, for testing only)
--
-- This is NOT a schema change, so it has no number. Run it whenever you
-- want fresh demo data. It is safe to run again.
--
-- Every demo account logs in with the password:  demo1234
--
--   Landlords
--     mamalita.demo@example.com    -> Mama Lita, 10 rooms
--     alingnena.demo@example.com   -> a second landlord, 2 rooms
--                                     (to check landlords can't see each other's rooms)
--   Boarders (used from ticket 05 on)
--     juan.boarder@example.com, maria.boarder@example.com, ... (see the rooms below)
--
-- All emails are on example.com, a domain reserved for testing, so no
-- real person ever gets an email.
--
-- ⚠️ Anyone who reads this repo knows the demo password. Only ever put
-- made-up data in these accounts, and delete them before real use:
--   delete from auth.users where email like '%.demo@example.com' or email like '%.boarder@example.com';
--
-- Run in: Supabase -> SQL Editor -> New query -> paste -> Run
-- (The SQL Editor runs as the database owner, so it can create accounts
-- and look up their ids. The app itself can never do this.)

-- 1. Accounts --------------------------------------------------------
--
-- Creates a confirmed email+password account, or resets the password if
-- the account already exists. This writes to Supabase's own auth tables,
-- which is fine for demo data but never something the app should do.

create or replace function pg_temp.demo_account(account_email text)
returns uuid
language plpgsql
as $$
declare
  account_id uuid := (select id from auth.users where email = account_email);
begin
  if account_id is not null then
    update auth.users
       set encrypted_password = extensions.crypt('demo1234', extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now())
     where id = account_id;
    return account_id;
  end if;

  account_id := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', account_id, 'authenticated', 'authenticated',
    account_email, extensions.crypt('demo1234', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), account_id, account_id::text, 'email',
    jsonb_build_object('sub', account_id::text, 'email', account_email, 'email_verified', true),
    now(), now(), now()
  );

  return account_id;
end;
$$;

-- 2. Rooms -----------------------------------------------------------

do $$
declare
  mama_lita  uuid := pg_temp.demo_account('mamalita.demo@example.com');
  aling_nena uuid := pg_temp.demo_account('alingnena.demo@example.com');
  boarder    text;
begin
  -- Boarder accounts, ready for ticket 05.
  foreach boarder in array array[
    'juan', 'maria', 'paolo', 'andrea', 'carlo', 'bea', 'miguel', 'jasmin', 'rico', 'lea'
  ] loop
    perform pg_temp.demo_account(boarder || '.boarder@example.com');
  end loop;

  -- Only landlords may create rooms (see 007-security-fixes.sql).
  insert into landlords (user_id, display_name) values (mama_lita, 'Mama Lita'), (aling_nena, 'Aling Nena')
    on conflict (user_id) do update set display_name = excluded.display_name;

  -- Only removes rooms this file created before; your own rooms are untouched.
  delete from rooms where note like '[demo]%';

  insert into rooms (landlord_id, label, boarder_first_name, boarder_email, due_day, monthly_amount, note) values
    (mama_lita, 'Room 1',  'Juan',   'juan.boarder@example.com',   5,  3500, '[demo] all-inclusive'),
    (mama_lita, 'Room 2',  'Maria',  'maria.boarder@example.com',  10, 4200, '[demo] rent + own sub-meter'),
    (mama_lita, 'Room 3',  'Paolo',  'paolo.boarder@example.com',  1,  3000, '[demo] all-inclusive'),
    (mama_lita, 'Room 4',  'Andrea', 'andrea.boarder@example.com', 15, 3800, '[demo] rent + own sub-meter'),
    (mama_lita, 'Room 5',  'Carlo',  'carlo.boarder@example.com',  17, 3500, '[demo] all-inclusive'),
    (mama_lita, 'Room 6',  'Bea',    'bea.boarder@example.com',    19, 4500, '[demo] rent + water + electric'),
    (mama_lita, 'Room 7',  'Miguel', 'miguel.boarder@example.com', 25, 3200, '[demo] all-inclusive'),
    (mama_lita, 'Room 8',  'Jasmin', 'jasmin.boarder@example.com', 31, 3600, '[demo] due day 31: falls back to 30 in Nov'),
    (mama_lita, 'Room 9',  null,     null,                         1,  3500, '[demo] vacant'),
    (mama_lita, 'Room 10', 'Rico',   'rico.boarder@example.com',   28, 2800, '[demo] small room, shared CR'),
    (aling_nena, 'Room A', 'Lea',    'lea.boarder@example.com',    8,  3000, '[demo] other landlord'),
    (aling_nena, 'Room B', null,     null,                         20, 3000, '[demo] other landlord, vacant');
end $$;
