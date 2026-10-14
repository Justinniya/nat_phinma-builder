import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { logout } from "./login/actions";

// Mama Lita's dashboard: every room as a big card, with who rents it,
// when it's due and whether it's overdue.

const statusStyle: Record<RoomStatus, { label: string; className: string }> = {
  overdue: { label: "Overdue", className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" },
  due_soon: { label: "Due soon", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  upcoming: { label: "Upcoming", className: "bg-secondary text-secondary-foreground" },
  vacant: { label: "Vacant", className: "border border-border text-muted-foreground" },
};

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
  const rooms = data as Room[] | null;

  const today = todayInManila();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Rooms</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action={logout}>
          <Button variant="outline" size="sm">Log out</Button>
        </form>
      </header>

      <Link href="/rooms/new" className={buttonVariants({ size: "lg" })}>
        + Add a room
      </Link>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          Could not load rooms: {error.message}
        </p>
      )}

      {rooms?.length === 0 && (
        <p className="text-center text-muted-foreground">No rooms yet. Add your first room above.</p>
      )}

      <div className="flex flex-col gap-4">
        {rooms?.map((room) => {
          const status = statusStyle[roomStatus(room, today)];
          const due = dueDateInMonth(room.due_day, today.year, today.month);
          return (
            <Link key={room.id} href={`/rooms/${room.id}/edit`} className="block">
              <Card className="transition-colors hover:bg-secondary/50">
                <CardHeader className="flex-row items-center justify-between gap-3 pb-2">
                  <CardTitle>{room.label}</CardTitle>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 text-sm">
                  <p className="text-base">{room.boarder_first_name ?? "No boarder"}</p>
                  <p className="text-muted-foreground">
                    Due {formatDate(due)} (every {room.due_day}
                    {ordinalSuffix(room.due_day)}) · {formatPesos(room.monthly_amount)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

function ordinalSuffix(n: number) {
  if (n >= 11 && n <= 13) return "th";
  return ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
}
