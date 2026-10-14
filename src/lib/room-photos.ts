import type { SupabaseClient } from "@supabase/supabase-js";

// Room photos live in Supabase Storage, in a private bucket, at
//   <landlord id>/<room id>/<file name>
// File names start with the upload time, so sorting by name = oldest first.
// See supabase/sql/004-room-photos-storage.sql for who may see what.

export const PHOTO_BUCKET = "room-photos";

// Links to private photos expire, so nobody can share one forever.
const LINK_SECONDS = 60 * 60;

export type RoomPhoto = { path: string; url: string };

export function roomFolder(landlordId: string, roomId: string) {
  return `${landlordId}/${roomId}`;
}

async function signedUrls(supabase: SupabaseClient, paths: string[]) {
  if (paths.length === 0) return new Map<string, string>();
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, LINK_SECONDS);
  return new Map((data ?? []).filter((d) => d.signedUrl).map((d) => [d.path ?? "", d.signedUrl]));
}

async function listPaths(supabase: SupabaseClient, folder: string, limit = 100) {
  const { data } = await supabase.storage
    .from(PHOTO_BUCKET)
    .list(folder, { limit, sortBy: { column: "name", order: "asc" } });
  return (data ?? []).filter((f) => f.id).map((f) => `${folder}/${f.name}`);
}

// Every photo of one room, oldest first.
export async function listRoomPhotos(
  supabase: SupabaseClient,
  landlordId: string,
  roomId: string,
): Promise<RoomPhoto[]> {
  const paths = await listPaths(supabase, roomFolder(landlordId, roomId));
  const urls = await signedUrls(supabase, paths);
  return paths.flatMap((path) => (urls.has(path) ? [{ path, url: urls.get(path)! }] : []));
}

// The first photo of each room, for the dashboard cards: { roomId: url }.
export async function coverPhotoUrls(
  supabase: SupabaseClient,
  landlordId: string,
  roomIds: string[],
): Promise<Record<string, string>> {
  const firsts = await Promise.all(
    roomIds.map(async (roomId) => ({
      roomId,
      path: (await listPaths(supabase, roomFolder(landlordId, roomId), 1))[0],
    })),
  );
  const withPhoto = firsts.filter((f) => f.path);
  const urls = await signedUrls(supabase, withPhoto.map((f) => f.path));
  return Object.fromEntries(
    withPhoto.filter((f) => urls.has(f.path)).map((f) => [f.roomId, urls.get(f.path)!]),
  );
}

// Used when a room is deleted, so its photos don't stay behind.
export async function deleteAllRoomPhotos(supabase: SupabaseClient, landlordId: string, roomId: string) {
  const paths = await listPaths(supabase, roomFolder(landlordId, roomId));
  if (paths.length > 0) await supabase.storage.from(PHOTO_BUCKET).remove(paths);
}
