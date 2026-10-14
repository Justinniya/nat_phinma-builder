import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "../../top-bar";
import { createRoom } from "../actions";
import { RoomForm } from "../room-form";

export default async function NewRoomPage({ searchParams }: PageProps<"/rooms/new">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;

  return (
    <>
      <TopBar email={user.email} />
      <main className="grid w-full flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-10 lg:px-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Add a room</h1>
          <p className="text-muted-foreground">
            The due day comes from the boarder&apos;s move-in date. Someone who moved in on the 5th
            pays on the 5th of every month.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <RoomForm
              action={createRoom}
              error={typeof error === "string" ? error : undefined}
              submitLabel="Save room"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
