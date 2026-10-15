import type { SupabaseClient } from "@supabase/supabase-js";
import { ROOM_COLUMNS, type Room } from "./rooms";

export type BoarderRoom = Room & { landlord_id: string };

// The room whose boarder_email is the logged-in user's email, if any.
// If there is one, this user is a boarder and sees the boarder screens.
// (Row Level Security only ever lets a boarder read their own room.)
export async function findMyRoom(supabase: SupabaseClient, email: string | undefined) {
  if (!email) return null;
  const { data } = await supabase
    .from("rooms")
    .select(`landlord_id, ${ROOM_COLUMNS}`)
    .eq("boarder_email", email.toLowerCase())
    .limit(1);
  return (data?.[0] as BoarderRoom | undefined) ?? null;
}

// Is the logged-in user on the landlords list? (Only landlords can add
// rooms — see supabase/sql/007-security-fixes.sql.) Checked BEFORE the
// boarder check, so a landlord always gets the landlord screens.
export async function isLandlord(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("landlords").select("user_id").eq("user_id", userId).limit(1);
  return (data?.length ?? 0) > 0;
}
