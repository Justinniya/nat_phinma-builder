import type { SupabaseClient } from "@supabase/supabase-js";
import {
  confirmedPeriods,
  previousPeriod,
  roomDue,
  ROOM_COLUMNS,
  todayInManila,
  type Room,
  type RoomDue,
} from "./rooms";

export type RoomWithDue = RoomDue & { room: Room };

// Every room this landlord owns, with its status worked out — used by
// both the Dashboard and the Rooms page so they always agree.
export async function loadLandlordRooms(supabase: SupabaseClient, landlordId: string) {
  const today = todayInManila();

  // Row Level Security also limits this to her own rooms.
  const { data, error } = await supabase.from("rooms").select(ROOM_COLUMNS).eq("landlord_id", landlordId);
  // Sort the way people count: Room 1, Room 2 … Room 10 (not Room 1, Room 10, Room 2).
  const rooms = ((data as Room[] | null) ?? []).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true }),
  );

  // Which months each room has a CONFIRMED payment for — this month and
  // last month are all the status needs.
  const { data: paidRows } = await supabase
    .from("payments")
    .select("room_id, type, status, period")
    .eq("landlord_id", landlordId)
    .eq("type", "monthly")
    .eq("status", "confirmed")
    .gte("period", previousPeriod(today));

  const roomsWithDue: RoomWithDue[] = rooms.map((room) => ({
    room,
    ...roomDue(room, today, confirmedPeriods((paidRows ?? []).filter((p) => p.room_id === room.id))),
  }));

  return { today, rooms: roomsWithDue, error };
}
