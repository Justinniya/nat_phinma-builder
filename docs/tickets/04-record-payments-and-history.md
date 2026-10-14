# 04 — Mama Lita records payments and sees history

**What to build:** Mama Lita taps a room, sees its full payment history,
and records a payment, deposit or advance herself in a few taps.
Recording this period's monthly payment turns the room green (Paid).

**Blocked by:** 03

**Status:** todo

- [ ] The `payments` table is created with the columns in the spec,
      saved as a numbered SQL file in the repo
- [ ] Row Level Security is ON for `payments`, with landlord policies:
      she reads/adds/edits/deletes only payments for her own rooms
- [ ] Room detail screen: room info, payment history (newest first)
      with type, amount, date, method, received by and status, plus
      Record payment and Edit room buttons
- [ ] Record payment form: type (Monthly / Deposit / Advance), amount
      pre-filled from the room, date defaults to today, method defaults
      to Cash (GCash optional), received by defaults to "Mama Lita",
      reference number shown only for GCash
- [ ] Payments Mama Lita records save as Confirmed
- [ ] A confirmed monthly payment for this period turns the room's card
      Paid (green) on the dashboard
- [ ] Deposits and advances appear in history but never change the
      room's status
- [ ] Works on the live URL
