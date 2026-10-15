# Spec: Rent Ledger for Mama Lita

## Problem
Mama Lita runs a boarding house with 8–12 rooms. Every month she
cross-checks a paper notebook, Messenger chats, GCash notifications and
cash, much of it paid face to face to her or her trusted person, to
work out who has paid. She loses track, forgets to write things down,
and sometimes has to ask a boarder to prove they paid.

## Solution
A phone-first rent ledger. Boarders report "I paid" from their own
phone. Mama Lita confirms each report when the money is really in her
hand. On one screen, she sees every room as Paid, Due soon or Overdue.
She can also record payments, deposits and advances herself, and look
up any room's history in seconds.

## The user
**Primary:** Mama Lita, the landlord. She manages rooms and confirms
payments.

**Secondary:** boarders. Each one sees only their own room and can
report a payment.

There is one landlord and one boarder per room.

## User stories
1. As Mama Lita, I want to add each room with the boarder's first name,
   email, due day and monthly amount, so that the app knows who owes
   what and when.
2. As Mama Lita, I want to see every room's status (Paid / Due soon /
   Overdue) on one screen, so that I know who still owes without
   opening my notebook.
3. As a boarder, I want to report that I paid (cash or GCash, and who
   received it), so that there is a record of my payment even when I
   paid face to face.
4. As Mama Lita, I want to confirm or reject a boarder's payment report,
   so that a room only shows Paid once the money is really in my hands.
5. As Mama Lita, I want to record a payment, deposit or advance myself
   in a few taps, so that boarders who don't use the app are still
   tracked.
6. As Mama Lita, I want to see a room's full payment history, so that I
   can settle "did I pay in August?" in under 10 seconds.
7. As a boarder, I want to see my due date, amount and payment history
   with statuses, so that I know where I stand without messaging Mama
   Lita.
8. As Mama Lita, I want to edit a room's monthly amount when utilities
   change, so that the amount due is always correct.

## Screens
1. **Log in / Sign up**: email and password. Mama Lita signs up first.
   Boarders sign up with the same email Mama Lita saved on their room,
   and confirm it by email.
2. **Mama Lita: Dashboard**: an **Overview** of how many rooms are in
   each status (tap one to see those rooms), the **To confirm** list
   (each report has Confirm and Reject-with-reason), and **Needs
   attention**: the overdue and due-soon rooms.
   **Mama Lita: Rooms** (separate page, so the dashboard isn't crowded):
   every room as a big card showing photo, label, first name, due date,
   amount and its Paid / Due soon / Overdue status, with filter tabs
   per status.
   **Mama Lita: Payments**: every payment across all rooms as a table
   (date, room, month, method, received by, amount, status), with tabs
   per status and the total collected this month.
   All of Mama Lita's screens share a sidebar menu: Dashboard, Rooms,
   Payments (a top menu bar on phones).
3. **Mama Lita: Add / edit room**: label, boarder's first name,
   boarder's email, due day (1–31), monthly amount, and a note. A room
   with no boarder is *Vacant*. The edit screen also has the room's
   **photos**: add several at once, delete one. The first photo shows
   on the room's dashboard card. (Added by the team; ticket 07.)
4. **Mama Lita: Room detail**: the room's info, its full payment
   history with statuses, and **Record payment** and **Edit room**
   buttons.
5. **Mama Lita: Record payment**: type (Monthly / Deposit / Advance),
   amount (pre-filled from the room), date (today), method (Cash by
   default, or GCash), received by ("Mama Lita" by default), and a
   reference number if GCash. It saves as Confirmed.
6. **Boarder: My room**: due date, amount, this period's status, and
   payment history including Pending, Confirmed, and Rejected with its
   reason.
7. **Boarder: I paid**: amount (pre-filled), date (today), method (Cash
   by default, or GCash), received by ("Mama Lita" by default), and a
   reference number if GCash. It saves as Pending.

## Data

### `rooms`
One row per room.

| Column | Meaning |
|---|---|
| `id` | unique id |
| `landlord_id` | the landlord's login account (Mama Lita) |
| `label` | room name, e.g. "Room 4" |
| `boarder_first_name` | boarder's first name only |
| `boarder_email` | email the boarder logs in with; links them to this room |
| `due_day` | day of the month rent is due, 1–31, from the move-in date |
| `monthly_amount` | current amount due each period, in pesos |
| `note` | optional free text |
| `created_at` | when the row was added |

**Who may do what:**
- **The landlord** may read, add, edit and delete rows where
  `landlord_id` is her own account.
- **A boarder** may only **read** the row whose `boarder_email` matches
  their confirmed login email. Boarders may never add, edit or delete
  rooms.
- **Anyone not logged in** can do nothing.

### `payments`
One row per payment, report, deposit or advance.

| Column | Meaning |
|---|---|
| `id` | unique id |
| `room_id` | which room |
| `landlord_id` | the landlord who owns that room |
| `type` | `monthly`, `deposit` or `advance` |
| `period` | the month a monthly payment is for; empty for deposits and advances |
| `amount` | pesos paid |
| `paid_on` | date the money changed hands |
| `method` | `cash` or `gcash` |
| `received_by` | who took the money, e.g. "Mama Lita" or her trusted person's name |
| `reference_no` | GCash reference number; empty for cash |
| `status` | `pending`, `confirmed` or `rejected` |
| `reject_reason` | short reason when rejected |
| `reported_by` | the login account that created the row |
| `created_at` | when the row was added |

**Who may do what:**
- **The landlord** may read, add, edit and delete payments where
  `landlord_id` is her own account, and only for her own rooms. Her own
  entries save as `confirmed`. She confirms or rejects reports by
  changing `status` (and `reject_reason`).
- **A boarder** may **read** payments for their own room only.
- **A boarder** may **add** a payment only if it is for their own room,
  `type` is `monthly`, `status` is `pending`, `reported_by` is
  themselves, and `landlord_id` matches the room's landlord.
- **A boarder** may never edit or delete a payment.
- **Anyone not logged in** can do nothing.

### Storage bucket `room-photos`
Photo files, private (no public links). Each photo is saved at
`<landlord id>/<room id>/<file name>`. JPEG, PNG or WebP, up to 5 MB.

**Who may do what:**
- **The landlord** may view, add and delete photos only for her own
  rooms.
- **A boarder** may only **view** photos of their own room.
- **Anyone not logged in** can do nothing.

### Calculated, not stored
- **Due date this period**: the room's `due_day` in the current month.
  If that day doesn't exist (29th–31st), use the last day of the month.
- **Room status**: *Overdue* if **last month** was never confirmed paid
  (only counted if the room already existed by last month's due date,
  so a newly added room doesn't start overdue); *Paid* if a `confirmed`
  monthly payment exists for this period; *Overdue* if this month's due
  date has passed without one; *Due soon* if it is within 5 days of the
  due date; otherwise *Upcoming*, showing the due date. (Added after
  /code-review, so an unpaid month no longer disappears on the 1st.)
- **Who is the landlord?** Accounts on the `landlords` list (added only
  through the SQL Editor; see `007-security-fixes.sql`). Only landlords
  can add or edit rooms. Landlords are checked first. Otherwise, someone
  whose login email matches a room's `boarder_email` sees the boarder
  screens. Anyone else sees "Your account isn't linked to a room yet".

### `landlords`
One row per landlord account (`user_id`). A user may only check whether
they themselves are on it. Nobody can add or remove rows from the app.

### `payments.boarder_email`
Filled in by the database when a payment is saved: the room's boarder
email at that moment. A boarder only sees payments with their own email,
so a new boarder never sees the previous boarder's history.

## Login
Yes, accounts are needed, because both Mama Lita and the boarders log
in. Use **Supabase Auth with email and password**.

**Email confirmation: OFF while building, ON before real data.** A
boarder is linked to their room by their email. With confirmation off,
anyone could sign up with a boarder's email and see their payments. The
team has chosen to keep it off while building with made-up test data, so
they can create accounts quickly. It **must be turned ON before any real
boarder's email or payments go in**, and before the real-world test
with Mama Lita. Supabase's free email service only sends a few emails
per hour, so sign up the demo accounts **before** Session 3, not during
the demo.

## Done for the demo
On the **live Vercel URL**, using two phones:
- [ ] Mama Lita can sign up, log in and add at least three rooms.
- [ ] A boarder can sign up with their room's email, log in, and sees
      only their own room.
- [ ] The boarder sends an "I paid" report (Cash, received by the
      trusted person), and it shows as Pending.
- [ ] Mama Lita sees it under To confirm, taps Confirm, and the room
      turns green (Paid).
- [ ] The boarder refreshes and sees the payment as Confirmed.
- [ ] Mama Lita rejects a report with a reason, and the boarder sees
      the reason.
- [ ] Mama Lita records a deposit for a room herself.
- [ ] Mama Lita opens a room's history and answers "did they pay in
      August?" in under 10 seconds.
- [ ] Logged in as one boarder, you cannot see any other room's data.
- [ ] Every table has Row Level Security on, with the policies above.
- [ ] "Confirm email" is ON in Supabase before any real boarder data
      goes in.

## Out of scope
- A separate due record for each month with its own editable amount
  (the MVP uses one current amount per room)
- Received-by pick-list (the MVP uses a text box)
- "Accept GCash" on/off setting (the MVP always offers Cash and GCash)
- One-time email-link login (the MVP uses email and password)
- A login for Mama Lita's trusted person or other helpers
- Boarders editing or deleting a report after sending it
- Uploading GCash screenshots (room photos are in; payment proof images
  are not)
- Generating digital receipts
- Calculating utility bills from sub-meter readings
- Deposit refunds or damage deductions
- Automatically applying advances to a month
- Partial payments of monthly dues
- Reminders or notifications sent to boarders
- Shared rooms with more than one boarder
- More than one landlord or property
- Other online payment methods (Maya, bank transfer)
- Storing sensitive data: GCash numbers or PINs, IDs, addresses
