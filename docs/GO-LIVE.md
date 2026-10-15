# Before real people use Rent Ledger

Do every step **before Mama Lita or any real boarder enters real data**.
They are settings in the Supabase dashboard, so they can't be done in
code. Tick each one as you go.

- [x] **Turn "Confirm email" ON.**
      Supabase → Authentication → Sign In / Providers → Email.
      Boarders are matched to their room by email. With this off, anyone
      could sign up with a boarder's email and see their payments.
- [x] **Set the Site URL to the live app.**
      Supabase → Authentication → URL Configuration → Site URL:
      `https://nat-phinma-builder.vercel.app`.
      Otherwise the confirmation email links to `localhost` and fails.
- [x] **Delete the demo accounts.** Their password (`demo1234`) is public
      in the repo. Run in the SQL Editor:
      `delete from auth.users where email like '%.demo@example.com' or email like '%.boarder@example.com';`
      (This also deletes their demo rooms and payments.)
- [x] **Check the landlords list.** Supabase → Table Editor → `landlords`.
      Only real landlords should be there. Anyone else could add rooms.
- [x] **Add Mama Lita as a landlord.** After she signs up in the app, run:
      `insert into landlords (user_id) select id from auth.users where email = 'HER EMAIL';`
- [x] **Remove the unused example table**, if `001-example.sql` was ever
      run (anyone on the internet can read and add to it):
      `drop table if exists notes;`
- [x] **Check every table says RLS enabled** in Table Editor.
- [x] **Test with two real phones:** a boarder can see only their own
      room, and Mama Lita sees every room.

## Setting up a boarder who didn't get the email

Supabase's free email service sends only a few emails per hour, so a
boarder's confirmation email may not arrive. Create their account by hand,
**with the boarder present** (so you know the email is really theirs):

1. Make sure their email is saved on their room in the app.
2. Supabase → Authentication → Users → **Add user** → Create new user.
3. Enter **their** email; let **them** type their own password.
4. Tick **Auto Confirm User** → Create user.
5. They log in at the live site and see their room.

If it says the email is already registered, delete that half-made user in
Authentication → Users first, then add it again.

**Better long-term:** connect your own email sender (Supabase →
Authentication → Emails → SMTP Settings). That's a new service, so agree
on it as a team first.
