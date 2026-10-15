# Session 3 demo — 3 minutes, two phones

**Phone A** = Mama Lita (`mamalita.demo@example.com` / `demo1234`)
**Phone B** = Juan, a boarder (`juan.boarder@example.com` / `demo1234`)

Log both phones in **before** you start. Open the live URL:
https://nat-phinma-builder.vercel.app/

## Before the demo (5 minutes earlier)

- [ ] Re-run `supabase/sql/seed-demo-data.sql`, so every room starts fresh.
- [ ] Phone A is on the **Dashboard**. Phone B is on **My room**.
- [ ] Both phones have screen brightness up and notifications off.

## The script

| Time | Who | Do | Say |
|---|---|---|---|
| 0:00 | — | Show the landing page on Phone A | "Mama Lita runs a boarding house with ten rooms. Every month she cross-checks a notebook, GCash screenshots and Messenger to work out who has paid." |
| 0:20 | A | Dashboard: point at **Overview** and **Needs attention** | "Now she opens one screen. Red is overdue, amber is due soon. No notebook." |
| 0:45 | B | Juan taps **I paid** → Cash, received by "Kuya Ben" → **Send to landlord** | "Juan paid cash to her helper. He reports it from his own phone." |
| 1:10 | B | Point at **Pending** and the yellow note | "It's pending. It only counts once Mama Lita has the money." |
| 1:20 | A | Refresh the Dashboard. Juan's report is under **To confirm** → **Confirm** | "Kuya Ben hands her the cash. She taps Confirm." |
| 1:35 | A | **Rooms** → Room 1 is green (**Paid**) | "Room 1 turns green." |
| 1:45 | B | Refresh → **Confirmed** | "Juan sees it's confirmed. That's his receipt." |
| 2:00 | A | **Payments** page | "Every payment, every room, in one table, and how much she collected this month." |
| 2:20 | A | Open Room 1 → history | "Did Juan pay in August? Answered in seconds." |
| 2:40 | — | — | "Next: Mama Lita uses it for a real payment cycle alongside her notebook." |

## If something goes wrong

- **The report doesn't appear on Phone A:** pull down to refresh, or tap **Dashboard** again.
- **"You already sent a payment for that month":** a report from practice is still waiting. Re-run the seed file, or reject the old report.
- **A phone is logged out:** log in again with the details at the top.
