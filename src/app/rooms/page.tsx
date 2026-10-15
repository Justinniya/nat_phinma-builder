import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AddFirstRoomIllustration } from "@/components/illustrations";
import { Notice, PageContainer, PageHeader } from "@/components/layout";
import { RoomCard } from "@/components/room-card";
import { buttonVariants } from "@/components/ui/button";
import { loadLandlordRooms } from "@/lib/landlord-rooms";
import { isLandlord } from "@/lib/my-room";
import { coverPhotoUrls } from "@/lib/room-photos";
import { roomStatusStyle, type RoomStatus } from "@/lib/rooms";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { TopBar } from "../top-bar";

// Mama Lita's Rooms page: every room as a card, with tabs to show only
// one status (e.g. just the overdue ones).

const filters: RoomStatus[] = ["overdue", "due_soon", "upcoming", "paid", "vacant"];

export default async function RoomsPage({ searchParams }: PageProps<"/rooms">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await isLandlord(supabase, user.id))) redirect("/");

  const { status: statusParam } = await searchParams;
  const active = filters.find((f) => f === statusParam);

  const { rooms, error } = await loadLandlordRooms(supabase, user.id);
  const shown = active ? rooms.filter((r) => r.status === active) : rooms;
  const photos = await coverPhotoUrls(supabase, user.id, shown.map((r) => r.room.id));

  const tabs = [
    { key: undefined, label: "All", count: rooms.length },
    ...filters.map((f) => ({ key: f, label: roomStatusStyle[f].label, count: rooms.filter((r) => r.status === f).length })),
  ];

  return (
    <>
      <TopBar email={user.email} active="rooms" />
      <PageContainer>
        <PageHeader
          title="Rooms"
          description="Tap a room to see its payments, record one, or edit it."
          actions={
            <Link href="/rooms/new" className={buttonVariants()}>
              <Plus className="h-4 w-4" aria-hidden />
              Add room
            </Link>
          }
        />

        {error && <Notice tone="error">Could not load rooms: {error.message}</Notice>}

        {/* Filter tabs. Plain links, so they work without JavaScript. */}
        <nav className="-mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Filter rooms">
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            return (
              <Link
                key={tab.label}
                href={tab.key ? `/rooms?status=${tab.key}` : "/rooms"}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.key && <span className={cn("h-1.5 w-1.5 rounded-full", roomStatusStyle[tab.key].dot)} />}
                {tab.label}
                <span className={cn("tabular-nums", isActive ? "text-primary-foreground/80" : "text-muted-foreground/70")}>
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </nav>

        {rooms.length === 0 && !error ? (
          <div className="panel flex flex-col items-center gap-3 rounded-[var(--radius)] px-6 py-14 text-center">
            <AddFirstRoomIllustration className="h-28 w-auto" />
            <p className="font-semibold">No rooms yet</p>
            <p className="text-sm text-muted-foreground">Add your first room to start tracking rent.</p>
          </div>
        ) : shown.length === 0 ? (
          <p className="panel rounded-[var(--radius)] px-6 py-10 text-center text-sm text-muted-foreground">
            No rooms are {active ? roomStatusStyle[active].label.toLowerCase() : ""} right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((item) => (
              <RoomCard key={item.room.id} item={item} photoUrl={photos[item.room.id]} />
            ))}
          </div>
        )}
      </PageContainer>
    </>
  );
}
