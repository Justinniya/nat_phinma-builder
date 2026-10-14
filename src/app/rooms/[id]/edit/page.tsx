import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Room } from "@/lib/rooms";
import { deleteRoom, updateRoom } from "../../actions";
import { RoomForm } from "../../room-form";

export default async function EditRoomPage({ params, searchParams }: PageProps<"/rooms/[id]/edit">) {
  const { id } = await params;
  const { error } = await searchParams;

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

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Edit {room.label}</h1>
      <RoomForm
        action={updateRoom.bind(null, room.id)}
        room={room}
        error={typeof error === "string" ? error : undefined}
        submitLabel="Save changes"
      />

      {/* Delete is hidden behind a second tap so it can't happen by accident. */}
      <details className="rounded-[var(--radius)] border border-border p-4">
        <summary className="cursor-pointer text-sm font-medium text-destructive">Delete this room</summary>
        <form action={deleteRoom.bind(null, room.id)} className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">This removes {room.label} for good.</p>
          <Button type="submit" variant="destructive">
            Yes, delete {room.label}
          </Button>
        </form>
      </details>
    </main>
  );
}
