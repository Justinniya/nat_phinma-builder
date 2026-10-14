-- SEED — demo rooms and renters (made-up data, for testing only)
--
-- This is NOT a schema change, so it has no number. Run it whenever you
-- want fresh demo data. It is safe to run again: it first deletes only
-- the rooms it created before (the ones whose note starts with [demo]).
--
-- BEFORE RUNNING: sign up these two landlord accounts in the app
-- (Sign up button on the login page). Any password works.
--   mamalita.demo@example.com   -> Mama Lita, 10 rooms
--   alingnena.demo@example.com  -> a second landlord, 2 rooms
--                                  (to check landlords can't see each other's rooms)
--
-- The renters' emails are on example.com, a domain reserved for testing,
-- so no real person ever gets an email. In ticket 05, sign up with one of
-- them to see the app as that boarder.
--
-- Run in: Supabase -> SQL Editor -> New query -> paste -> Run
-- (The SQL Editor runs as the database owner, so it can look up the
-- landlords' account ids. The app itself can never do this.)

do $$
declare
  mama_lita  uuid := (select id from auth.users where email = 'mamalita.demo@example.com');
  aling_nena uuid := (select id from auth.users where email = 'alingnena.demo@example.com');
begin
  if mama_lita is null or aling_nena is null then
    raise exception 'Sign up mamalita.demo@example.com and alingnena.demo@example.com in the app first.';
  end if;

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
