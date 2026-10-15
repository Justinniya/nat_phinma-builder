import { Check, X } from "lucide-react";
import { confirmPayment, rejectPayment } from "@/app/reports/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";

// Confirm / Reject for one pending boarder report. Shown wherever a
// pending report appears: Dashboard, Payments page, a room's history.
// `returnTo` = the page to come back to afterwards.
export function ConfirmReject({ paymentId, returnTo }: { paymentId: string; returnTo: string }) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      <form action={confirmPayment.bind(null, paymentId, returnTo)}>
        <SubmitButton size="sm" pendingText="Confirming…" className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Check className="h-4 w-4" aria-hidden />
          Confirm
        </SubmitButton>
      </form>

      {/* Reject needs a reason, so it opens a small box first. */}
      <details>
        <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-[var(--radius)] border border-border px-3 text-sm font-medium hover:bg-secondary">
          <X className="h-4 w-4" aria-hidden />
          Reject
        </summary>
        <form action={rejectPayment.bind(null, paymentId, returnTo)} className="mt-2 flex w-full flex-col gap-2 sm:w-64">
          <Input name="reason" placeholder="e.g. Not received yet" required maxLength={200} />
          <SubmitButton variant="destructive" size="sm" pendingText="Rejecting…">
            Reject with this reason
          </SubmitButton>
        </form>
      </details>
    </div>
  );
}
