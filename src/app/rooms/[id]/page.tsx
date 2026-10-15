import { Banknote, CalendarDays, Mail, Pencil, Plus, User } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentHistory } from "@/components/payment-history";
import { RoomIllustration } from "@/components/illustrations";
import { PAYMENT_COLUMNS, type Payment } from "@/lib/payments";
import { listRoomPhotos } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import {
  dueDateToShow,
  formatDate,
  formatPesos,
  ordinal,
  periodOf,
  roomStatus,
  roomStatusStyle,
  todayInManila,
  type Room,
} from "@/lib/rooms";
import { TopBar } from "../../top-bar";

// One room: its details, this month's status, and every payment ever
// recorded for it — so "did I pay in August?" takes seconds to answer.

export default async function RoomPage({ params, searchParams }: PageProps<"/rooms/[id]">) {
  const { id } = await params;
  const { recorded, error } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: room } = await supabase
    .from("rooms")
    .select("id, label, boarder_first_name, boarder_email, due_day, monthly_amount, note")
    .eq("id", id)
    .eq("landlord_id", user.id)
    .maybeSingle<Room>();
  if (!room) notFound();

  const { data } = await supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .eq("room_id", room.id)
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false });
  const payments = (data as Payment[] | null) ?? [];

  const [cover] = await listRoomPhotos(supabase, user.id, room.id);

  const today = todayInManila();
  const thisPeriod = periodOf(today);
  const paidThisMonth = payments.some(
    (p) => p.type === "monthly" && p.status === "confirmed" && p.period === thisPeriod,
  );
  const status = roomStatus(room, today, paidThisMonth);
  const style = roomStatusStyle[status];

  const due = dueDateToShow(room, today, paidThisMonth);

  return (
    <>
      <TopBar email={user.email} />
      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← All rooms
        </Link>

        {recorded && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            Payment saved.
          </p>
        )}
        {typeof error === "string" && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr] lg:gap-10">
          {/* Left: the room */}
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
                <h1 className="text-2xl font-semibold tracking-tight">{room.label}</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium">
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
              </div>

              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <dt className="sr-only">Boarder</dt>
                  <dd>{room.boarder_first_name ?? <span className="text-muted-foreground">No boarder</span>}</dd>
                </div>
                {room.boarder_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <dt className="sr-only">Email</dt>
                    <dd className="truncate">{room.boarder_email}</dd>
                  </div>
                )}
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
                  <dt className="sr-only">Monthly amount</dt>
                  <dd>
                    <span className="font-medium">{formatPesos(room.monthly_amount)}</span>
                    <span className="text-muted-foreground"> a month</span>
                  </dd>
                </div>
              </dl>

              {room.note && <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">{room.note}</p>}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href={`/rooms/${room.id}/pay`} className={buttonVariants({ size: "lg", className: "flex-1" })}>
                  <Plus className="h-4 w-4" aria-hidden />
                  Record payment
                </Link>
                <Link href={`/rooms/${room.id}/edit`} className={buttonVariants({ variant: "outline", size: "lg" })}>
                  <Pencil className="h-4 w-4" aria-hidden />
                  Edit room
                </Link>
              </div>
            </div>
          </Card>

          {/* Right: payment history */}
          <PaymentHistory
            payments={payments}
            removableForRoomId={room.id}
            emptyText={`No payments yet. Tap “Record payment” when ${room.boarder_first_name ?? "the boarder"} pays.`}
          />
        </div>
      </main>
    </>
  );
}
