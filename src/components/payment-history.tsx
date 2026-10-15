import { Trash2 } from "lucide-react";
import { deletePayment } from "@/app/rooms/[id]/pay/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentStatusBadge } from "@/components/layout";
import { methodLabel, typeLabel, type Payment } from "@/lib/payments";
import { formatDate, formatPeriod, formatPesos, parseDate } from "@/lib/rooms";

// A room's payments, newest first. Shown to Mama Lita (with a remove
// button for mistakes) and to the boarder (read-only).

export function PaymentHistory({
  payments,
  emptyText,
  removableForRoomId,
}: {
  payments: Payment[];
  emptyText: string;
  removableForRoomId?: string; // landlord only
}) {
  return (
    <Card className="h-fit">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Payment history</CardTitle>
        <span className="text-sm text-muted-foreground">
          {payments.length} {payments.length === 1 ? "payment" : "payments"}
        </span>
      </CardHeader>
      <CardContent className="p-0">
        {payments.length === 0 ? (
          <p className="px-6 pb-8 text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">
                    {p.type === "monthly" && p.period ? formatPeriod(p.period) : typeLabel[p.type]}
                    {p.type === "monthly" && <span className="font-normal text-muted-foreground"> · Monthly</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Paid {formatDate(parseDate(p.paid_on))} · {methodLabel[p.method]}
                    {p.reference_no ? ` · Ref ${p.reference_no}` : ""}
                    {p.received_by ? ` · Received by ${p.received_by}` : ""}
                  </p>
                  {p.status === "rejected" && p.reject_reason && (
                    <p className="text-sm text-red-700 dark:text-red-400">Rejected: {p.reject_reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="font-semibold tabular-nums">{formatPesos(p.amount)}</span>
                  <PaymentStatusBadge status={p.status} />
                  {removableForRoomId && (
                    // Remove a mistake. Hidden behind a second tap.
                    <details className="relative">
                      <summary
                        className="cursor-pointer list-none rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
                        aria-label="Remove payment"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </summary>
                      <form
                        action={deletePayment.bind(null, removableForRoomId, p.id)}
                        className="panel absolute right-0 z-10 mt-2 flex w-56 flex-col gap-2 rounded-lg p-3"
                      >
                        <p className="text-xs text-muted-foreground">
                          Remove this payment? Only do this if it was entered by mistake.
                        </p>
                        <Button type="submit" variant="destructive" size="sm">
                          Yes, remove it
                        </Button>
                      </form>
                    </details>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
