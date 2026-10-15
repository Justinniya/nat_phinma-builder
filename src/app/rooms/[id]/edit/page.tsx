import { Trash2 } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Notice, PageContainer, PageHeader, TwoColumn } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listRoomPhotos, roomFolder } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";
import { ROOM_COLUMNS, type Room } from "@/lib/rooms";
import { TopBar } from "../../../top-bar";
import { deleteRoom, deleteRoomPhoto, updateRoom } from "../../actions";
import { RoomForm } from "../../room-form";
import { PhotoUploader } from "./photo-uploader";

// Edit a room: the form on the left; photos and "delete room" on the right.

export default async function EditRoomPage({ params, searchParams }: PageProps<"/rooms/[id]/edit">) {
  const { id } = await params;
  const { error, saved } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: room } = await supabase
    .from("rooms")
    .select(ROOM_COLUMNS)
    .eq("id", id)
    .eq("landlord_id", user.id)
    .maybeSingle<Room>();
  if (!room) notFound();

  const photos = await listRoomPhotos(supabase, user.id, room.id);

  return (
    <>
      <TopBar email={user.email} />
      <PageContainer>
        <PageHeader
          back={{ href: `/rooms/${room.id}`, label: room.label }}
          title={`Edit ${room.label}`}
          description="Change the amount when utilities change. To mark the room vacant, clear the boarder's name and email."
        />

        {saved && <Notice tone="success">{room.label} is saved. Add some photos, or go back to the room.</Notice>}

        <TwoColumn
          main={
            <Card>
              <CardContent className="pt-6">
                <RoomForm
                  action={updateRoom.bind(null, room.id)}
                  room={room}
                  error={typeof error === "string" ? error : undefined}
                  submitLabel="Save changes"
                />
              </CardContent>
            </Card>
          }
          side={
            <>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Photos</CardTitle>
                  <CardDescription>The first photo is shown on the room&apos;s card.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((photo, i) => (
                        <div key={photo.path} className="relative overflow-hidden rounded-lg border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element -- private, short-lived photo links */}
                          <img src={photo.url} alt={`${room.label}, photo ${i + 1}`} className="aspect-square w-full object-cover" />
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
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-900">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
                  <CardDescription>
                    Deleting removes {room.label}, its photos and its whole payment history for good.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Hidden behind a second tap so it can't happen by accident. */}
                  <details>
                    <summary className="cursor-pointer list-none text-sm font-medium text-destructive hover:underline">
                      Delete this room…
                    </summary>
                    <form action={deleteRoom.bind(null, room.id)} className="mt-3">
                      <Button type="submit" variant="destructive" className="w-full">
                        Yes, delete {room.label}
                      </Button>
                    </form>
                  </details>
                </CardContent>
              </Card>
            </>
          }
        />
      </PageContainer>
    </>
  );
}
