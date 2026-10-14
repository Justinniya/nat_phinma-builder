# 02 — Connected to Supabase

**What to build:** The app talks to the team's hosted Supabase project.
The `rooms` table exists with Row Level Security on, and the live site
shows "Connected — 0 rooms visible" to a logged-out visitor. That proves
the connection works and that strangers can't see any rooms.

**Blocked by:** 01

**Status:** todo

- [ ] The Supabase URL and publishable (anon) key are set on the
      laptop AND in Vercel's environment variables; no `service_role`
      or `sb_secret_` key appears anywhere
- [ ] The local env file is not committed to git
- [ ] The `rooms` table is created with the columns in the spec, saved
      as a numbered SQL file in the repo
- [ ] Row Level Security is ON for `rooms`, with policies: the landlord
      reads/adds/edits/deletes only her own rooms; a boarder may only
      read the room whose `boarder_email` matches their confirmed login
      email; logged-out visitors get nothing
- [ ] The home page shows "Connected — 0 rooms visible" (or a clear
      error message if the connection fails)
- [ ] Works on the live URL
