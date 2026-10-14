import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Mama Lita's dashboard: every room as a card, with who rents it,
// when it's due and whether it's overdue.

const statusStyle: Record<RoomStatus, { label: string; badge: string; dot: string }> = {
  overdue: {
    label: "Overdue",
    badge: "bg-red-500/15 text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  due_soon: {
    label: "Due soon",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  upcoming: {
    label: "Upcoming",
    badge: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  vacant: {
    label: "Vacant",
    badge: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
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

  return (
    <>
      <TopBar email={user.email} />

      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">Rooms</h1>
            <p className="text-muted-foreground">
              Today is {formatDate(today)} · {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
            </p>
          </div>
          <Link href="/rooms/new" className={buttonVariants({ size: "lg" })}>
            + Add a room
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
          <p className="glass rounded-[var(--radius)] p-8 text-center text-muted-foreground">
            No rooms yet. Tap “+ Add a room” to add your first one.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {roomsWithStatus.map(({ room, status }) => {
            const style = statusStyle[status];
            const due = dueDateInMonth(room.due_day, today.year, today.month);
            return (
              <Link key={room.id} href={`/rooms/${room.id}/edit`} className="group block">
                <Card className="h-full transition-transform duration-200 group-hover:-translate-y-1">
                  <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
                    <CardTitle className="text-xl">{room.label}</CardTitle>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${style.badge}`}>
                      {style.label}
                    </span>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-lg">
                      {room.boarder_first_name ?? <span className="text-muted-foreground">No boarder</span>}
                    </p>
                    <div className="flex items-end justify-between gap-3 border-t border-border pt-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Due</span>
                        <span className="font-medium">
                          {formatDate(due)}{" "}
                          <span className="font-normal text-muted-foreground">
                            (every {room.due_day}
                            {ordinalSuffix(room.due_day)})
                          </span>
                        </span>
                      </div>
                      <span className="text-lg font-semibold tabular-nums">{formatPesos(room.monthly_amount)}</span>
                    </div>
                  </CardContent>
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
