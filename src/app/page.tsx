import { CalendarDays, Plus, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddFirstRoomIllustration, RoomIllustration } from "@/components/illustrations";
import { coverPhotoUrls } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import {
  dueDateToShow,
  formatDate,
  formatPesos,
  ordinal,
  periodOf,
  roomStatus,
  roomStatusStyle as statusStyle,
  todayInManila,
  type Room,
  type RoomStatus,
} from "@/lib/rooms";
import { TopBar } from "./top-bar";

// Mama Lita's dashboard: every room as a card, with its photo, who rents
// it, when it's due and whether it's paid or overdue.

const statusOrder: RoomStatus[] = ["overdue", "due_soon", "upcoming", "paid", "vacant"];

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only rooms this landlord owns. (Row Level Security enforces this too.)
  const { data, error } = await supabase
    .from("rooms")
    .select("id, label, boarder_first_name, boarder_email, due_day, monthly_amount, note")
    .eq("landlord_id", user.id)
    .order("label");
  const rooms = (data as Room[] | null) ?? [];

  const today = todayInManila();

  // Which rooms have a CONFIRMED payment for this month? (Pending boarder
  // reports don't count until Mama Lita confirms them.)
  const { data: paidRows } = await supabase
    .from("payments")
    .select("room_id")
    .eq("landlord_id", user.id)
    .eq("type", "monthly")
    .eq("status", "confirmed")
    .eq("period", periodOf(today));
  const paidRoomIds = new Set((paidRows ?? []).map((p) => p.room_id as string));

  const roomsWithStatus = rooms.map((room) => {
    const paid = paidRoomIds.has(room.id);
    return { room, status: roomStatus(room, today, paid), due: dueDateToShow(room, today, paid) };
  });
  const photos = await coverPhotoUrls(supabase, user.id, rooms.map((r) => r.id));

  return (
    <>
      <TopBar email={user.email} />

      <main className="flex w-full flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Rooms</h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" aria-hidden />
              Today is {formatDate(today)} · {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
            </p>
          </div>
          <Link href="/rooms/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden />
            Add room
          </Link>
        </div>

        {/* How many rooms are in each state, at a glance. */}
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

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            Could not load rooms: {error.message}
          </p>
        )}

        {!error && rooms.length === 0 && (
          <div className="panel flex flex-col items-center gap-3 rounded-[var(--radius)] px-6 py-14 text-center">
            <AddFirstRoomIllustration className="h-28 w-auto" />
            <p className="font-semibold">No rooms yet</p>
            <p className="text-sm text-muted-foreground">Add your first room to start tracking rent.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {roomsWithStatus.map(({ room, status, due }) => {
            const style = statusStyle[status];
            const photo = photos[room.id];
            return (
              <Link key={room.id} href={`/rooms/${room.id}`} className="group block">
                <Card className="h-full overflow-hidden transition-shadow duration-200 group-hover:shadow-md group-hover:ring-1 group-hover:ring-primary/30">
                  {/* Photo, or an illustration if there's none yet */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-secondary">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- private, short-lived photo links
                      <img src={photo} alt={`Photo of ${room.label}`} className="h-full w-full object-cover" />
                    ) : (
                      <RoomIllustration className="h-full w-full" />
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/5 dark:bg-slate-900/90 dark:text-slate-200 dark:ring-white/10">
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <h2 className="font-semibold tracking-tight">{room.label}</h2>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" aria-hidden />
                          {room.boarder_first_name ?? "No boarder"}
                        </p>
                      </div>
                      <span className="font-semibold tabular-nums">{formatPesos(room.monthly_amount)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                      <span className="text-muted-foreground">Due every {ordinal(room.due_day)}</span>
                      <span className={`font-medium ${style.text}`}>
                        {status === "paid" ? `Next: ${formatDate(due)}` : formatDate(due)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
