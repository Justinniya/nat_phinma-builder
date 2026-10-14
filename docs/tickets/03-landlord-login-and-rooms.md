# 03 — Mama Lita logs in and adds rooms

**What to build:** Mama Lita can sign up, log in and log out with email
and password. She can add and edit rooms, and her dashboard shows every
room as a big, phone-friendly card with its due date, amount and status.

**Blocked by:** 02

**Status:** done

- [x] Sign up, log in and log out work with email and password (email
      confirmation is OFF for now while testing; it must be ON before
      real data, see ticket 05)
- [x] Logged-out visitors are sent to the log-in screen
- [x] Add / edit room form: label, boarder's first name, boarder's
      email, due day (1–31), monthly amount, note
- [x] Dashboard shows one card per room: label, first name, due date
      this period, amount, and status
- [x] Status is calculated: *Overdue* (red) if the due date has passed,
      *Due soon* (amber) within 5 days of it, otherwise *Upcoming* with
      the date
- [x] A room can be vacant (no boarder name or email) and shows
      *Vacant* on the dashboard
- [x] A due day of 29–31 falls back to the last day of shorter months
- [x] A second landlord account cannot see Mama Lita's rooms
- [x] Works on the live URL
