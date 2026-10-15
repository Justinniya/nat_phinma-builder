import { Check, Inbox, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { methodLabel, type Payment } from "@/lib/payments";
import { formatDate, formatPeriod, formatPesos, parseDate } from "@/lib/rooms";
import { confirmPayment, rejectPayment } from "./reports/actions";

// The "To confirm" list at the top of Mama Lita's dashboard: every
// boarder report still waiting for her.

export type PendingReport = Payment & {
  rooms: { label: string; boarder_first_name: string | null } | null;
};

export function ToConfirm({ reports }: { reports: PendingReport[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" aria-hidden />
          To confirm
        </CardTitle>
        {reports.length > 0 && (
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {reports.length}
          </span>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {reports.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            Nothing to confirm. When a boarder taps “I paid”, it shows up here.
          </p>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">
                    {r.rooms?.label ?? "Room"}
                    {r.rooms?.boarder_first_name ? ` · ${r.rooms.boarder_first_name}` : ""}
                    <span className="font-normal text-muted-foreground">
                      {" "}says they paid{" "}
                    </span>
                    <span className="tabular-nums">{formatPesos(r.amount)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    For {r.period ? formatPeriod(r.period) : "—"} · Paid {formatDate(parseDate(r.paid_on))} ·{" "}
                    {methodLabel[r.method]}
                    {r.reference_no ? ` · Ref ${r.reference_no}` : ""}
                    {r.received_by ? ` · Received by ${r.received_by}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  <form action={confirmPayment.bind(null, r.id)}>
                    <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700">
                      <Check className="h-4 w-4" aria-hidden />
                      Confirm
                    </Button>
                  </form>

                  {/* Reject needs a reason, so it opens a small box first. */}
                  <details className="group">
                    <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-[var(--radius)] border border-border px-4 text-sm font-medium hover:bg-secondary">
                      <X className="h-4 w-4" aria-hidden />
                      Reject
                    </summary>
                    <form action={rejectPayment.bind(null, r.id)} className="mt-2 flex w-full flex-col gap-2 sm:w-72">
                      <Input name="reason" placeholder="e.g. Not received yet" required maxLength={200} />
                      <Button type="submit" variant="destructive" size="sm">
                        Reject with this reason
                      </Button>
                    </form>
                  </details>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
