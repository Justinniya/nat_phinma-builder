import { ArrowRight, CircleCheck, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Notice, PageContainer, PageHeader, RoomStatusBadge, Section } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadLandlordRooms } from "@/lib/landlord-rooms";
import { findMyRoom, isLandlord } from "@/lib/my-room";
import { PAYMENT_COLUMNS } from "@/lib/payments";
import { formatDate, formatPeriod, formatPesos, isoDate, periodOf, roomStatusStyle, type RoomStatus } from "@/lib/rooms";
import { createClient } from "@/lib/supabase/server";
import { BoarderHome } from "./boarder-home";
import { NotLinked } from "./not-linked";
import { ToConfirm, type PendingReport } from "./to-confirm";
import { LandlordShell } from "./landlord-shell";

// Mama Lita's Dashboard: only what needs her attention today.
//   Overview        — how many rooms are in each state (tap to see them)
//   To confirm      — boarder reports waiting for her
//   Needs attention — overdue and due-soon rooms
// Every room, with photos, lives on the Rooms page (/rooms).

const statusOrder: RoomStatus[] = ["overdue", "due_soon", "upcoming", "paid", "vacant"];

export default async function Dashboard({ searchParams }: PageProps<"/">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Who is this? Landlords are checked FIRST, so nobody can turn a
  // landlord into a "boarder" by typing her email on a room.
  // Then boarders (their email is saved on a room). Anyone else isn't
  // linked to a room yet.
  const { reported, confirmed, rejected, error: actionError } = await searchParams;
  if (!(await isLandlord(supabase, user.id))) {
    const myRoom = await findMyRoom(supabase, user.email);
    if (myRoom) return <BoarderHome room={myRoom} reported={Boolean(reported)} />;
    return <NotLinked email={user.email} />;
  }

  // Boarder reports still waiting for Mama Lita, oldest first.
  const { data: pendingRows } = await supabase
    .from("payments")
    .select(`${PAYMENT_COLUMNS}, rooms(label, boarder_first_name)`)
    .eq("landlord_id", user.id)
    .eq("status", "pending")
    .order("created_at");
  const pending = (pendingRows as PendingReport[] | null) ?? [];

  const { today, rooms, error } = await loadLandlordRooms(supabase, user.id);

  // This month's money: rent expected from occupied rooms vs. rent
  // actually confirmed for this month.
  const thisPeriod = periodOf(today);
  const { data: paidThisMonth } = await supabase
    .from("payments")
    .select("room_id, amount")
    .eq("landlord_id", user.id)
    .eq("type", "monthly")
    .eq("status", "confirmed")
    .eq("period", thisPeriod);
  const occupied = rooms.filter((r) => r.room.boarder_email);
  const expected = occupied.reduce((sum, r) => sum + Number(r.room.monthly_amount), 0);
  const collected = (paidThisMonth ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const paidRoomIds = new Set((paidThisMonth ?? []).map((p) => p.room_id as string));
  const roomsPaid = occupied.filter((r) => paidRoomIds.has(r.room.id)).length;
  const percent = expected > 0 ? Math.min(100, Math.round((collected / expected) * 100)) : 0;

  // Overdue first, then due soon; earliest due date first within each.
  const attention = rooms
    .filter((r) => r.status === "overdue" || r.status === "due_soon")
    .sort((a, b) =>
      a.status === b.status ? isoDate(a.due).localeCompare(isoDate(b.due)) : a.status === "overdue" ? -1 : 1,
    );

  return (
    <LandlordShell userId={user.id} email={user.email} active="dashboard">
      <PageContainer>
        <PageHeader
          title="Dashboard"
          description={`Today is ${formatDate(today)} · ${rooms.length} ${rooms.length === 1 ? "room" : "rooms"}`}
          actions={
            <Link href="/rooms/new" className={buttonVariants({ variant: "outline" })}>
              <Plus className="h-4 w-4" aria-hidden />
              Add room
            </Link>
          }
        />

        {confirmed && <Notice tone="success">Payment confirmed.</Notice>}
        {rejected && <Notice tone="info">Report rejected. The boarder will see your reason.</Notice>}
        {typeof actionError === "string" && <Notice tone="error">{actionError}</Notice>}
        {error && <Notice tone="error">Could not load rooms: {error.message}</Notice>}

        <Section title="This month">
          <div className="panel flex flex-col gap-4 rounded-[var(--radius)] p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{formatPeriod(thisPeriod)} rent collected</span>
                <span className="text-3xl font-semibold tabular-nums tracking-tight">
                  {formatPesos(collected)}
                  <span className="text-base font-normal text-muted-foreground"> of {formatPesos(expected)}</span>
                </span>
              </div>
              <span className="text-sm font-medium tabular-nums text-muted-foreground">{percent}%</span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Rent collected this month"
            >
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              {roomsPaid} of {occupied.length} rented {occupied.length === 1 ? "room" : "rooms"} paid
              {expected > collected && <> · <span className="font-medium text-foreground">{formatPesos(expected - collected)}</span> still to collect</>}
            </p>
          </div>
        </Section>

        <Section title="Overview">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {statusOrder.map((status) => (
              <Link
                key={status}
                href={`/rooms?status=${status}`}
                className="panel relative flex flex-col gap-2 overflow-hidden rounded-[var(--radius)] p-5 pl-6 transition-shadow hover:shadow-md hover:ring-1 hover:ring-primary/30"
              >
                <span className={`absolute inset-y-0 left-0 w-1.5 ${roomStatusStyle[status].stripe}`} aria-hidden />
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${roomStatusStyle[status].dot}`} />
                  {roomStatusStyle[status].label}
                </span>
                <span className="text-3xl font-semibold tabular-nums tracking-tight">
                  {rooms.filter((r) => r.status === status).length}
                </span>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          title="To confirm"
          description="Payments boarders reported. Confirm once the money is with you."
          aside={
            pending.length > 0 && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                {pending.length} waiting
              </span>
            )
          }
        >
          <ToConfirm reports={pending} />
        </Section>

        <Section
          title="Needs attention"
          description="Rooms that are overdue or due within 5 days."
          aside={
            <Link href="/rooms" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              All rooms
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        >
          <Card>
            {attention.length === 0 ? (
              <p className="flex items-center gap-3 px-6 py-5 text-sm text-muted-foreground">
                <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                All caught up. No room is overdue or due soon.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {attention.map(({ room, status, due, period }) => (
                  <li key={room.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={`/rooms/${room.id}`} className="flex min-w-0 flex-col gap-0.5 hover:underline">
                      <span className="font-medium">
                        {room.label}
                        <span className="font-normal text-muted-foreground"> · {room.boarder_first_name}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatPesos(room.monthly_amount)} for {formatPeriod(period)} · due{" "}
                        <span className={roomStatusStyle[status].text}>{formatDate(due)}</span>
                      </span>
                    </Link>
                    <div className="flex items-center gap-3">
                      <RoomStatusBadge status={status} />
                      <Link href={`/rooms/${room.id}/pay`} className={buttonVariants({ size: "sm", variant: "outline" })}>
                        Record payment
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Section>
      </PageContainer>
    </LandlordShell>
  );
}
