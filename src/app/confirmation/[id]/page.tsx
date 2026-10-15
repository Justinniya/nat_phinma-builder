import { BadgeCheck, House } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DetailRow } from "@/components/layout";
import { getLandlordName } from "@/lib/my-room";
import { methodLabel, PAYMENT_COLUMNS, typeLabel, type Payment } from "@/lib/payments";
import { formatPeriod, formatPesos, parseDate } from "@/lib/rooms";
import { createClient } from "@/lib/supabase/server";

// A payment confirmation the boarder can screenshot and keep — proof that
// the landlord confirmed receiving the money.
// NOT an "Official Receipt": in the Philippines that's a regulated BIR
// document. This is a record from the app, and says so.
// Who can open it is decided by Row Level Security: a boarder only their
// own payments, a landlord only her rooms' payments.

type Row = Payment & { landlord_id: string; rooms: { label: string; boarder_first_name: string | null } | null };

export default async function ConfirmationPage({ params }: PageProps<"/confirmation/[id]">) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("payments")
    .select(`${PAYMENT_COLUMNS}, landlord_id, rooms(label, boarder_first_name)`)
    .eq("id", id)
    .maybeSingle();
  const payment = data as Row | null;
  if (!payment) notFound();

  const landlordName = await getLandlordName(supabase, payment.landlord_id);
  const paidOn = parseDate(payment.paid_on);
  const paidOnText = new Date(Date.UTC(paidOn.year, paidOn.month - 1, paidOn.day)).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  // A short, readable reference made from the payment's id.
  const reference = payment.id.slice(0, 8).toUpperCase();

  return (
    <main className="flex w-full flex-1 flex-col items-center gap-6 bg-page px-4 py-10">
      <Link href="/" className="self-start text-sm font-medium text-muted-foreground hover:text-primary sm:self-center">
        ← Back
      </Link>

      <article className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-border">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 bg-brand px-6 py-5 text-white dark:bg-primary">
          <span className="flex items-center gap-2 font-semibold">
            <House className="h-4 w-4" aria-hidden />
            Rent Ledger
          </span>
          <span className="text-xs text-white/70">Ref {reference}</span>
        </header>

        {payment.status === "confirmed" ? (
          <>
            <div className="flex flex-col items-center gap-2 border-b border-border px-6 py-6 text-center">
              <BadgeCheck className="h-10 w-10 text-emerald-600" aria-hidden />
              <h1 className="text-lg font-semibold">Payment confirmed</h1>
              <p className="text-3xl font-semibold tabular-nums tracking-tight">{formatPesos(payment.amount)}</p>
              <p className="text-sm text-muted-foreground">
                {payment.type === "monthly" && payment.period
                  ? `Rent for ${formatPeriod(payment.period)}`
                  : typeLabel[payment.type]}
              </p>
            </div>

            <dl className="divide-y divide-border px-6">
              <DetailRow label="Room">{payment.rooms?.label ?? "—"}</DetailRow>
              <DetailRow label="Boarder">{payment.rooms?.boarder_first_name ?? "—"}</DetailRow>
              <DetailRow label="Date paid">{paidOnText}</DetailRow>
              <DetailRow label="Method">{methodLabel[payment.method]}</DetailRow>
              {payment.reference_no && <DetailRow label="GCash ref">{payment.reference_no}</DetailRow>}
              {payment.received_by && <DetailRow label="Received by">{payment.received_by}</DetailRow>}
              <DetailRow label="Confirmed by">{landlordName ?? "Landlord"}</DetailRow>
            </dl>

            <p className="border-t border-dashed border-border px-6 py-4 text-center text-xs text-muted-foreground">
              A payment record from Rent Ledger, confirmed by the landlord. Not a BIR official receipt.
              Take a screenshot to keep it.
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <h1 className="text-lg font-semibold">Not confirmed yet</h1>
            <p className="text-sm text-muted-foreground">
              A confirmation is only available once the landlord has confirmed this payment.
            </p>
          </div>
        )}
      </article>
    </main>
  );
}
