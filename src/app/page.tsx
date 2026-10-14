import { CalendarDays, Plus, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddFirstRoomIllustration, RoomIllustration } from "@/components/illustrations";
import { coverPhotoUrls } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import {
  dueDateInMonth,
  formatDate,
  formatPesos,
  roomStatus,
  todayInManila,
  type Room,
  type RoomStatus,
} from "@/lib/rooms";
import { TopBar } from "./top-bar";

// Mama Lita's dashboard: every room as a card, with its photo, who rents
// it, when it's due and whether it's overdue.

const statusStyle: Record<RoomStatus, { label: string; badge: string; dot: string }> = {
  overdue: {
    label: "Overdue",
    badge: "bg-red-500/90 text-white",
    dot: "bg-red-500",
  },
  due_soon: {
    label: "Due soon",
    badge: "bg-amber-400/90 text-amber-950",
    dot: "bg-amber-500",
  },
  upcoming: {
    label: "Upcoming",
    badge: "bg-indigo-500/90 text-white",
    dot: "bg-indigo-500",
  },
  vacant: {
    label: "Vacant",
    badge: "bg-slate-500/80 text-white",
    dot: "bg-slate-400",
  },
};

const statusOrder: RoomStatus[] = ["overdue", "due_soon", "upcoming", "vacant"];

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
  const roomsWithStatus = rooms.map((room) => ({ room, status: roomStatus(room, today) }));
  const photos = await coverPhotoUrls(supabase, user.id, rooms.map((r) => r.id));

  return (
    <>
      <TopBar email={user.email} />

      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">Rooms</h1>
            <p className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" aria-hidden />
              Today is {formatDate(today)} · {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
            </p>
          </div>
          <Link href="/rooms/new" className={buttonVariants({ size: "lg" })}>
            <Plus className="h-5 w-5" aria-hidden />
            Add a room
          </Link>
        </div>

        {/* How many rooms are in each state, at a glance. */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statusOrder.map((status) => (
            <div key={status} className="glass flex items-center gap-3 rounded-[var(--radius)] px-4 py-3">
              <span className={`h-3 w-3 shrink-0 rounded-full ${statusStyle[status].dot}`} />
              <span className="text-sm text-muted-foreground">{statusStyle[status].label}</span>
              <span className="ml-auto text-2xl font-semibold tabular-nums">
                {roomsWithStatus.filter((r) => r.status === status).length}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <p className="rounded-[var(--radius)] bg-red-500/15 p-3 text-sm text-red-700 dark:text-red-300">
            Could not load rooms: {error.message}
          </p>
        )}

        {!error && rooms.length === 0 && (
          <div className="glass flex flex-col items-center gap-4 rounded-[var(--radius)] p-10 text-center">
            <AddFirstRoomIllustration className="h-36 w-auto" />
            <p className="text-lg font-medium">No rooms yet</p>
            <p className="text-muted-foreground">Tap “Add a room” to add your first one.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {roomsWithStatus.map(({ room, status }) => {
            const style = statusStyle[status];
            const due = dueDateInMonth(room.due_day, today.year, today.month);
            const photo = photos[room.id];
            return (
              <Link key={room.id} href={`/rooms/${room.id}/edit`} className="group block">
                <Card className="h-full overflow-hidden transition-transform duration-200 group-hover:-translate-y-1">
                  {/* Photo, or an illustration if there's none yet */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- private, short-lived photo links
                      <img
                        src={photo}
                        alt={`Photo of ${room.label}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <RoomIllustration className="h-full w-full" />
                    )}
                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${style.badge}`}
                    >
                      {style.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-semibold tracking-tight">{room.label}</h2>
                      <span className="text-lg font-semibold tabular-nums">{formatPesos(room.monthly_amount)}</span>
                    </div>
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                      {room.boarder_first_name ?? <span className="text-muted-foreground">No boarder</span>}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" aria-hidden />
                      <span>
                        Due <span className="font-medium text-foreground">{formatDate(due)}</span> · every{" "}
                        {room.due_day}
                        {ordinalSuffix(room.due_day)}
                      </span>
                    </p>
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

function ordinalSuffix(n: number) {
  if (n >= 11 && n <= 13) return "th";
  return ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
}
