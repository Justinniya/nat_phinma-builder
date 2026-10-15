import { Banknote, CalendarDays, Clock, Send } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RoomIllustration } from "@/components/illustrations";
import { PaymentHistory } from "@/components/payment-history";
import type { BoarderRoom } from "@/lib/my-room";
import { PAYMENT_COLUMNS, type Payment } from "@/lib/payments";
import { listRoomPhotos } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import {
  dueDateToShow,
  formatDate,
  formatPeriod,
  formatPesos,
  ordinal,
  periodOf,
  roomStatus,
  roomStatusStyle,
  todayInManila,
} from "@/lib/rooms";
import { TopBar } from "./top-bar";

// What a boarder sees after logging in: only their own room.

export async function BoarderHome({ email, room, reported }: { email: string | undefined; room: BoarderRoom; reported: boolean }) {
  const supabase = await createClient();

  // Row Level Security only returns this boarder's own payments.
  const { data } = await supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .eq("room_id", room.id)
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false });
  const payments = (data as Payment[] | null) ?? [];

  const [cover] = await listRoomPhotos(supabase, room.landlord_id, room.id);

  const today = todayInManila();
  const thisPeriod = periodOf(today);
  const thisMonth = payments.filter((p) => p.type === "monthly" && p.period === thisPeriod);
  const paidThisMonth = thisMonth.some((p) => p.status === "confirmed");
  const waiting = !paidThisMonth && thisMonth.some((p) => p.status === "pending");

  const status = roomStatus(room, today, paidThisMonth);
  const style = roomStatusStyle[status];
  const due = dueDateToShow(room, today, paidThisMonth);

  return (
    <>
      <TopBar email={email} />
      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Hi{room.boarder_first_name ? `, ${room.boarder_first_name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Here&apos;s where you stand for {room.label}.</p>
        </div>

        {reported && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            Thanks! Your payment was sent. It shows as Pending until your landlord confirms it.
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr] lg:gap-10">
          <Card className="h-fit overflow-hidden">
            <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-secondary">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- private, short-lived photo links
                <img src={cover.url} alt={`Photo of ${room.label}`} className="h-full w-full object-cover" />
              ) : (
                <RoomIllustration className="h-full w-full" />
              )}
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight">{room.label}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium">
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
              </div>

              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <dt className="sr-only">Due</dt>
                  <dd>
                    {paidThisMonth ? "Next due " : "Due "}
                    <span className={`font-medium ${style.text}`}>{formatDate(due)}</span>
                    <span className="text-muted-foreground"> · every {ordinal(room.due_day)}</span>
                  </dd>
                </div>
                <div className="flex items-center gap-3">
                  <Banknote className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <dt className="sr-only">Amount</dt>
                  <dd>
                    <span className="font-medium">{formatPesos(room.monthly_amount)}</span>
                    <span className="text-muted-foreground"> a month</span>
                  </dd>
                </div>
              </dl>

              {waiting && (
                <p className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  <Clock className="h-4 w-4 shrink-0" aria-hidden />
                  Your payment for {formatPeriod(thisPeriod)} is waiting for your landlord to confirm.
                </p>
              )}

              {!paidThisMonth && (
                <Link href="/i-paid" className={buttonVariants({ size: "lg" })}>
                  <Send className="h-4 w-4" aria-hidden />
                  I paid
                </Link>
              )}
            </div>
          </Card>

          <PaymentHistory
            payments={payments}
            emptyText="No payments yet. After you pay, tap “I paid” so your landlord can confirm it."
          />
        </div>
      </main>
    </>
  );
}
