# 06 — Mama Lita confirms or rejects reports

**What to build:** Boarders' "I paid" reports appear in a To confirm list
at the top of Mama Lita's dashboard. Confirm makes the payment count and
turns the room Paid. Reject asks for a short reason, which the boarder
sees. This completes the full two-phone demo.

**Blocked by:** 05

**Status:** todo

- [ ] To confirm list at the top of the dashboard shows each Pending
      report: room, boarder's first name, amount, date, method, received
      by and reference number
- [ ] Confirm changes the status to Confirmed, and the room turns Paid
      if it is this period's monthly payment
- [ ] Reject requires a short reason, then changes the status to
      Rejected
- [ ] The boarder sees Confirmed, or Rejected with the reason, in their
      history after refreshing
- [ ] An empty To confirm list shows a friendly "Nothing to confirm"
      message
- [ ] The full demo from the spec runs end to end on two phones
- [ ] Works on the live URL
