"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteAllRoomPhotos, PHOTO_BUCKET } from "@/lib/room-photos";
import { createClient } from "@/lib/supabase/server";

// Add, edit and delete rooms. The database's Row Level Security decides
// whose rooms these may touch — these functions don't need to check.

type RoomFields = {
  label: string;
  boarder_first_name: string | null;
  boarder_email: string | null;
  due_day: number;
  monthly_amount: number;
  note: string | null;
};

// Turns the form into a room, or returns a plain-English error.
function readRoomForm(formData: FormData): RoomFields | { error: string } {
  const text = (name: string) => String(formData.get(name) ?? "").trim();

  const label = text("label");
  const firstName = text("boarder_first_name");
  const email = text("boarder_email").toLowerCase();
  const dueDay = Number(text("due_day"));
  const amount = Number(text("monthly_amount"));

  if (!label) return { error: "Please give the room a name, like “Room 4”." };
  if (Boolean(firstName) !== Boolean(email)) {
    return { error: "Fill in both the boarder's first name and email, or leave both empty if the room is vacant." };
  }
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
    return { error: "Due day must be a whole number from 1 to 31." };
  }
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Monthly amount must be zero or more." };
  }

  return {
    label,
    boarder_first_name: firstName || null,
    boarder_email: email || null,
    due_day: dueDay,
    monthly_amount: amount,
    note: text("note") || null,
  };
}

export async function createRoom(formData: FormData) {
  const room = readRoomForm(formData);
  if ("error" in room) redirect(`/rooms/new?error=${encodeURIComponent(room.error)}`);

  const supabase = await createClient();
  // landlord_id is filled in by the database with the logged-in user's id.
  const { data, error } = await supabase.from("rooms").insert(room).select("id").single();
  if (error) redirect(`/rooms/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  // Go straight to the new room so photos can be added.
  redirect(`/rooms/${data.id}/edit?saved=1`);
}

export async function updateRoom(id: string, formData: FormData) {
  const room = readRoomForm(formData);
  if ("error" in room) redirect(`/rooms/${id}/edit?error=${encodeURIComponent(room.error)}`);

  const supabase = await createClient();
  const { error } = await supabase.from("rooms").update(room).eq("id", id);
  if (error) redirect(`/rooms/${id}/edit?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  redirect(`/rooms/${id}`);
}

export async function deleteRoom(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Remove the room's photos first, so no files are left behind.
  await deleteAllRoomPhotos(supabase, user.id, id);

  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) redirect(`/rooms/${id}/edit?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/rooms");
  redirect("/rooms");
}

export async function deleteRoomPhoto(roomId: string, path: string) {
  const supabase = await createClient();
  // Storage security rules only let a landlord delete files in her own
  // folder, so a made-up path can't touch anyone else's photos.
  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([path]);
  if (error) redirect(`/rooms/${roomId}/edit?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/rooms/${roomId}/edit`);
  revalidatePath("/");
}
