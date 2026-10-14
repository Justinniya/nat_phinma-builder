import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createRoom } from "../actions";
import { RoomForm } from "../room-form";

export default async function NewRoomPage({ searchParams }: PageProps<"/rooms/new">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Add a room</h1>
      <RoomForm
        action={createRoom}
        error={typeof error === "string" ? error : undefined}
        submitLabel="Save room"
      />
    </main>
  );
}
