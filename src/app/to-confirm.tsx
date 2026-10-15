import { Inbox } from "lucide-react";
import { ConfirmReject } from "@/components/confirm-reject";
import { Card, CardContent } from "@/components/ui/card";
import { methodLabel, type Payment } from "@/lib/payments";
import { formatDate, formatPeriod, formatPesos, parseDate } from "@/lib/rooms";

// The "To confirm" list on Mama Lita's dashboard: every boarder report
// still waiting for her, each with Confirm / Reject.

export type PendingReport = Payment & {
  rooms: { label: string; boarder_first_name: string | null } | null;
};

export function ToConfirm({ reports }: { reports: PendingReport[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        {reports.length === 0 ? (
          <p className="flex items-center gap-3 px-6 py-5 text-sm text-muted-foreground">
            <Inbox className="h-5 w-5 shrink-0" aria-hidden />
            Nothing to confirm. When a boarder taps “I paid”, it shows up here.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">
                    {r.rooms?.label ?? "Room"}
                    {r.rooms?.boarder_first_name ? ` · ${r.rooms.boarder_first_name}` : ""}
                    <span className="font-normal text-muted-foreground"> says they paid </span>
                    <span className="tabular-nums">{formatPesos(r.amount)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    For {r.period ? formatPeriod(r.period) : "—"} · Paid {formatDate(parseDate(r.paid_on))} ·{" "}
                    {methodLabel[r.method]}
                    {r.reference_no ? ` · Ref ${r.reference_no}` : ""}
                    {r.received_by ? ` · Received by ${r.received_by}` : ""}
                  </p>
                </div>
                <ConfirmReject paymentId={r.id} returnTo="/" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
