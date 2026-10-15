import { Plus, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddFirstRoomIllustration, RoomIllustration } from "@/components/illustrations";
import { Notice, PageContainer, PageHeader, RoomStatusBadge, Section } from "@/components/layout";
import { coverPhotoUrls } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import {
  confirmedPeriods,
  formatDate,
  formatPesos,
  ordinal,
  previousPeriod,
  roomDue,
  ROOM_COLUMNS,
  roomStatusStyle as statusStyle,
  todayInManila,
  type Room,
  type RoomStatus,
} from "@/lib/rooms";
import { findMyRoom, isLandlord } from "@/lib/my-room";
import { PAYMENT_COLUMNS } from "@/lib/payments";
import { BoarderHome } from "./boarder-home";
import { NotLinked } from "./not-linked";
import { ToConfirm, type PendingReport } from "./to-confirm";
import { TopBar } from "./top-bar";

// Mama Lita's dashboard, in three sections:
//   Overview   — how many rooms are paid, due soon, overdue…
//   To confirm — boarder reports waiting for her
//   Rooms      — every room as a card

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
    if (myRoom) return <BoarderHome email={user.email} room={myRoom} reported={Boolean(reported)} />;
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

  // Only rooms this landlord owns. (Row Level Security enforces this too.)
  const { data, error } = await supabase.from("rooms").select(ROOM_COLUMNS).eq("landlord_id", user.id);
  // Sort the way people count: Room 1, Room 2 … Room 10 (not Room 1, Room 10, Room 2).
  const rooms = ((data as Room[] | null) ?? []).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true }),
  );

  const today = todayInManila();

  // Which months each room has a CONFIRMED payment for — this month and
  // last month are all the status needs. (Pending boarder reports don't
  // count until Mama Lita confirms them.)
  const { data: paidRows } = await supabase
    .from("payments")
    .select("room_id, type, status, period")
    .eq("landlord_id", user.id)
    .eq("type", "monthly")
    .eq("status", "confirmed")
    .gte("period", previousPeriod(today));

  const roomsWithStatus = rooms.map((room) => {
    const paid = confirmedPeriods((paidRows ?? []).filter((p) => p.room_id === room.id));
    return { room, ...roomDue(room, today, paid) };
  });
  const photos = await coverPhotoUrls(supabase, user.id, rooms.map((r) => r.id));

  return (
    <>
      <TopBar email={user.email} />
      <PageContainer>
        <PageHeader
          title="Dashboard"
          description={`Today is ${formatDate(today)} · ${rooms.length} ${rooms.length === 1 ? "room" : "rooms"}`}
          actions={
            <Link href="/rooms/new" className={buttonVariants()}>
              <Plus className="h-4 w-4" aria-hidden />
              Add room
            </Link>
          }
        />

        {confirmed && <Notice tone="success">Payment confirmed.</Notice>}
        {rejected && <Notice tone="info">Report rejected. The boarder will see your reason.</Notice>}
        {typeof actionError === "string" && <Notice tone="error">{actionError}</Notice>}
        {error && <Notice tone="error">Could not load rooms: {error.message}</Notice>}

        <Section title="Overview">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {statusOrder.map((status) => (
              <div key={status} className="panel flex flex-col gap-2 rounded-[var(--radius)] p-5">
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${statusStyle[status].dot}`} />
                  {statusStyle[status].label}
                </span>
                <span className="text-3xl font-semibold tabular-nums tracking-tight">
                  {roomsWithStatus.filter((r) => r.status === status).length}
                </span>
              </div>
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

        <Section title="Rooms" description="Tap a room to see its payments or record one.">
          {!error && rooms.length === 0 ? (
            <div className="panel flex flex-col items-center gap-3 rounded-[var(--radius)] px-6 py-14 text-center">
              <AddFirstRoomIllustration className="h-28 w-auto" />
              <p className="font-semibold">No rooms yet</p>
              <p className="text-sm text-muted-foreground">Add your first room to start tracking rent.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {roomsWithStatus.map(({ room, status, due }) => {
                const photo = photos[room.id];
                return (
                  <Link key={room.id} href={`/rooms/${room.id}`} className="group block">
                    <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-md group-hover:ring-1 group-hover:ring-primary/30">
                      {/* Photo, or an illustration if there's none yet */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-secondary">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- private, short-lived photo links
                          <img src={photo} alt={`Photo of ${room.label}`} className="h-full w-full object-cover" />
                        ) : (
                          <RoomIllustration className="h-full w-full" />
                        )}
                        <RoomStatusBadge status={status} className="absolute left-3 top-3 shadow-sm" />
                      </div>

                      <div className="flex flex-1 flex-col gap-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-col gap-1">
                            <h3 className="truncate font-semibold tracking-tight">{room.label}</h3>
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              <span className="truncate">{room.boarder_first_name ?? "No boarder"}</span>
                            </p>
                          </div>
                          <span className="font-semibold tabular-nums">{formatPesos(room.monthly_amount)}</span>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm">
                          <span className="text-muted-foreground">Due every {ordinal(room.due_day)}</span>
                          <span className={`font-medium ${statusStyle[status].text}`}>
                            {status === "paid" ? `Next: ${formatDate(due)}` : formatDate(due)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </Section>
      </PageContainer>
    </>
  );
}
