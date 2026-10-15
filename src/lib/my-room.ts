import type { SupabaseClient } from "@supabase/supabase-js";
import type { Room } from "./rooms";

export type BoarderRoom = Room & { landlord_id: string };

// The room whose boarder_email is the logged-in user's email, if any.
// If there is one, this user is a boarder and sees the boarder screens.
// (Row Level Security only ever lets a boarder read their own room.)
export async function findMyRoom(supabase: SupabaseClient, email: string | undefined) {
  if (!email) return null;
  const { data } = await supabase
    .from("rooms")
    .select("id, landlord_id, label, boarder_first_name, boarder_email, due_day, monthly_amount, note")
    .eq("boarder_email", email.toLowerCase())
    .limit(1);
  return (data?.[0] as BoarderRoom | undefined) ?? null;
}
