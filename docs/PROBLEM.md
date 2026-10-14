# Rent Ledger for Mama Lita

## Who
**Primary user:** Mama Lita, the owner and manager of a boarding house
with 8–12 rooms (one boarder per room). She uses only her smartphone,
mostly for Facebook, Messenger and GCash, and keeps records in a paper
notebook. She does not use a laptop or spreadsheets.

**Secondary user:** her boarders. Each boarder sees only their own room
and can report a payment for Mama Lita to confirm.

## The struggle
One of us lives in her boarding house as a boarder and has watched this
happen many times. Mama Lita sits at her table with her notebook,
looking stressed, and cross-checks GCash notifications, payment
screenshots sent on Messenger, and cash payments. Some of that cash
goes to a trusted person she has authorized to collect for her. She gets
confused about who has paid rent and who still owes for the electric
sub-meter. Sometimes she has to ask a boarder to prove they paid, which
is awkward for both of them.

This happens several times a week: checking balances, looking for proof
of payment, chasing late payers and answering "did I already pay for
August?" questions.

## Today's workaround
1. A due date comes up. Mama Lita reminds the boarder, or the boarder
   messages her.
2. Most boarders pay **in cash, face to face**, to Mama Lita or her
   trusted person. This is the usual way in Philippine boarding houses.
   Some pay by GCash, if the landlady accepts it, and forward a
   screenshot or tell her on Messenger.
3. She checks the GCash notification on her phone, or waits for the
   cash to reach her.
4. Later, she writes the payment in her notebook, or sometimes forgets
   because she is busy with chores.

What it costs: time spent scrolling through chats and flipping pages,
mistakes about who has paid and who is holding the cash, stress, and
awkward "prove it" moments with boarders. A spreadsheet does not fix
it: on a phone the text is tiny, formulas break easily, she does not
use one, and boarders can't safely report payments into it.

## The MVP
A phone-first rent ledger where boarders report their payments, Mama
Lita confirms them, and she sees every room's status (Paid / Due soon /
Overdue) at a glance.

**Mama Lita can:**
- Log in privately.
- Add rooms: label, the boarder's first name, the boarder's email, a
  **due day** (from the move-in date) and a monthly amount.
- Keep a short list of people authorized to receive cash ("Mama Lita"
  by default, plus names she adds).
- Turn **"Accept GCash"** on or off. It is off by default, so cash is
  the only option until she turns it on.
- See a dashboard with every room's status for the current period and a
  **"To confirm"** list at the top.
- **Confirm** a payment report (the due becomes Paid) or **Reject** it
  with a short reason the boarder sees.
- Record a payment herself in under 10 seconds. It counts as confirmed
  straight away.
- Record move-in **deposits** and **advances** (only she can).
- Edit each period's amount when utilities change. It copies the
  previous amount by default.
- View any room's full payment history.

**A boarder can:**
- Log in with a one-time link sent to their email (no password).
- See only their own room: due day, current amount, and payment history
  with statuses.
- Send an **"I paid"** report: amount, date, method (Cash by default;
  GCash only if Mama Lita accepts it), received by (picked from Mama
  Lita's list, for cash), and a reference number if it was GCash.

**A boarder cannot:** see other rooms, change amounts, confirm
anything, or edit or delete a report after sending it. If they made a
mistake, they tell Mama Lita and she rejects it.

**Rules we agreed:**
- **Cash, face to face, is the main payment method** and the default
  in every form. GCash is optional, and only appears if Mama Lita has
  turned on "Accept GCash."
- A room only turns **Paid** after Mama Lita confirms.
- The due day never moves. If they pay late for November, December is
  still due on the same day.
- If the due day doesn't exist in a month (29th–31st), the due date is
  the last day of that month.
- A room shows **Due soon** 5 days before its due date.
- Deposits and advances are only recorded. They are never applied to a
  month automatically.
- The app does no utility calculations. Mama Lita types in the final
  amount.

## How we'll know it worked
**The demo (3 minutes, two phones):**
1. On the boarder's phone, log in with the email link, see the room's
   due date and amount, and send an "I paid" report (Cash, received by
   the trusted person).
2. On Mama Lita's phone, the report appears under "To confirm." She
   taps **Confirm**, and the room turns Paid.
3. Back on the boarder's phone, the payment shows as Confirmed.
4. Mama Lita records a move-in deposit for another room.
5. She opens a room's history and answers "did I pay in August?" in
   under 10 seconds.

**Real-world test before Session 3:** Mama Lita and at least 2–3
boarders use the app alongside her notebook for an upcoming payment
cycle. It worked if:
- (a) boarders report their payments in the app, and Mama Lita confirms
  them and logs deposits/advances;
- (b) she can check whether a room has paid, or look up its due date,
  in under 10 seconds without the notebook or Messenger.

**Still to do:** ask Mama Lita, and 2–3 boarders, this week whether they
agree to try it, and confirm the Session 3 date. Fallback: the team
role-plays a cycle using her notebook's data.

## Out of scope
- A login for Mama Lita's trusted person or other helpers
- Boarders editing or deleting a report after sending it
- Uploading GCash screenshots or other images
- Generating digital receipts
- Calculating utility bills from sub-meter readings
- Deposit refunds or damage deductions
- Automatically applying advances to a month
- Partial payments of monthly dues
- Reminders or notifications sent to boarders
- Shared rooms with more than one boarder
- More than one landlord or property
- Storing sensitive data: GCash numbers or PINs, IDs, addresses,
  passwords

## Glossary
- **Landlord**: Mama Lita, the owner and manager. The primary user.
- **Boarder**: a person renting a room. A user who sees only their own
  room.
- **Trusted person**: someone Mama Lita authorizes to receive cash for
  her. Not a user of the app. Appears only as a "received by" name.
- **Room**: one rented unit with one boarder. It has a label, the
  boarder's first name and email, a due day and a monthly amount.
- **Due day**: the day of the month a room's payment is due, taken from
  the move-in date. It never shifts. If that day doesn't exist in a
  month, the due date is the last day of the month.
- **Due**: what one room owes for one billing period. It copies the
  previous amount by default, and Mama Lita can edit it.
- **Payment**: money paid toward a room, with amount, date, method
  (Cash / GCash), received by, a reference number (GCash only), a type
  and a status.
- **Payment report**: a payment entered by a boarder. It starts as
  Pending.
- **Payment type**: *Monthly* (pays one due in full), *Deposit* or
  *Advance* (recorded at move-in by Mama Lita, record only).
- **Payment status**: *Pending* (reported, waiting for Mama Lita),
  *Confirmed* (counts toward the due) or *Rejected* (Mama Lita didn't
  receive it, with a reason).
- **Room status**: *Paid*, *Due soon* (within 5 days of the due date)
  or *Overdue* (past the due date and not confirmed paid), for the
  current period.
