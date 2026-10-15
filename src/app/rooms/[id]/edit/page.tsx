import { Camera, Trash2 } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listRoomPhotos, roomFolder } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import type { Room } from "@/lib/rooms";
import { TopBar } from "../../../top-bar";
import { deleteRoom, deleteRoomPhoto, updateRoom } from "../../actions";
import { RoomForm } from "../../room-form";
import { PhotoUploader } from "./photo-uploader";

export default async function EditRoomPage({ params, searchParams }: PageProps<"/rooms/[id]/edit">) {
  const { id } = await params;
  const { error, saved } = await searchParams;

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

  const photos = await listRoomPhotos(supabase, user.id, room.id);

  return (
    <>
      <TopBar email={user.email} />
      <main className="grid w-full flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-10 lg:px-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {saved && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                {room.label} is saved. Add some photos below, or go back to Rooms.
              </p>
            )}
            <h1 className="text-3xl font-semibold tracking-tight">Edit {room.label}</h1>
            <p className="text-muted-foreground">
              Change the amount when this month&apos;s utilities change. To mark the room vacant,
              clear the boarder&apos;s name and email.
            </p>
          </div>

          {/* Photos */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" aria-hidden />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo, i) => (
                    <div key={photo.path} className="group relative overflow-hidden rounded-[var(--radius)]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- private, short-lived photo links */}
                      <img
                        src={photo.url}
                        alt={`${room.label}, photo ${i + 1}`}
                        className="aspect-square w-full object-cover"
                      />
                      {i === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm">
                          Cover
                        </span>
                      )}
                      <form action={deleteRoomPhoto.bind(null, room.id, photo.path)} className="absolute right-2 top-2">
                        <Button
                          type="submit"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          aria-label={`Delete photo ${i + 1}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
              <PhotoUploader folder={roomFolder(user.id, room.id)} />
              <p className="text-xs text-muted-foreground">The first photo is shown on the room&apos;s card.</p>
            </CardContent>
          </Card>

          {/* Delete is hidden behind a second tap so it can't happen by accident. */}
          <details className="panel rounded-[var(--radius)] p-4">
            <summary className="cursor-pointer text-sm font-medium text-destructive">Delete this room</summary>
            <form action={deleteRoom.bind(null, room.id)} className="mt-4 flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">This removes {room.label}, its photos and its whole payment history for good.</p>
              <Button type="submit" variant="destructive">
                Yes, delete {room.label}
              </Button>
            </form>
          </details>
        </div>

        <Card className="h-fit">
          <CardContent className="pt-6">
            <RoomForm
              action={updateRoom.bind(null, room.id)}
              room={room}
              error={typeof error === "string" ? error : undefined}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
