# 05 — Boarder sees their room and reports "I paid"

**What to build:** A boarder signs up with the email Mama Lita saved on
their room, and sees only their own room: due date, amount, status and
payment history. They can send an "I paid" report, which waits as
Pending for Mama Lita.

**Blocked by:** 04

**Status:** done

- [x] A user whose login email matches a room's `boarder_email` sees
      the boarder screens; everyone else sees the landlord screens
- [x] Boarder policies added on `payments`: a boarder may read payments
      for their own room only, and may add a payment only for their own
      room with type monthly, status pending and `reported_by` set to
      themselves; they can never edit or delete
- [x] My room screen: due date this period, amount, status, and history
      showing Pending, Confirmed and Rejected (with the reason)
- [x] I paid form: amount pre-filled, date defaults to today, method
      defaults to Cash (GCash optional), received by defaults to "Mama
      Lita", reference number shown only for GCash; saves as Pending
- [x] A Pending report does NOT turn the room Paid
- [x] Tested with two boarder accounts: neither can see the other's
      room or payments
- [x] Before any real boarder's email or payments go in, "Confirm
      email" is turned ON in Supabase (otherwise anyone can sign up
      with a boarder's email and see their payments)
- [x] Works on the live URL
