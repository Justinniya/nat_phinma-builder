# Later

Good ideas that are not in the MVP.

Parking something here is a decision, not a loss. It is how the MVP
stays small enough to actually ship by Session 3.

## From /code-review (small polish, none block the demo)

- **Bigger status colours**: room cards show Paid / Due soon / Overdue
  as a small dot; a coloured badge or card edge would be easier to see
  at a glance.
- **Hide the room note from boarders**: the screen doesn't show it, but
  a boarder can read Mama Lita's private note through the database.
  Move notes to a landlord-only table, or treat notes as not private.
- **Fixed messages instead of URL text**: error and success messages
  are read from the web address, so someone could send a link that shows
  a fake notice on the real site. Use short codes mapped to fixed text.
- **Clear "nothing changed" errors**: when the database blocks a change,
  the app still says it worked. Treat "0 rows changed" as an error.
- **Tidy up**: remove `supabase/sql/001-example.sql` (the unused
  illustration and empty images folder are already gone).

## Cut from the spec (/to-spec)

- **Separate due for each month**: each month gets its own editable
  amount (the MVP uses one current amount per room).
- **Received-by pick-list**: Mama Lita keeps a list of authorized names
  to tap (the MVP uses a text box).
- **"Accept GCash" setting**: Mama Lita turns GCash on or off for her
  boarding house (the MVP always offers Cash and GCash).
- **One-time email-link login**: boarders log in without a password
  (needs a custom email service; Supabase's free one sends only a few
  emails per hour).

## From /grill-with-docs

- **Helper login**: Mama Lita's trusted person gets their own login to
  confirm the cash they collect (needs rules for what helpers can see
  and change).
- **Edit or cancel a report**: boarders fix or withdraw a payment report
  before Mama Lita confirms it.
- **GCash screenshot uploads**: attach proof-of-payment images to a
  payment (needs file storage).
- **Digital receipts**: generate a receipt a boarder can keep.
- **Utility calculator**: work out each room's electric or water share
  from sub-meter readings.
- **Deposit refunds and deductions**: track returning a deposit and
  deducting damages when a boarder moves out.
- **Auto-apply advances**: use an advance payment to mark a month as
  paid automatically.
- **Partial payments of monthly dues**: several payments against one
  due, with a "still owes" balance.
- **Reminders**: send boarders a reminder before their due date
  (Messenger, SMS or email).
- **Shared rooms**: more than one boarder per room, splitting the due.
- **Other online payment methods**: Maya, bank transfer, and others,
  alongside GCash.
- **More landlords or properties**: other boarding houses using the app.
